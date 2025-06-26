import React, { useState } from 'react';
import Sidebar from '../../components/partials/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, Menu } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  console.log('User data:', user); // Debug

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar untuk desktop */}
      {!isMobile && (
        <div className={cn(
          "hidden md:block transition-all duration-300 ease-in-out", 
          isCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar isCollapsed={isCollapsed} role={user?.role || 'jamaah'} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header dengan toggle sidebar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
          {isMobile ? (
            <Sidebar isMobile={true} role={user?.role || 'jamaah'} />
          ) : (
            <button 
              onClick={toggleSidebar} 
              className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
          <h1 className="text-xl font-bold">Dashboard Jamaah</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-6">
            Assalamualikum, {user?.nama || 'Jamaah'}!
          </h1>

          {/* Ringkasan Statis */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="text-lg font-medium">Total Donasi</div>
              <div className="mt-2 text-2xl font-bold">Rp 1.500.000</div>
              <div className="text-sm text-gray-500">Donasi bulan ini</div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="text-lg font-medium">Total Barang Donasi</div>
              <div className="mt-2 text-2xl font-bold">3 Barang</div>
              <div className="text-sm text-gray-500">Barang yang Anda bantu</div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="text-lg font-medium">Aktivitas Terbaru</div>
              <div className="mt-2 text-sm text-gray-500">Donasi untuk Sound System</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;