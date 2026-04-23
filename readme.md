# SIMRS Core MVP - API Walkthrough & Usage Guide

Sistem Informasi Manajemen Rumah Sakit (SIMRS) REST API telah berhasil diimplementasikan dengan arsitektur MVC, Prisma ORM, dan MySQL. Server berjalan pada **port 5001**.

## 🔑 Akun Default (Seed Data)

| Role | Username | Password | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Kelola User, Inventory, Export Laporan |
| **Resepsionis** | `resepsionis1` | `resepsionis123` | Kelola Pasien & Pendaftaran |
| **Dokter** | `dr.sarah` | `dokter123` | Isi Rekam Medis & Resep Obat |
| **Apoteker** | `apoteker1` | `apoteker123` | Kelola Stok Obat & Lihat Resep |

---

## 🚀 Alur Pelayanan (Workflow)

### 1. Autentikasi (Semua Role)
Gunakan endpoint login untuk mendapatkan JWT Token. Token ini harus dikirimkan di header `Authorization: Bearer <token>` untuk endpoint yang dilindungi.
- **POST** `/api/auth/login`

### 2. Pendaftaran Pasien (Resepsionis/Admin)
- Tambah Pasien: **POST** `/api/pasien` (Auto-generate No RM: `RM-YYYYMMDD-XXXX`)
- Daftar Antrean: **POST** `/api/pendaftaran` (Status awal: `MENUNGGU`)

### 3. Pemeriksaan Medis (Dokter)
- Lihat Antrean: **GET** `/api/pendaftaran/antrean-hari-ini`
- Isi Rekam Medis: **POST** `/api/rekam-medis` (Input diagnosa/tindakan, status antrean otomatis jadi `SELESAI`)
- Buat Resep: **POST** `/api/rekam-medis/:id/resep` (Otomatis memotong stok di tabel Inventory via Prisma Transaction)

### 4. Farmasi & Inventory (Apoteker/Admin)
- Kelola Obat: CRUD `/api/inventory`
- Lihat Resep Hari Ini: **GET** `/api/inventory/resep-hari-ini`

### 5. Pelaporan & Export (Admin)
- Export Excel Kunjungan: **GET** `/api/export/excel/kunjungan?bulan=4&tahun=2026`
- Export PDF Resume Medis: **GET** `/api/export/pdf/rekam-medis/:id`

---

## 🧪 Hasil Testing (Output)

Berikut adalah hasil eksekusi skrip testing otomatis yang mencakup seluruh alur:

```text
--- STARTING API TESTS ---

1. Login Admin...
✅ Admin Login Success

2. Login Resepsionis...
✅ Resepsionis Login Success

3. Create Pasien...
✅ Pasien Created: RM-20260424-0001

4. Create Pendaftaran...
✅ Pendaftaran Created, Status: MENUNGGU

5. Login Dokter...
✅ Dokter Login Success

6. Create Rekam Medis...
✅ Rekam Medis Created (Pendaftaran updated to SELESAI)

7. Get Inventory...
✅ Inventory Fetched, First Item: Antasida Doen

8. Create Resep (Decrements Stock)...
✅ Resep Created: 1 resep berhasil dibuat dan stok inventory telah dikurangi.

9. Check Updated Stock...
✅ Current Stock: 50 (Berhasil dikurangi dari stok awal)

--- ALL TESTS COMPLETED SUCCESSFULLY ---
```

## 🛠️ Cara Menjalankan
1. Pastikan port 5001 tersedia.
2. Jalankan `npm run dev` untuk development mode (menggunakan nodemon).
3. Gunakan Postman atau Thunder Client untuk mencoba endpoint di atas.
