import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== SEED USERS ====================
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword, nama: 'Administrator', role: 'ADMIN' },
  });

  const dokter = await prisma.user.upsert({
    where: { username: 'dr.sarah' },
    update: {},
    create: { username: 'dr.sarah', password: await bcrypt.hash('dokter123', 10), nama: 'Dr. Sarah Wijaya', role: 'DOKTER' },
  });

  const resepsionis = await prisma.user.upsert({
    where: { username: 'resepsionis1' },
    update: {},
    create: { username: 'resepsionis1', password: await bcrypt.hash('resepsionis123', 10), nama: 'Siti Rahayu', role: 'RESEPSIONIS' },
  });

  const apoteker = await prisma.user.upsert({
    where: { username: 'apoteker1' },
    update: {},
    create: { username: 'apoteker1', password: await bcrypt.hash('apoteker123', 10), nama: 'Budi Santoso, S.Farm', role: 'APOTEKER' },
  });

  console.log('✅ Users seeded:', { admin: admin.username, dokter: dokter.username, resepsionis: resepsionis.username, apoteker: apoteker.username });

  // ==================== SEED INVENTORY (OBAT) ====================
  const obatList = [
    { kode_obat: 'OBT-001', nama_obat: 'Paracetamol 500mg', stok: 200, harga: 5000, apotekerId: apoteker.id },
    { kode_obat: 'OBT-002', nama_obat: 'Amoxicillin 500mg', stok: 150, harga: 8500, apotekerId: apoteker.id },
    { kode_obat: 'OBT-003', nama_obat: 'Ibuprofen 400mg', stok: 100, harga: 7000, apotekerId: apoteker.id },
    { kode_obat: 'OBT-004', nama_obat: 'Cetirizine 10mg', stok: 120, harga: 6000, apotekerId: apoteker.id },
    { kode_obat: 'OBT-005', nama_obat: 'Omeprazole 20mg', stok: 80, harga: 12000, apotekerId: apoteker.id },
    { kode_obat: 'OBT-006', nama_obat: 'Metformin 500mg', stok: 90, harga: 9500, apotekerId: apoteker.id },
    { kode_obat: 'OBT-007', nama_obat: 'Vitamin C 500mg', stok: 300, harga: 3000, apotekerId: apoteker.id },
    { kode_obat: 'OBT-008', nama_obat: 'Antasida Doen', stok: 60, harga: 4500, apotekerId: apoteker.id },
  ];

  for (const obat of obatList) {
    await prisma.inventory.upsert({ where: { kode_obat: obat.kode_obat }, update: {}, create: obat });
  }
  console.log('✅ Inventory (obat) seeded:', obatList.length, 'items');

  // ==================== SEED PASIEN ====================
  const pasien1 = await prisma.pasien.upsert({
    where: { no_rm: 'RM-20250101-0001' },
    update: {},
    create: { no_rm: 'RM-20250101-0001', nama: 'Ahmad Fauzi', nik: '3201234567890001', tgl_lahir: new Date('1990-05-15'), alamat: 'Jl. Merdeka No. 10, Jakarta Pusat', jenis_kelamin: 'Laki-laki' },
  });

  const pasien2 = await prisma.pasien.upsert({
    where: { no_rm: 'RM-20250101-0002' },
    update: {},
    create: { no_rm: 'RM-20250101-0002', nama: 'Dewi Lestari', nik: '3201234567890002', tgl_lahir: new Date('1985-11-20'), alamat: 'Jl. Sudirman No. 25, Bandung', jenis_kelamin: 'Perempuan' },
  });
  console.log('✅ Pasien seeded:', pasien1.nama, ',', pasien2.nama);

  console.log('\n🎉 Seeding selesai!');
  console.log('\n📋 Akun default:');
  console.log('   Admin      -> admin / admin123');
  console.log('   Dokter     -> dr.sarah / dokter123');
  console.log('   Resepsionis-> resepsionis1 / resepsionis123');
  console.log('   Apoteker   -> apoteker1 / apoteker123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
