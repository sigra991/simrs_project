import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Topbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="flex justify-between items-center px-4 md:px-8 py-3 w-full h-16 bg-surface-container-lowest/60 backdrop-blur-2xl border-b border-white/5 shadow-xl z-30 sticky top-0">
      <div className="flex items-center gap-4 md:gap-6 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-outline hover:text-secondary-container transition-all"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="hidden md:flex gap-6">
          <a href="#" className="font-label-caps text-label-caps uppercase tracking-widest font-bold text-outline hover:text-secondary-container transition-all">ER Status</a>
          <a href="#" className="font-label-caps text-label-caps uppercase tracking-widest font-bold text-outline hover:text-secondary-container transition-all">Shift Swap</a>
          <a href="#" className="font-label-caps text-label-caps uppercase tracking-widest font-bold text-outline hover:text-secondary-container transition-all">Help</a>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex gap-4">
          <button className="text-outline hover:text-secondary-container transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-outline hover:text-secondary-container transition-all hidden sm:block">
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
        </div>
        
        {user && (user.role === 'ADMIN' || user.role === 'RESEPSIONIS') && (
          <button className="hidden sm:flex bg-primary-container text-on-primary-container font-label-caps text-label-caps px-6 py-2 rounded-full glow-button hover:brightness-110 transition-all items-center gap-2">
            Check In Patient
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-data-mono text-sm text-on-surface">{user?.nama}</span>
            <span className="font-label-caps text-[10px] text-outline">{user?.role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-white/10 cursor-pointer overflow-hidden">
             {/* Placeholder profile icon */}
             <span className="material-symbols-outlined text-outline">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
