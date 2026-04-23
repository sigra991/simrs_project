import prisma from '../config/prisma.js';

/**
 * POST /api/rekam-medis
 * Isi rekam medis (diagnosa & tindakan) berdasarkan ID Pendaftaran
 * Otomatis update status pendaftaran menjadi SELESAI
 */
export const create = async (req, res) => {
  try {
    const { pendaftaranId, diagnosa, tindakan } = req.body;
    const dokterId = req.user.id;

    if (!pendaftaranId || !diagnosa || !tindakan) {
      return res.status(400).json({
        success: false,
        message: 'pendaftaranId, diagnosa, dan tindakan wajib diisi.',
      });
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: { rekamMedis: true },
    });

    if (!pendaftaran) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran tidak ditemukan.',
      });
    }

    if (pendaftaran.rekamMedis) {
      return res.status(409).json({
        success: false,
        message: 'Rekam medis untuk pendaftaran ini sudah ada.',
      });
    }

    // Transaction: buat rekam medis + update status pendaftaran
    const result = await prisma.$transaction(async (tx) => {
      const rekamMedis = await tx.rekamMedis.create({
        data: { pendaftaranId, dokterId, diagnosa, tindakan },
        include: {
          pendaftaran: {
            include: {
              pasien: { select: { no_rm: true, nama: true } },
            },
          },
          dokter: { select: { id: true, nama: true } },
        },
      });

      await tx.pendaftaran.update({
        where: { id: pendaftaranId },
        data: { status: 'SELESAI' },
      });

      return rekamMedis;
    });

    return res.status(201).json({
      success: true,
      message: 'Rekam medis berhasil dibuat. Status pendaftaran diupdate menjadi SELESAI.',
      data: result,
    });
  } catch (error) {
    console.error('Create rekam medis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * POST /api/rekam-medis/:id/resep
 * Buat resep obat + kurangi stok inventory (Prisma Transaction)
 * Body: { items: [{ inventoryId, jumlah, dosis }] }
 */
export const createResep = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items (array of { inventoryId, jumlah, dosis }) wajib diisi.',
      });
    }

    const rekamMedis = await prisma.rekamMedis.findUnique({
      where: { id },
      include: {
        pendaftaran: {
          include: { pasien: { select: { nama: true, no_rm: true } } },
        },
      },
    });

    if (!rekamMedis) {
      return res.status(404).json({
        success: false,
        message: 'Data rekam medis tidak ditemukan.',
      });
    }

    // Validasi semua item sebelum transaction
    for (const item of items) {
      if (!item.inventoryId || !item.jumlah || !item.dosis) {
        return res.status(400).json({
          success: false,
          message: 'Setiap item resep harus memiliki inventoryId, jumlah, dan dosis.',
        });
      }

      const inventory = await prisma.inventory.findUnique({
        where: { id: item.inventoryId },
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: `Obat dengan ID ${item.inventoryId} tidak ditemukan.`,
        });
      }

      if (inventory.stok < item.jumlah) {
        return res.status(400).json({
          success: false,
          message: `Stok obat "${inventory.nama_obat}" tidak cukup. Sisa: ${inventory.stok}, diminta: ${item.jumlah}.`,
        });
      }
    }

    // === PRISMA TRANSACTION: Buat resep + kurangi stok ===
    const result = await prisma.$transaction(async (tx) => {
      const createdResep = [];

      for (const item of items) {
        const resep = await tx.resep.create({
          data: {
            rekamMedisId: id,
            inventoryId: item.inventoryId,
            jumlah: item.jumlah,
            dosis: item.dosis,
          },
          include: {
            inventory: { select: { kode_obat: true, nama_obat: true, harga: true } },
          },
        });

        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: { stok: { decrement: item.jumlah } },
        });

        createdResep.push(resep);
      }

      return createdResep;
    });

    return res.status(201).json({
      success: true,
      message: `${result.length} resep berhasil dibuat dan stok inventory telah dikurangi.`,
      data: {
        rekamMedisId: id,
        pasien: rekamMedis.pendaftaran.pasien,
        resep: result,
      },
    });
  } catch (error) {
    console.error('Create resep error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/rekam-medis
 */
export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rekamMedis, total] = await Promise.all([
      prisma.rekamMedis.findMany({
        skip,
        take: parseInt(limit),
        include: {
          pendaftaran: {
            include: { pasien: { select: { no_rm: true, nama: true } } },
          },
          dokter: { select: { id: true, nama: true } },
          resep: {
            include: { inventory: { select: { kode_obat: true, nama_obat: true } } },
          },
        },
        orderBy: { tanggal: 'desc' },
      }),
      prisma.rekamMedis.count(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Data rekam medis berhasil diambil.',
      data: rekamMedis,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all rekam medis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/rekam-medis/:id
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const rekamMedis = await prisma.rekamMedis.findUnique({
      where: { id },
      include: {
        pendaftaran: { include: { pasien: true } },
        dokter: { select: { id: true, nama: true, username: true } },
        resep: {
          include: { inventory: { select: { kode_obat: true, nama_obat: true, harga: true } } },
        },
      },
    });

    if (!rekamMedis) {
      return res.status(404).json({
        success: false,
        message: 'Data rekam medis tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data rekam medis berhasil diambil.',
      data: rekamMedis,
    });
  } catch (error) {
    console.error('Get rekam medis by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/rekam-medis/pasien/:pasienId
 */
export const getByPasien = async (req, res) => {
  try {
    const { pasienId } = req.params;

    const pasien = await prisma.pasien.findUnique({ where: { id: pasienId } });
    if (!pasien) {
      return res.status(404).json({
        success: false,
        message: 'Data pasien tidak ditemukan.',
      });
    }

    const rekamMedis = await prisma.rekamMedis.findMany({
      where: { pendaftaran: { pasienId } },
      include: {
        pendaftaran: {
          select: { id: true, tanggal: true, keluhan_awal: true, kategori_pembayaran: true, biaya: true },
        },
        dokter: { select: { id: true, nama: true } },
        resep: {
          include: { inventory: { select: { kode_obat: true, nama_obat: true, harga: true } } },
        },
      },
      orderBy: { tanggal: 'desc' },
    });

    return res.status(200).json({
      success: true,
      message: `Riwayat rekam medis pasien ${pasien.nama}.`,
      data: {
        pasien: { id: pasien.id, no_rm: pasien.no_rm, nama: pasien.nama },
        rekamMedis,
      },
    });
  } catch (error) {
    console.error('Get rekam medis by pasien error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};
