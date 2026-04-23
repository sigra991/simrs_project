import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Inventory Farmasi</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Manajemen stok obat.</p>
        </div>
        <button className="bg-primary-container text-on-primary-container font-label-caps px-6 py-2 rounded-full glow-button hover:brightness-110 transition-all items-center gap-2 flex">
          <span className="material-symbols-outlined">add</span>
          Tambah Obat
        </button>
      </div>

      <div className="glass-card rounded-xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-outline font-label-caps text-label-caps uppercase tracking-wider">
                <th className="pb-4 pr-4">Kode Obat</th>
                <th className="pb-4 px-4">Nama Obat</th>
                <th className="pb-4 px-4 text-right">Stok</th>
                <th className="pb-4 px-4 text-right">Harga</th>
                <th className="pb-4 pl-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="py-4 text-center">Loading...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan="5" className="py-4 text-center">Belum ada obat.</td></tr>
              ) : (
                inventory.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pr-4 font-data-mono text-outline">{item.kode_obat}</td>
                    <td className="py-4 px-4 font-bold">{item.nama_obat}</td>
                    <td className={`py-4 px-4 text-right font-data-mono ${item.stok < 50 ? 'text-error font-bold' : ''}`}>
                      {item.stok}
                    </td>
                    <td className="py-4 px-4 text-right font-data-mono">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button className="text-secondary-container hover:text-white transition-colors">Edit Stok</button>
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

export default Inventory;
