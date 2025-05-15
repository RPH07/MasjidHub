import React, { useState } from 'react';
import axios from 'axios';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    secret: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin/signup', formData);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftar admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-md p-6 rounded">
        <h2 className="text-2xl font-bold text-center mb-6">Daftar Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nama"
            placeholder="Nama"
            value={formData.nama}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded"
            required
          />
          <input
            type="text"
            name="secret"
            placeholder="Secret Key"
            value={formData.secret}
            onChange={handleChange}
            className="w-full mb-4 px-3 py-2 border rounded"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Daftar Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
