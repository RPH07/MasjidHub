import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminRoute from '@/components/routeGuard/AdminRoute';
import ProtectedRoute from '@/components/routeGuard/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout'; 
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import RouteError from '@/components/feedback/RouteError';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Toaster } from 'react-hot-toast';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const TransparansiDana = lazy(() => import('@/pages/TransparansiDana'));
const LoginPages = lazy(() => import('@/pages/auth/Login'));
const RegisterPages = lazy(() => import('@/pages/auth/Signup'));
const AdminSignup = lazy(() => import('@/pages/auth/AdminSignup'));
const ZakatForm = lazy(() => import('@/pages/ZakatForm'));
const Crowdfunding = lazy(() => import('@/pages/user/Crowdfunding'));
const UserDashboard = lazy(() => import('@/pages/user/UserDashboard'));
const KontribusiHistory = lazy(() => import('@/pages/user/KontribusiHistory'));
const UserKegiatan = lazy(() => import('@/pages/user/UserKegiatan'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const KegiatanPage = lazy(() => import('@/pages/admin/Kegiatan'));
const KasPage = lazy(() => import('@/pages/admin/Kas.jsx'));
const DonasiPage = lazy(() => import('@/pages/admin/Donasi'));
const UserAccessPage = lazy(() => import('@/pages/admin/UserAccess'));
const VerifikasiTransaksi = lazy(() => import('@/pages/admin/VerifikasiTransaksi'));
const TransparansiAdmin = lazy(() => import('@/pages/admin/TransparansiAdmin'));
const ZakatSettingsPage = lazy(() => import('@/pages/admin/ZakatSettings'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const MAINTENANCE = {
  zakat: import.meta.env.VITE_MAINTENANCE_ZAKAT === 'true',
};


const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-sm text-gray-500">
    Memuat halaman...
  </div>
);

const PageTitle = ({ title, children }) => {
  usePageTitle(title);

  return children;
};

const lazyPage = (element, title) => (
  <PageTitle title={title}>
    <Suspense fallback={<PageLoader />}>
      {element}
    </Suspense>
  </PageTitle>
);

const MaintenanceGuard = ({enabled, children}) => {
  const location = useLocation();

  if (enabled) {
    return (
      <Navigate 
        to='/maintenance'
        replace
        state={{from: location.pathname}}
      />
    );
  }

  return children;
};

const maintenancePage = (key, element, title) => (
  <MaintenanceGuard enabled={MAINTENANCE[key]}>
    {lazyPage(element, title)}
  </MaintenanceGuard>
);

const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: lazyPage(<HomePage />, "Beranda")
      },
      {
        path: "/maintenance",
        element: lazyPage(<Maintenance />, "Maintenance")
      },
      {
        path: "/about",
        element: lazyPage(<About />, "Tentang")
      },
      {
        path: "/contact",
        element: lazyPage(<Contact />, "Kontak")
      },
      {
        path: "/transparansi",
        element: lazyPage(<TransparansiDana />, "Transparansi Dana")
      },
      {
        path: "/login",
        element: lazyPage(<LoginPages />, "Masuk")
      },
      {
        path: "/signup",
        element: lazyPage(<RegisterPages />, "Daftar")
      },
      {
        path: "/admin/signup",
        element: lazyPage(<AdminSignup />, "Daftar Admin")
      },
      {
        path: "/zakat",
        element: maintenancePage('zakat', <ZakatForm />, "Zakat")
      },
      {
        path: "/crowdfunding",
        element: lazyPage(<Crowdfunding />, "Crowdfunding")
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        ),
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            element: lazyPage(<UserDashboard />, "Dashboard")
          },
          {
            path: "zakat",
            element: maintenancePage('zakat', <ZakatForm />, "Zakat")
          },
          {
            path: "crowdfunding",
            element: lazyPage(<Crowdfunding />, "Crowdfunding")
          },
          {
            path: "kegiatan",
            element: lazyPage(<UserKegiatan />, "Kegiatan")
          },
          {
            path: "kontribusi-history",
            element: lazyPage(<KontribusiHistory />, "Riwayat Kontribusi")
          },
          {
            path: "profile",
            element: lazyPage(<ProfilePage />, "Profil")
          }
        ]
      },
      // Admin routes
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          </AdminRoute>
        ),
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            element: lazyPage(<Dashboard />, "Dashboard Admin")
          },
          {
            path: "kegiatan",
            element: lazyPage(<KegiatanPage />, "Kelola Kegiatan")
          },
          {
            path: "kas",
            element: lazyPage(<KasPage />, "Kelola Kas")
          },
          {
            path: "verifikasi-transaksi",
            element: lazyPage(<VerifikasiTransaksi />, "Verifikasi Transaksi")
          },
          {
            path: "transparansi",
            element: lazyPage(<TransparansiAdmin />, "Kelola Transparansi")
          },
          {
            path: "donasi",
            element: lazyPage(<DonasiPage />, "Kelola Donasi")
          },
          {
            path: "users",
            element: lazyPage(<UserAccessPage />, "Akses Pengguna")
          },
          {
            path: "zakat-settings",
            element: lazyPage(<ZakatSettingsPage />, "Pengaturan Zakat")
          },
          {
            path: "profile",
            element: lazyPage(<ProfilePage />, "Profil")
          }
        ]
      }
    ]
  }
]);


const App = () => {
  return (
  <ErrorBoundary>
    <RouterProvider router={router} />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
      }}
    />
  </ErrorBoundary>
);

}

export default App;
