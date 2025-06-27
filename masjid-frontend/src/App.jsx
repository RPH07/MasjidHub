import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPages from './auth/Login';
import ZakatForm from './pages/ZakatForm';
import RegisterPages from './auth/Signup';
import AdminLayout from './components/layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import KegiatanPage from './pages/admin/Kegiatan';
import KasPage from './pages/admin/Kas.jsx';
import DonasiPage from './pages/admin/Donasi'; // Import halaman donasi admin
import AdminSignup from './auth/AdminSignup';
import AdminRoute from './components/route-guard/AdminRoute';
import ProtectedRoute from './components/route-guard/ProtectedRoute';
import AuthCallback from './auth/AuthCallback';
import UserDashboard from './pages/user/userDashoard';
import Crowdfunding from './pages/user/Crowdfunding'

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <div>Oops! Something went wrong. Please come back later.</div>,
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
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: "/crowdfunding",
    element: (
      <ProtectedRoute>
        <Crowdfunding />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin",
    element:(
    <AdminRoute>
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    </AdminRoute>),
    children: [
      {
        index: true, // /admin
        element: <Dashboard />
      },
      {
        path: "kegiatan", // /admin/kegiatan
        element: <KegiatanPage />
      },
      {
        path: "kas", // /admin/kas
        element: <KasPage />
      },
      {
        path: "donasi", // /admin/donasi
        element: <DonasiPage />
      }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
}

export default App;