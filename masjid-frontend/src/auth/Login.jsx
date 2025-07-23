import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const LoginPages = () => {
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
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

        try {
            const response = await authService.login(formData);
            
            const destination = response.user.role === 'admin' ? 'halaman admin' : 'dashboard';
            
            await Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                text: `Selamat datang ${response.user.nama}! Anda akan dialihkan ke ${destination}`,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                }
            });
            
            // Redirect sesuai role
            if (response.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login';
            
            await Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: errorMessage,
                confirmButtonText: 'Coba Lagi',
                confirmButtonColor: '#EF4444',
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                }
            });

            if (import.meta.env.MODE === 'development') {
                console.error('Login error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h2>
                    <p className="text-gray-600">Silakan login ke akun Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder=" "
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer transition-all"
                        />
                        <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                            Email address
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder=" "
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer transition-all"
                        />
                        <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors"
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5 text-gray-500" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-gray-500" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </>
                        ) : 'Masuk'}
                    </button>
                    
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Belum punya akun?{' '}
                            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                Daftar di sini
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPages;