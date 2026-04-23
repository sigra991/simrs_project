import prisma from '../config/prisma.js';

/**
 * POST /api/pendaftaran
 * Buat pendaftaran / antrean baru untuk pasien
 */
export const create = async (req, res) => {
  try {
    const { pasienId, keluhan_awal, kategori_pembayaran, no_bpjs, instansi_bpjs, biaya } = req.body;

    if (!pasienId || !keluhan_awal) {
      return res.status(400).json({
        success: false,
        message: 'pasienId dan keluhan_awal wajib diisi.',
      });
    }

    const pasien = await prisma.pasien.findUnique({ where: { id: pasienId } });
    if (!pasien) {
      return res.status(404).json({
        success: false,
        message: 'Data pasien tidak ditemukan.',
      });
    }

    if (kategori_pembayaran === 'BPJS' && !no_bpjs) {
      return res.status(400).json({
        success: false,
        message: 'Nomor BPJS wajib diisi jika kategori pembayaran BPJS.',
      });
    }

    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        pasienId,
        keluhan_awal,
        status: 'MENUNGGU',
        kategori_pembayaran: kategori_pembayaran || 'UMUM',
        no_bpjs: kategori_pembayaran === 'BPJS' ? no_bpjs : null,
        instansi_bpjs: kategori_pembayaran === 'BPJS' ? instansi_bpjs : null,
        biaya: biaya || null,
      },
      include: {
        pasien: {
          select: { no_rm: true, nama: true, jenis_kelamin: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil dibuat. Status: MENUNGGU.',
      data: pendaftaran,
    });
  } catch (error) {
    console.error('Create pendaftaran error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/pendaftaran/antrean-hari-ini
 * Ambil list antrean hari ini
 */
export const getAntreanHariIni = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const antrean = await prisma.pendaftaran.findMany({
      where: {
        tanggal: { gte: today, lt: tomorrow },
      },
      include: {
        pasien: {
          select: { no_rm: true, nama: true, jenis_kelamin: true, tgl_lahir: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const antreanWithNumber = antrean.map((item, index) => ({
      nomor_antrean: index + 1,
      ...item,
    }));

    return res.status(200).json({
      success: true,
      message: `Antrean hari ini: ${antrean.length} pasien.`,
      data: antreanWithNumber,
    });
  } catch (error) {
    console.error('Get antrean error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/pendaftaran
 * Ambil semua data pendaftaran (dengan pagination & filter)
 */
export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tanggal } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (tanggal) {
      const filterDate = new Date(tanggal);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.tanggal = { gte: filterDate, lt: nextDay };
    }

    const [pendaftaran, total] = await Promise.all([
      prisma.pendaftaran.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          pasien: {
            select: { no_rm: true, nama: true, jenis_kelamin: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pendaftaran.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Data pendaftaran berhasil diambil.',
      data: pendaftaran,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all pendaftaran error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/pendaftaran/:id
 * Ambil detail pendaftaran berdasarkan ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id },
      include: {
        pasien: true,
        rekamMedis: {
          include: {
            dokter: { select: { id: true, nama: true } },
            resep: {
              include: {
                inventory: { select: { kode_obat: true, nama_obat: true, harga: true } },
              },
            },
          },
        },
      },
    });

    if (!pendaftaran) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data pendaftaran berhasil diambil.',
      data: pendaftaran,
    });
  } catch (error) {
    console.error('Get pendaftaran by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/pendaftaran/:id/status
 * Update status antrean (MENUNGGU -> DIPERIKSA -> SELESAI)
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['MENUNGGU', 'DIPERIKSA', 'SELESAI'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus salah satu dari: MENUNGGU, DIPERIKSA, SELESAI.',
      });
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({ where: { id } });
    if (!pendaftaran) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran tidak ditemukan.',
      });
    }

    const updated = await prisma.pendaftaran.update({
      where: { id },
      data: { status },
      include: {
        pasien: { select: { no_rm: true, nama: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Status antrean berhasil diupdate menjadi ${status}.`,
      data: updated,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/pendaftaran/:id/biaya
 * Update biaya secara manual
 */
export const updateBiaya = async (req, res) => {
  try {
    const { id } = req.params;
    const { biaya } = req.body;

    if (biaya === undefined || biaya === null) {
      return res.status(400).json({
        success: false,
        message: 'Biaya wajib diisi.',
      });
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({ where: { id } });
    if (!pendaftaran) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran tidak ditemukan.',
      });
    }

    const updated = await prisma.pendaftaran.update({
      where: { id },
      data: { biaya },
    });

    return res.status(200).json({
      success: true,
      message: 'Biaya berhasil diupdate.',
      data: updated,
    });
  } catch (error) {
    console.error('Update biaya error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};
