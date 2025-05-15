import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RegisterPages = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    secret: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      setSuccess('Registrasi berhasil! Silakan login.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registrasi gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-8">Register</h2>
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

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Register
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

export default RegisterPages;
