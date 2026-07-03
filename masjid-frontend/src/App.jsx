import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AdminLayout from './components/layouts/AdminLayout';
import AdminRoute from './components/route-guard/AdminRoute';
import ProtectedRoute from './components/route-guard/ProtectedRoute';
import UserLayout from './components/layouts/UserLayout'; 
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import RouteError from './components/RouteError';

const HomePage = lazy(() => import('./pages/HomePage'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const TransparansiDana = lazy(() => import('./pages/TransparansiDana'));
const LoginPages = lazy(() => import('./auth/Login'));
const RegisterPages = lazy(() => import('./auth/Signup'));
const AdminSignup = lazy(() => import('./auth/AdminSignup'));
const ZakatForm = lazy(() => import('./pages/ZakatForm'));
const Crowdfunding = lazy(() => import('./pages/user/Crowdfunding'));
const UserDashboard = lazy(() => import('./pages/user/userDashoard'));
const KontribusiHistory = lazy(() => import('./pages/user/KontribusiHistory'));
const UserKegiatan = lazy(() => import('./pages/user/UserKegiatan'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const KegiatanPage = lazy(() => import('./pages/admin/Kegiatan'));
const KasPage = lazy(() => import('./pages/admin/Kas.jsx'));
const DonasiPage = lazy(() => import('./pages/admin/Donasi'));
const UserAccessPage = lazy(() => import('./pages/admin/UserAccess'));
const VerifikasiTransaksi = lazy(() => import('./pages/admin/VerifikasiTransaksi'));
const TransparansiAdmin = lazy(() => import('./pages/admin/TransparansiAdmin'));

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

const router = createBrowserRouter([
  {
    path: "/",
    element: lazyPage(<HomePage />),
    errorElement: <RouteError />
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
    element: lazyPage(<LoginPages />),
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
    element: lazyPage(<ZakatForm />),
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
        element: lazyPage(<ZakatForm />)
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
      }
    ]
  }
]);

const App = () => {
  return (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);

}

export default App;
