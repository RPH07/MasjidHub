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
import ExportPage from './pages/admin/Export';
import AdminSignup from './auth/AdminSignup';
import AdminRoute from './components/route-guard/AdminRoute';

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
    path: "/admin",
    element:(
    <AdminRoute>
      <AdminLayout />
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
        path: "export", // /admin/export
        element: <ExportPage />
      }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
}

export default App;
