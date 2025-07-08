import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ChevronRight, Menu } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';

const UserLayout = () => {
  const { user, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;