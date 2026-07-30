import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/config/api';
import { AuthShell, Banner, Field, PasswordField, SubmitButton } from '@/components/layout/AuthLayout';

const MIN_PASSWORD_LENGTH = 6;

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    secret: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touchedFields, setTouchedFields] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

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
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
    setServerErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setServerErrors({});
    setTouchedFields({
      password: true,
      confirmPassword: true,
      secret: true
    });

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter`);
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register-dkm', formData);
      setFormData({
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
        secret: ''
      });
      setTouchedFields({});
      setServerErrors({});
      setSuccess('Registrasi admin berhasil! Anda akan dialihkan ke halaman login dalam 3 detik.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.msg || 'Terjadi kesalahan saat registrasi';
      const loweredMessage = errorMessage.toLowerCase();

      if (loweredMessage.includes('password')) {
        setServerErrors((prev) => ({ ...prev, password: errorMessage }));
      }

      if (loweredMessage.includes('rahasia') || loweredMessage.includes('secret')) {
        setServerErrors((prev) => ({ ...prev, secret: errorMessage }));
      }

      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Registration error:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordErrors = {
    password: serverErrors.password || (touchedFields.password && formData.password.length > 0 && formData.password.length < MIN_PASSWORD_LENGTH
      ? `Password minimal ${MIN_PASSWORD_LENGTH} karakter`
      : ''),
    confirmPassword: touchedFields.confirmPassword && formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword
      ? 'Konfirmasi password tidak cocok'
      : '',
    secret: serverErrors.secret
  };

  return (
    <AuthShell
      formTitle="Daftar Pengurus"
      formSubtitle="Khusus DKM/admin — perlu secret key dari pengurus pusat."
      tagline="Pendaftaran pengurus memerlukan kunci akses dari admin lain."
      restricted
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
          onBlur={handleBlur}
          show={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          error={passwordErrors.password}
          required
        />

        <PasswordField
          label="Konfirmasi Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          error={passwordErrors.confirmPassword}
          required
        />

        <PasswordField
          label="Secret Key"
          name="secret"
          value={formData.secret}
          onChange={handleChange}
          onBlur={handleBlur}
          show={showSecret}
          onToggle={() => setShowSecret(!showSecret)}
          error={passwordErrors.secret}
          required
        />

        <div className="mt-8">
          <SubmitButton isLoading={isLoading}>Register Admin</SubmitButton>
        </div>
      </form>
    </AuthShell>
  );
};

export default AdminRegister;
