import prisma from '../config/prisma.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/**
 * GET /api/export/excel/kunjungan?bulan=4&tahun=2025
 */
export const exportKunjunganExcel = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    const month = parseInt(bulan) || new Date().getMonth() + 1;
    const year = parseInt(tahun) || new Date().getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const pendaftaran = await prisma.pendaftaran.findMany({
      where: { tanggal: { gte: startDate, lt: endDate } },
      include: {
        pasien: { select: { no_rm: true, nama: true, jenis_kelamin: true } },
        rekamMedis: { include: { dokter: { select: { nama: true } } } },
      },
      orderBy: { tanggal: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SIMRS';
    const sheet = workbook.addWorksheet('Kunjungan Pasien');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'No. RM', key: 'no_rm', width: 20 },
      { header: 'Nama Pasien', key: 'nama', width: 25 },
      { header: 'Jenis Kelamin', key: 'jk', width: 15 },
      { header: 'Keluhan', key: 'keluhan', width: 30 },
      { header: 'Kategori', key: 'kategori', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Dokter', key: 'dokter', width: 25 },
      { header: 'Biaya', key: 'biaya', width: 15 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E86AB' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    pendaftaran.forEach((item, index) => {
      sheet.addRow({
        no: index + 1,
        tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
        no_rm: item.pasien.no_rm, nama: item.pasien.nama, jk: item.pasien.jenis_kelamin,
        keluhan: item.keluhan_awal, kategori: item.kategori_pembayaran, status: item.status,
        dokter: item.rekamMedis?.dokter?.nama || '-',
        biaya: item.biaya ? `Rp ${Number(item.biaya).toLocaleString('id-ID')}` : '-',
      });
    });

    const namaBulan = startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Kunjungan_${namaBulan.replace(' ', '_')}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel error:', error);
    return res.status(500).json({ success: false, message: 'Gagal export Excel.', error: error.message });
  }
};

/**
 * GET /api/export/pdf/rekam-medis/:id
 */
export const exportRekamMedisPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const rekamMedis = await prisma.rekamMedis.findUnique({
      where: { id },
      include: {
        pendaftaran: { include: { pasien: true } },
        dokter: { select: { nama: true } },
        resep: { include: { inventory: { select: { kode_obat: true, nama_obat: true, harga: true } } } },
      },
    });

    if (!rekamMedis) return res.status(404).json({ success: false, message: 'Data rekam medis tidak ditemukan.' });

    const pasien = rekamMedis.pendaftaran.pasien;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=RekamMedis_${pasien.no_rm}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('RESUME MEDIS PASIEN', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Sistem Informasi Manajemen Rumah Sakit', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Data Pasien
    doc.fontSize(12).font('Helvetica-Bold').text('DATA PASIEN');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    const c1 = 50, c2 = 170;
    let y = doc.y;
    const fields = [
      ['No. Rekam Medis', pasien.no_rm], ['Nama Pasien', pasien.nama], ['NIK', pasien.nik],
      ['Tanggal Lahir', new Date(pasien.tgl_lahir).toLocaleDateString('id-ID')],
      ['Jenis Kelamin', pasien.jenis_kelamin], ['Alamat', pasien.alamat],
    ];
    fields.forEach(([label, val]) => { doc.text(label, c1, y).text(`: ${val}`, c2, y); y += 16; });
    doc.moveDown(1.5);

    // Data Pemeriksaan
    doc.fontSize(12).font('Helvetica-Bold').text('DATA PEMERIKSAAN');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    y = doc.y;
    doc.text('Tanggal Periksa', c1, y).text(`: ${new Date(rekamMedis.tanggal).toLocaleDateString('id-ID')}`, c2, y); y += 16;
    doc.text('Dokter Pemeriksa', c1, y).text(`: ${rekamMedis.dokter.nama}`, c2, y); y += 16;
    doc.text('Keluhan Awal', c1, y).text(`: ${rekamMedis.pendaftaran.keluhan_awal}`, c2, y);
    doc.moveDown(1);
    doc.text('Diagnosa:', c1); doc.moveDown(0.2);
    doc.text(rekamMedis.diagnosa, c1 + 10, doc.y, { width: 480 });
    doc.moveDown(0.5);
    doc.text('Tindakan:', c1); doc.moveDown(0.2);
    doc.text(rekamMedis.tindakan, c1 + 10, doc.y, { width: 480 });
    doc.moveDown(1.5);

    // Resep Obat
    if (rekamMedis.resep.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('RESEP OBAT');
      doc.moveDown(0.5);
      const tableTop = doc.y;
      const colW = [30, 80, 160, 50, 100, 80];
      const headers = ['No', 'Kode Obat', 'Nama Obat', 'Jumlah', 'Dosis', 'Harga'];
      doc.fontSize(9).font('Helvetica-Bold');
      let xP = c1;
      headers.forEach((h, i) => { doc.text(h, xP, tableTop, { width: colW[i] }); xP += colW[i]; });
      doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).stroke();
      doc.font('Helvetica');
      let rY = tableTop + 20;
      rekamMedis.resep.forEach((item, idx) => {
        xP = c1;
        doc.text(`${idx + 1}`, xP, rY, { width: colW[0] }); xP += colW[0];
        doc.text(item.inventory.kode_obat, xP, rY, { width: colW[1] }); xP += colW[1];
        doc.text(item.inventory.nama_obat, xP, rY, { width: colW[2] }); xP += colW[2];
        doc.text(`${item.jumlah}`, xP, rY, { width: colW[3] }); xP += colW[3];
        doc.text(item.dosis, xP, rY, { width: colW[4] }); xP += colW[4];
        const h = Number(item.inventory.harga) * item.jumlah;
        doc.text(`Rp ${h.toLocaleString('id-ID')}`, xP, rY, { width: colW[5] });
        rY += 16;
      });
      doc.moveTo(50, rY).lineTo(545, rY).stroke();
      const total = rekamMedis.resep.reduce((s, i) => s + Number(i.inventory.harga) * i.jumlah, 0);
      doc.font('Helvetica-Bold').text(`Total: Rp ${total.toLocaleString('id-ID')}`, 400, rY + 6);
    }

    // Footer
    doc.moveDown(3);
    const fY = doc.y;
    doc.fontSize(10).font('Helvetica');
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, c1, fY);
    doc.text('Dokter Pemeriksa,', 380, fY);
    doc.moveDown(3);
    doc.font('Helvetica-Bold').text(rekamMedis.dokter.nama, 380);
    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    return res.status(500).json({ success: false, message: 'Gagal export PDF.', error: error.message });
  }
};
