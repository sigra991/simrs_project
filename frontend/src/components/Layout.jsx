import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Dashboard Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-gutter relative z-0">
          {/* decorative background gradients */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-container/10 to-transparent pointer-events-none -z-10"></div>
          
          <div className="max-w-[1600px] mx-auto flex flex-col gap-md">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
