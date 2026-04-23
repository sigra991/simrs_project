import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/pasien');
      setPatients(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch patients', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Patients</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Daftar pasien terdaftar.</p>
        </div>
        <button className="bg-primary-container text-on-primary-container font-label-caps px-6 py-2 rounded-full glow-button hover:brightness-110 transition-all items-center gap-2 flex">
          <span className="material-symbols-outlined">person_add</span>
          Add Patient
        </button>
      </div>

      <div className="glass-card rounded-xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 text-outline font-label-caps text-label-caps uppercase tracking-wider">
                <th className="pb-4 pr-4">No RM</th>
                <th className="pb-4 px-4">Nama</th>
                <th className="pb-4 px-4">NIK</th>
                <th className="pb-4 px-4">Jenis Kelamin</th>
                <th className="pb-4 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="py-4 text-center">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan="5" className="py-4 text-center">Belum ada pasien terdaftar.</td></tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pr-4 font-data-mono text-outline">{patient.no_rm}</td>
                    <td className="py-4 px-4 font-bold">{patient.nama}</td>
                    <td className="py-4 px-4 font-data-mono text-on-surface-variant">{patient.nik}</td>
                    <td className="py-4 px-4">{patient.jenis_kelamin}</td>
                    <td className="py-4 pl-4 text-right">
                      <button className="text-secondary-container hover:text-white transition-colors mr-3">Edit</button>
                      <button className="text-error hover:text-white transition-colors">Daftar Antrean</button>
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

export default Patients;
