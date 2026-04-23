import prisma from '../config/prisma.js';

export const create = async (req, res) => {
  try {
    const { kode_obat, nama_obat, stok, harga } = req.body;
    const apotekerId = req.user.id;
    if (!kode_obat || !nama_obat || stok === undefined || !harga) {
      return res.status(400).json({ success: false, message: 'kode_obat, nama_obat, stok, dan harga wajib diisi.' });
    }
    const existing = await prisma.inventory.findUnique({ where: { kode_obat } });
    if (existing) return res.status(409).json({ success: false, message: `Kode obat "${kode_obat}" sudah digunakan.` });
    const inventory = await prisma.inventory.create({
      data: { kode_obat, nama_obat, stok: parseInt(stok), harga, apotekerId },
      include: { apoteker: { select: { id: true, nama: true } } },
    });
    return res.status(201).json({ success: true, message: 'Data obat berhasil ditambahkan.', data: inventory });
  } catch (error) {
    console.error('Create inventory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search ? { OR: [{ kode_obat: { contains: search } }, { nama_obat: { contains: search } }] } : {};
    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({ where, skip, take: parseInt(limit), include: { apoteker: { select: { id: true, nama: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.inventory.count({ where }),
    ]);
    return res.status(200).json({ success: true, data: inventory, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Get all inventory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findUnique({ where: { id: req.params.id }, include: { apoteker: { select: { id: true, nama: true } } } });
    if (!inventory) return res.status(404).json({ success: false, message: 'Data obat tidak ditemukan.' });
    return res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    console.error('Get inventory by id error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_obat, nama_obat, stok, harga } = req.body;
    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Data obat tidak ditemukan.' });
    if (kode_obat && kode_obat !== existing.kode_obat) {
      const dup = await prisma.inventory.findUnique({ where: { kode_obat } });
      if (dup) return res.status(409).json({ success: false, message: `Kode obat "${kode_obat}" sudah digunakan.` });
    }
    const inventory = await prisma.inventory.update({
      where: { id },
      data: { ...(kode_obat && { kode_obat }), ...(nama_obat && { nama_obat }), ...(stok !== undefined && { stok: parseInt(stok) }), ...(harga && { harga }) },
      include: { apoteker: { select: { id: true, nama: true } } },
    });
    return res.status(200).json({ success: true, message: 'Data obat berhasil diupdate.', data: inventory });
  } catch (error) {
    console.error('Update inventory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Data obat tidak ditemukan.' });
    await prisma.inventory.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Data obat berhasil dihapus.' });
  } catch (error) {
    if (error.code === 'P2003') return res.status(400).json({ success: false, message: 'Obat tidak bisa dihapus karena sudah digunakan dalam resep.' });
    console.error('Delete inventory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

export const getResepHariIni = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const resep = await prisma.resep.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      include: {
        inventory: { select: { kode_obat: true, nama_obat: true, harga: true } },
        rekamMedis: { include: { pendaftaran: { include: { pasien: { select: { no_rm: true, nama: true } } } }, dokter: { select: { nama: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json({ success: true, message: `Resep hari ini: ${resep.length} item.`, data: resep });
  } catch (error) {
    console.error('Get resep hari ini error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};
