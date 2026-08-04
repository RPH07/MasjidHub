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
const Transparency = lazy(() => import('@/pages/Transparency'));
const LoginPages = lazy(() => import('@/pages/auth/Login'));
const RegisterPages = lazy(() => import('@/pages/auth/Signup'));
const AdminSignup = lazy(() => import('@/pages/auth/AdminSignup'));
const ZakatForm = lazy(() => import('@/pages/ZakatForm'));
const DonationPrograms = lazy(() => import('@/pages/user/DonationPrograms'));
const UserDashboard = lazy(() => import('@/pages/user/UserDashboard'));
const ContributionHistory = lazy(() => import('@/pages/user/ContributionHistory'));
const UserActivities = lazy(() => import('@/pages/user/UserActivities'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ActivitiesPage = lazy(() => import('@/pages/admin/Activities'));
const CashPage = lazy(() => import('@/pages/admin/Cash.jsx'));
const DonationsPage = lazy(() => import('@/pages/admin/Donations'));
const UserAccessPage = lazy(() => import('@/pages/admin/UserAccess'));
const TransactionVerification = lazy(() => import('@/pages/admin/TransactionVerification'));
const AdminTransparency = lazy(() => import('@/pages/admin/AdminTransparency'));
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
        path: "/transparency",
        element: lazyPage(<Transparency />)
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
        path: "/donation-programs",
        element: lazyPage(<DonationPrograms />)
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
            path: "donation-programs",
            element: lazyPage(<DonationPrograms />)
          },
          {
            path: "activities",
            element: lazyPage(<UserActivities />)
          },
          {
            path: "contribution-history",
            element: lazyPage(<ContributionHistory />)
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
            path: "activities",
            element: lazyPage(<ActivitiesPage />)
          },
          {
            path: "cash",
            element: lazyPage(<CashPage />)
          },
          {
            path: "transaction-verification",
            element: lazyPage(<TransactionVerification />)
          },
          {
            path: "transparency",
            element: lazyPage(<AdminTransparency />)
          },
          {
            path: "donations",
            element: lazyPage(<DonationsPage />)
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
