import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import { ChevronRight, Menu } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../lib/utils';

const AdminLayout = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar untuk desktop */}
      {!isMobile && (
        <div className={cn(
          "hidden md:block transition-all duration-300 ease-in-out", 
          isCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar isCollapsed={isCollapsed} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header dengan toggle sidebar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
          {isMobile ? (
            <Sidebar isMobile={true} />
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