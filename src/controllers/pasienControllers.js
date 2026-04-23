import prisma from '../config/prisma.js';

/**
 * Helper: Generate Nomor Rekam Medis
 * Format: RM-YYYYMMDD-XXXX (auto increment per hari)
 */
const generateNoRM = async () => {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, '0') +
    today.getDate().toString().padStart(2, '0');

  const prefix = `RM-${dateStr}-`;

  const lastPasien = await prisma.pasien.findFirst({
    where: { no_rm: { startsWith: prefix } },
    orderBy: { no_rm: 'desc' },
  });

  let nextNum = 1;
  if (lastPasien) {
    const lastNum = parseInt(lastPasien.no_rm.split('-').pop(), 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${nextNum.toString().padStart(4, '0')}`;
};

/**
 * POST /api/pasien
 * Tambah data pasien baru
 */
export const create = async (req, res) => {
  try {
    const { nama, nik, tgl_lahir, alamat, jenis_kelamin } = req.body;

    if (!nama || !nik || !tgl_lahir || !alamat || !jenis_kelamin) {
      return res.status(400).json({
        success: false,
        message: 'Semua field (nama, nik, tgl_lahir, alamat, jenis_kelamin) wajib diisi.',
      });
    }

    if (!['Laki-laki', 'Perempuan'].includes(jenis_kelamin)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis kelamin harus "Laki-laki" atau "Perempuan".',
      });
    }

    const no_rm = await generateNoRM();

    const pasien = await prisma.pasien.create({
      data: {
        no_rm,
        nama,
        nik,
        tgl_lahir: new Date(tgl_lahir),
        alamat,
        jenis_kelamin,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Data pasien berhasil ditambahkan.',
      data: pasien,
    });
  } catch (error) {
    console.error('Create pasien error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/pasien
 * Ambil semua data pasien (dengan pagination & search)
 */
export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { nama: { contains: search } },
            { no_rm: { contains: search } },
            { nik: { contains: search } },
          ],
        }
      : {};

    const [pasien, total] = await Promise.all([
      prisma.pasien.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pasien.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Data pasien berhasil diambil.',
      data: pasien,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all pasien error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * GET /api/pasien/:id
 * Ambil data pasien berdasarkan ID (include riwayat pendaftaran)
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const pasien = await prisma.pasien.findUnique({
      where: { id },
      include: {
        pendaftaran: {
          orderBy: { tanggal: 'desc' },
          include: {
            rekamMedis: {
              include: {
                dokter: { select: { id: true, nama: true } },
                resep: {
                  include: {
                    inventory: { select: { kode_obat: true, nama_obat: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pasien) {
      return res.status(404).json({
        success: false,
        message: 'Data pasien tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data pasien berhasil diambil.',
      data: pasien,
    });
  } catch (error) {
    console.error('Get pasien by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/pasien/:id
 * Update data pasien
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nik, tgl_lahir, alamat, jenis_kelamin } = req.body;

    const existingPasien = await prisma.pasien.findUnique({ where: { id } });
    if (!existingPasien) {
      return res.status(404).json({
        success: false,
        message: 'Data pasien tidak ditemukan.',
      });
    }

    const pasien = await prisma.pasien.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(nik && { nik }),
        ...(tgl_lahir && { tgl_lahir: new Date(tgl_lahir) }),
        ...(alamat && { alamat }),
        ...(jenis_kelamin && { jenis_kelamin }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Data pasien berhasil diupdate.',
      data: pasien,
    });
  } catch (error) {
    console.error('Update pasien error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/pasien/:id
 * Hapus data pasien
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPasien = await prisma.pasien.findUnique({ where: { id } });
    if (!existingPasien) {
      return res.status(404).json({
        success: false,
        message: 'Data pasien tidak ditemukan.',
      });
    }

    await prisma.pasien.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Data pasien berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete pasien error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message,
    });
  }
};
