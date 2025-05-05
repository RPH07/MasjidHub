import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/admin">Beranda</Link>
          <Link to="/admin/kegiatan">Kegiatan</Link>
          <Link to="/admin/keuangan">Flow Kas</Link>
          <Link to="/admin/export">Download Excel</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
