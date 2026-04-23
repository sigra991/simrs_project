import React, { useState } from 'react';
import api from '../services/api';

const ExportReports = () => {
  const [downloading, setDownloading] = useState(false);

  const handleExportExcel = async () => {
    try {
      setDownloading(true);
      const response = await api.get('/export/excel/kunjungan', {
        responseType: 'blob', // Important for binary data
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header if possible, or provide default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'Laporan_Kunjungan.xlsx';
      if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mendownload file Excel. Pastikan Anda login sebagai Admin.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-h1 text-h1 text-on-surface">Export Reports</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Unduh laporan kunjungan pasien dan rekam medis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Excel Export Card */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-4 border border-secondary-container/30">
          <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary-container mb-2">
            <span className="material-symbols-outlined text-[24px]">table_chart</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface">Laporan Kunjungan (Excel)</h3>
          <p className="text-on-surface-variant mb-4">Export data seluruh kunjungan pasien bulan ini dalam format Spreadsheet Excel.</p>
          
          <button 
            onClick={handleExportExcel}
            disabled={downloading}
            className="mt-auto py-3 px-4 rounded-lg bg-secondary-container text-on-secondary-container font-label-caps text-label-caps font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">
              {downloading ? 'sync' : 'download'}
            </span>
            {downloading ? 'Downloading...' : 'Download Excel'}
          </button>
        </div>

        {/* PDF Export Card Instruction */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-error/20 flex items-center justify-center text-error mb-2">
            <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface">Resume Medis (PDF)</h3>
          <p className="text-on-surface-variant">
            Export PDF dilakukan per pasien. Anda dapat mengunduh PDF Resume Medis dari halaman detail Rekam Medis pasien bersangkutan.
          </p>
          <div className="mt-auto bg-surface-bright/50 p-4 rounded-lg text-sm text-outline border border-white/5">
            Cari pasien di menu "Medical Records" &gt; Pilih Pasien &gt; Klik "Print PDF".
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;
