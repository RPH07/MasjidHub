import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// import {API_BASE_URL} from '../config/api'

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

        const axiosInstance = axios.create({
            baseURL: 'http://localhost:5000',
            timeout: 10000,
            retryDelay: 1000,
            retry: 3,
            withCredentials: true
        })
        
        try {
            const res = await axiosInstance.post('/api/auth/login', formData);

            // Simpan token dan role di localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userData', JSON.stringify(res.data.user));
            localStorage.setItem('userRole', res.data.user.role);

            const destination = res.data.user.role === 'admin' ? 'halaman admin' : 'dashboard';
            setSuccess(`Login berhasil! Anda akan dialihkan ke ${destination} dalam 3 detik.`);
            
            // Redirect sesuai role
            setTimeout(() => {
                if (res.data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }, 3000);
            
            // console.log('Login success:', res.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat login';
            setError(errorMessage);

            // eslint-disable-next-line no-undef
            if(process.env.NODE_ENV === 'development') {
                console.error('Login error:', err);
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <h2 className="text-center text-2xl font-bold mb-8">Login</h2>
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
                        <div className="ml-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-500"></div>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
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
                            Email address
                        </label>
                    </div>

                    <div className="mb-6 relative">
                        <input
                            type={showPassword ? 'test' : 'password'}
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
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
                        ) : 'Login'}
                    </button>
                    
                    
                    <p className="mt-4 text-center text-sm">
                        Belum punya akun?{' '}
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Daftar di sini
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPages;