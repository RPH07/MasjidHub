import React from 'react'
import {createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPages from './auth/Login'
import ZakatForm from './pages/ZakatForm'
import RegisterPages from './auth/Signup'


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
    path: "/zakat",
    element: <ZakatForm />,
  },
  {
    path: "/signup",
    element: <RegisterPages />
  }
])


const App = () => {
  return <RouterProvider router={router} />;
}

export default App