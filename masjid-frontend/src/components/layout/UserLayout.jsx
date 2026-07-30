import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { preloadUserDashboardPages } from '@/utils/routePreloaders';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

const dashboardNavItems = [
  { path: '/dashboard', label: 'Ringkasan', exact: true },
  { path: '/dashboard/kegiatan', label: 'Kegiatan' },
  { path: '/dashboard/kontribusi-history', label: 'Riwayat' },
  { path: '/dashboard/profile', label: 'Profil' }
];

const UserLayout = () => {
  const { loading } = useAuth();
  const location = useLocation();
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    preloadUserDashboardPages();
    setNavReady(true);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#1f4d3a]"></div>
          <p className="text-[#5c6b5f]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#1c2620]">
      <Navbar />

      <main className="min-h-screen pt-16">
        <div className="border-b border-[#1c2620]/15 bg-[#f3efe4]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-3">
              {dashboardNavItems.map((item) => {
                const active = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-[#1f4d3a] text-[#1f4d3a]'
                        : 'border-transparent text-[#5c6b5f] hover:text-[#1c2620]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className={navReady ? 'min-h-[calc(100vh-8rem)]' : 'min-h-screen'}>
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserLayout;
