import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { AuthShell, Banner, Field, PasswordField, SubmitButton } from '@/components/layouts/AuthLayout';

const RegisterPages = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      // Langsung lakukan registrasi tanpa pengecekan awal
      await api.post('/auth/register', formData);

      // Reset form setelah berhasil
      setFormData({
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      setSuccess('Registrasi berhasil! Anda akan dialihkan ke halaman login dalam 3 detik.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.msg || 'Terjadi kesalahan saat registrasi';
      setError(errorMessage);

      if (import.meta.env.DEV) {
        console.error('Registration error:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      formTitle="Daftar"
      formSubtitle="Buat akun untuk memantau kas dan agenda masjid."
      tagline="Buku kas & agenda masjid, satu tempat."
      stamp="AKUN BARU"
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#14532D] font-medium hover:underline">
            Login di sini
          </Link>
        </>
      }
    >
      {error && <Banner type="error">{error}</Banner>}
      {success && <Banner type="success">{success}</Banner>}

      <form onSubmit={handleSubmit}>
        <Field
          label="Nama"
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          required
        />

        <Field
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          required
        />

        <PasswordField
          label="Konfirmasi Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          required
        />

        <div className="mt-8">
          <SubmitButton isLoading={isLoading}>Register</SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
};

export default RegisterPages;