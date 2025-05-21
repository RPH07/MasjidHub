/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPages = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Effect untuk redirect ke login setelah berhasil registrasi
  useEffect(() => {
    let redirectTimer;
    if (success.includes('berhasil')) {
      redirectTimer = setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    
    return () => {
      clearTimeout(redirectTimer);
    };
  }, [success, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:5000',
      timeout: 10000,
      retryDelay: 1000,
      retry: 3,
    });
    
    try {
      // Langsung lakukan registrasi tanpa pengecekan awal
      await axiosInstance.post('/api/auth/signup', formData);
      
      // Reset form setelah berhasil
      setFormData({
        nama: '',
        email: '',
        password: '',
      });
      
      setSuccess('Registrasi berhasil! Anda akan dialihkan ke halaman login dalam 3 detik.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat registrasi';
      setError(errorMessage);
      
      if(process.env.NODE_ENV === 'development') {
        console.error('Registration error:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-8">Register</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
            {success.includes('dialihkan') && (
              <div className="ml-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-500"></div>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder=" "
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
            />
            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm">
              Nama
            </label>
          </div>

          <div className="mb-6 relative">
            <input
              type="email"
              placeholder=" "
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
            />
            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm">
              Email
            </label>
          </div>

          <div className="mb-6 relative">
            <input
              type="password"
              placeholder=" "
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
            />
            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm">
              Password
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : 'Register'}
          </button>
          <p className="mt-4 text-center text-sm">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login di sini
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPages