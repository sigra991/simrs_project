import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/rekam-medis');
      setRecords(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch medical records', error);
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await api.get(`/export/pdf/rekam-medis/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RekamMedis_${id}.pdf`); // Server provides better name in headers but this is a fallback
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Gagal mendownload PDF');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Medical Records</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Daftar rekam medis pasien.</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 text-outline font-label-caps text-label-caps uppercase tracking-wider">
                <th className="pb-4 pr-4">Tanggal</th>
                <th className="pb-4 px-4">No RM</th>
                <th className="pb-4 px-4">Nama Pasien</th>
                <th className="pb-4 px-4">Dokter</th>
                <th className="pb-4 px-4">Diagnosa</th>
                <th className="pb-4 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="6" className="py-4 text-center">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="6" className="py-4 text-center">Belum ada rekam medis.</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pr-4 font-data-mono text-outline">
                      {new Date(record.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-4 px-4 font-data-mono text-outline">{record.pendaftaran.pasien.no_rm}</td>
                    <td className="py-4 px-4 font-bold">{record.pendaftaran.pasien.nama}</td>
                    <td className="py-4 px-4 text-on-surface-variant">{record.dokter.nama}</td>
                    <td className="py-4 px-4 truncate max-w-[200px]">{record.diagnosa}</td>
                    <td className="py-4 pl-4 text-right">
                      <button className="text-secondary-container hover:text-white transition-colors mr-3">Detail</button>
                      <button onClick={() => handleDownloadPDF(record.id)} className="text-error hover:text-white transition-colors">Print PDF</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
