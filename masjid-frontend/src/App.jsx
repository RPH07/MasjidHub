import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import About from './pages/About'; 
import Contact from './pages/Contact'; 
import LoginPages from './auth/Login';
import ZakatForm from './pages/ZakatForm';
import RegisterPages from './auth/Signup';
import AdminLayout from './components/layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import KegiatanPage from './pages/admin/Kegiatan';
import KasPage from './pages/admin/Kas.jsx';
import DonasiPage from './pages/admin/Donasi';
import AdminSignup from './auth/AdminSignup';
import AdminRoute from './components/route-guard/AdminRoute';
import ProtectedRoute from './components/route-guard/ProtectedRoute';
import AuthCallback from './auth/AuthCallback';
import UserDashboard from './pages/user/userDashoard';
import Crowdfunding from './pages/user/Crowdfunding';
import UserLayout from './components/layouts/UserLayout'; 
import KontribusiHistory from './pages/user/KontribusiHistory';
import UserKegiatan from './pages/user/UserKegiatan';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <div>Oops! Something went wrong. Please come back later.</div>,
  },
  {
    path: "/about", 
    element: <About />
  },
  {
    path: "/contact",
    element: <Contact />
  },
  {
    path: "/login",
    element: <LoginPages />,
  },
  {
    path: "/signup",
    element: <RegisterPages />
  },
  {
    path: "/admin/signup",
    element: <AdminSignup />
  },
  {
    path: "/zakat",
    element: <ZakatForm />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/crowdfunding",
    element: <Crowdfunding />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <UserDashboard />
      },
      {
        path: "zakat",
        element: <ZakatForm />
      },
      {
        path: "crowdfunding",
        element: <Crowdfunding />
      },
      {
        path: "kegiatan",
        element: <UserKegiatan />
      },
      {
        path: "kontribusi-history",
        element: <KontribusiHistory />
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
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "kegiatan",
        element: <KegiatanPage />
      },
      {
        path: "kas",
        element: <KasPage />
      },
      {
        path: "donasi",
        element: <DonasiPage />
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