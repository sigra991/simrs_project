import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalPatients: 0, currentQueue: 0, completed: 0, activeDoctors: 12 });
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Get queue for today
      const antreanRes = await api.get('/pendaftaran/antrean-hari-ini');
      const antreanData = antreanRes.data.data || [];
      
      setQueue(antreanData);

      // Calculate stats
      const total = antreanData.length;
      const waiting = antreanData.filter(item => item.status === 'MENUNGGU').length;
      const done = antreanData.filter(item => item.status === 'SELESAI').length;

      setStats({
        totalPatients: total,
        currentQueue: waiting,
        completed: done,
        activeDoctors: 4 // Hardcoded or fetch from users table
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-on-surface p-8">Loading Dashboard...</div>;

  return (
    <>
      <div className="flex justify-between items-end mb-4 flex-wrap gap-4">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Overview</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Live operational metrics for Alpha Unit.</p>
        </div>
        <div className="font-data-mono text-data-mono text-secondary-container flex items-center gap-2 bg-secondary-container/10 px-4 py-2 rounded-full border border-secondary-container/20">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
          SYSTEM ACTIVE
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-primary-container/50 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Total Patients Today</span>
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[18px]">personal_injury</span>
            </div>
          </div>
          <div className="font-h1 text-h1 text-on-surface">{stats.totalPatients}</div>
          <div className="font-data-mono text-data-mono text-secondary-container text-xs flex items-center gap-1 mt-auto">
             Hari ini
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-tertiary-container/50 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-tertiary-container"></div>
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Current Queue</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary-container">
              <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
            </div>
          </div>
          <div className="font-h1 text-h1 text-on-surface">{stats.currentQueue}</div>
          <div className="font-data-mono text-data-mono text-tertiary text-xs flex items-center gap-1 mt-auto">
              MENUNGGU
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-secondary-container/50 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary-container">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="font-h1 text-h1 text-on-surface">{stats.completed}</div>
          <div className="font-data-mono text-data-mono text-secondary-container text-xs flex items-center gap-1 mt-auto">
              SELESAI
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-on-surface/50 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Active Doctors</span>
            <div className="w-8 h-8 rounded-lg bg-surface-bright flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[18px]">stethoscope</span>
            </div>
          </div>
          <div className="font-h1 text-h1 text-on-surface">{stats.activeDoctors}</div>
          <div className="font-data-mono text-data-mono text-outline text-xs flex items-center gap-1 mt-auto">
              ON SHIFT
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Status Table Area (Spans 2 columns) */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="font-h3 text-h3 text-on-surface">Live Queue Status</h3>
            <button className="font-label-caps text-label-caps text-secondary-container hover:text-white transition-colors">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 text-outline font-label-caps text-label-caps uppercase tracking-wider">
                  <th className="pb-4 pr-4">No RM</th>
                  <th className="pb-4 px-4">Patient Name</th>
                  <th className="pb-4 px-4">Keluhan</th>
                  <th className="pb-4 px-4">Category</th>
                  <th className="pb-4 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-white/5">
                {queue.length === 0 ? (
                  <tr><td colSpan="5" className="py-4 text-center text-outline">Tidak ada antrean hari ini</td></tr>
                ) : (
                  queue.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 pr-4 font-data-mono text-data-mono text-outline whitespace-nowrap">{item.pasien.no_rm}</td>
                      <td className="py-4 px-4 font-bold whitespace-nowrap">{item.pasien.nama}</td>
                      <td className="py-4 px-4 text-on-surface-variant truncate max-w-[150px] sm:max-w-xs">{item.keluhan_awal}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-data-mono ${item.kategori_pembayaran === 'BPJS' ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-bright'}`}>
                          {item.kategori_pembayaran}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        {item.status === 'MENUNGGU' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary-container/30 text-xs font-bold font-label-caps tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                            MENUNGGU
                          </span>
                        )}
                        {item.status === 'DIPERIKSA' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary-container border border-secondary-container/30 text-xs font-bold font-label-caps tracking-widest">
                            IN PROGRESS
                          </span>
                        )}
                        {item.status === 'SELESAI' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-bright text-outline border border-white/10 text-xs font-bold font-label-caps tracking-widest">
                            SELESAI
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations Area */}
        <div className="glass-card rounded-xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-h3 text-h3 text-on-surface">Recent Reg</h3>
            <span className="material-symbols-outlined text-outline">history</span>
          </div>
          
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2">
            {queue.slice(0, 5).map(item => (
              <div key={`recent-${item.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center text-on-surface flex-shrink-0">
                  <span className="font-label-caps">
                    {item.pasien.nama.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body-md text-body-md font-bold text-on-surface truncate">{item.pasien.nama}</div>
                  <div className="font-data-mono text-data-mono text-xs text-outline truncate">
                    {new Date(item.tanggal).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {item.kategori_pembayaran}
                  </div>
                </div>
              </div>
            ))}
            {queue.length === 0 && <div className="text-outline text-sm">Belum ada pasien hari ini.</div>}
          </div>

          {/* Decorative Chart Area */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex justify-between items-end mb-2">
              <span className="font-label-caps text-label-caps text-outline">Intake Volume</span>
              <span className="font-data-mono text-data-mono text-secondary-container text-xs">+5.2%</span>
            </div>
            <div className="h-16 flex items-end gap-1 w-full">
              <div className="w-full bg-primary-container/20 rounded-t-sm h-[30%] hover:bg-primary-container/40 transition-colors"></div>
              <div className="w-full bg-primary-container/20 rounded-t-sm h-[45%] hover:bg-primary-container/40 transition-colors"></div>
              <div className="w-full bg-primary-container/20 rounded-t-sm h-[25%] hover:bg-primary-container/40 transition-colors"></div>
              <div className="w-full bg-primary-container/20 rounded-t-sm h-[60%] hover:bg-primary-container/40 transition-colors"></div>
              <div className="w-full bg-primary-container/20 rounded-t-sm h-[80%] hover:bg-primary-container/40 transition-colors"></div>
              <div className="w-full bg-secondary-container/40 rounded-t-sm h-[100%] hover:bg-secondary-container/60 transition-colors relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary-container rounded-full glow-text"></div>
              </div>
              <div className="w-full bg-primary-container/20 rounded-t-sm h-[40%] hover:bg-primary-container/40 transition-colors"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
