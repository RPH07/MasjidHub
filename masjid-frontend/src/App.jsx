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
import LelangPage from './pages/admin/Lelang';
import AdminSignup from './auth/AdminSignup';
import AdminRoute from './components/route-guard/AdminRoute';
import ProtectedRoute from './components/route-guard/ProtectedRoute';
import AuthCallback from './auth/AuthCallback';
import UserDashboard from './pages/user/userDashoard';

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
  // ← TAMBAH ROUTE LELANG PUBLIC (opsional, untuk direct access)
  {
    path: "/lelang-public",
    element: <UserDashboard />
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
        path: "lelang", // /admin/export
        element: <LelangPage />
      }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
}

export default App;
