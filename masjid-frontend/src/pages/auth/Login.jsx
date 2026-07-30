import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/config/api';
import { AuthShell, Banner, Field, PasswordField, SubmitButton } from '@/components/layout/AuthLayout';

const LoginPages = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                email: formData.email.trim().toLocaleLowerCase(),
                password: formData.password
            };
            const res = await api.post('/auth/login', payload);

            // Simpan token dan role di localStorage
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            const role = res.data.user.role;
            const destination = role === 'admin' || role === 'dkm' ? 'dashboard pengurus' : 'dashboard jamaah';

            setSuccess(`Login berhasil! Anda akan dialihkan ke ${destination}`);
            if (role === 'admin' || role === 'dkm') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.msg ||
                err.response?.data?.error ||
                'Terjadi kesalahan saat login';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            formTitle="Masuk"
            formSubtitle="Kelola kas dan kegiatan masjid dari satu tempat."
            tagline="Buku kas & agenda masjid, satu tempat."
            stamp="TERVERIFIKASI"
            footer={
                <>
                    Belum punya akun?{' '}
                    <Link to="/signup" className="text-[#14532D] font-medium hover:underline">
                        Daftar di sini
                    </Link>
                </>
            }
        >
            {error && <Banner type="error">{error}</Banner>}
            {success && <Banner type="success">{success}</Banner>}

            <form onSubmit={handleSubmit}>
                <Field
                    label="Email address"
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

                <div className="mt-8">
                    <SubmitButton isLoading={isLoading}>Login</SubmitButton>
                </div>
            </form>
        </AuthShell>
    );
};

export default LoginPages;