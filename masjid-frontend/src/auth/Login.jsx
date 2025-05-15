import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPages = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData, {
                withCredentials: true // Penting untuk menerima cookies dari server
            });

            // Simpan token di localStorage (opsional, karena sudah ada di cookie)
            localStorage.setItem('token', res.data.token);
            
            // Simpan role untuk kontrol akses di UI
            localStorage.setItem('userRole', res.data.user.role);
            
            // Redirect sesuai role
            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
            
            console.log('Login success:', res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <h2 className="text-center text-2xl font-bold mb-8">Login</h2>
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

                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Login'}
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