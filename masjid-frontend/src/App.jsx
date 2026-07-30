import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminRoute from '@/components/routeGuard/AdminRoute';
import ProtectedRoute from '@/components/routeGuard/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout'; 
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import RouteError from '@/components/feedback/RouteError';
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


const lazyPage = (element) => (
  <Suspense fallback={<PageLoader />}>
    {element}
  </Suspense>
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

const maintenancePage = (key, element) => (
  <MaintenanceGuard enabled={MAINTENANCE[key]}>
    {lazyPage(element)}
  </MaintenanceGuard>
);

const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: lazyPage(<HomePage />)
      },
      {
        path: "/maintenance",
        element: lazyPage(<Maintenance />)
      },
      {
        path: "/about",
        element: lazyPage(<About />)
      },
      {
        path: "/contact",
        element: lazyPage(<Contact />)
      },
      {
        path: "/transparansi",
        element: lazyPage(<TransparansiDana />)
      },
      {
        path: "/login",
        element: lazyPage(<LoginPages />)
      },
      {
        path: "/signup",
        element: lazyPage(<RegisterPages />)
      },
      {
        path: "/admin/signup",
        element: lazyPage(<AdminSignup />)
      },
      {
        path: "/zakat",
        element: maintenancePage('zakat', <ZakatForm />)
      },
      {
        path: "/crowdfunding",
        element: lazyPage(<Crowdfunding />)
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
            element: lazyPage(<UserDashboard />)
          },
          {
            path: "zakat",
            element: maintenancePage('zakat', <ZakatForm />)
          },
          {
            path: "crowdfunding",
            element: lazyPage(<Crowdfunding />)
          },
          {
            path: "kegiatan",
            element: lazyPage(<UserKegiatan />)
          },
          {
            path: "kontribusi-history",
            element: lazyPage(<KontribusiHistory />)
          },
          {
            path: "profile",
            element: lazyPage(<ProfilePage />)
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
            element: lazyPage(<Dashboard />)
          },
          {
            path: "kegiatan",
            element: lazyPage(<KegiatanPage />)
          },
          {
            path: "kas",
            element: lazyPage(<KasPage />)
          },
          {
            path: "verifikasi-transaksi",
            element: lazyPage(<VerifikasiTransaksi />)
          },
          {
            path: "transparansi",
            element: lazyPage(<TransparansiAdmin />)
          },
          {
            path: "donasi",
            element: lazyPage(<DonasiPage />)
          },
          {
            path: "users",
            element: lazyPage(<UserAccessPage />)
          },
          {
            path: "zakat-settings",
            element: lazyPage(<ZakatSettingsPage />)
          },
          {
            path: "profile",
            element: lazyPage(<ProfilePage />)
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
