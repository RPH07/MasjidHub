import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../partials/Sidebar.jsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';

const AdminLayout = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar untuk desktop */}
      {!isMobile && (
        <div className="hidden md:block w-64">
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header untuk mobile dengan toggle sidebar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
          {isMobile && <Sidebar isMobile={true} />}
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;