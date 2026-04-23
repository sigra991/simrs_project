import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const getLinksForRole = (role) => {
    const links = [];
    
    // Everyone sees Dashboard (but it might look different)
    links.push({ to: '/', icon: 'dashboard', label: 'Dashboard' });

    if (role === 'ADMIN' || role === 'RESEPSIONIS') {
      links.push({ to: '/patients', icon: 'person_add', label: 'Patients' });
    }
    
    if (role === 'ADMIN' || role === 'DOKTER') {
      links.push({ to: '/medical-records', icon: 'medical_services', label: 'Medical Records' });
    }
    
    if (role === 'ADMIN' || role === 'APOTEKER') {
      links.push({ to: '/inventory', icon: 'inventory_2', label: 'Inventory' });
    }
    
    if (role === 'ADMIN') {
      links.push({ to: '/users', icon: 'group', label: 'Users' });
      links.push({ to: '/export', icon: 'download', label: 'Export Reports' });
    }

    return links;
  };

  const links = user ? getLinksForRole(user.role) : [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        flex flex-col h-full p-4 overflow-y-auto w-64 
        border-r border-white/10 shadow-[0_0_15px_rgba(112,0,255,0.1)] 
        bg-surface-container-lowest/95 md:bg-surface-container-lowest/80 backdrop-blur-xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 px-4 flex flex-col items-start gap-2 pt-4 md:pt-0">
          <h1 className="font-h2 text-h2 text-primary-container tracking-tighter italic">MediFlow</h1>
          <span className="font-label-caps text-label-caps text-on-surface-variant">Clinical Unit Alpha</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)} // Close on mobile after clicking
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-body-md transition-all duration-300
                ${isActive 
                  ? 'text-secondary-container bg-secondary-container/10 border-r-4 border-secondary-container font-bold' 
                  : 'text-outline hover:text-on-surface hover:bg-white/5'}
              `}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <button className="w-full py-3 px-4 rounded-lg bg-error-container text-on-error-container font-label-caps text-label-caps font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">emergency</span>
            Emergencies
          </button>
          
          <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
            <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-outline hover:text-on-surface hover:bg-white/5 transition-all duration-300 font-body-md text-body-md">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </a>
            <button 
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-outline hover:text-error hover:bg-white/5 transition-all duration-300 font-body-md text-body-md"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
