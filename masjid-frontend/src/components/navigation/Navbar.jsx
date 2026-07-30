import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    // Check if current path is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    const isPengurus = user && ['admin', 'dkm'].includes(user.role);
    const dashboardPath = isPengurus ? '/admin' : '/dashboard';
    const profilePath = isPengurus ? '/admin/profile' : '/dashboard/profile';

    // Main navigation items
    const navItems = [
        { path: '/', label: 'Beranda', public: true },
        { path: '/crowdfunding', label: 'Donasi', public: true },
        { path: '/zakat', label: 'Zakat', public: true },
        { path: '/transparansi', label: 'Transparansi', public: true },
        { path: '/about', label: 'Tentang', public: true },
        { path: '/contact', label: 'Kontak', public: true }
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 border-b border-[#1c2620] transition-colors duration-300 ${
            isScrolled ? 'bg-[#f3efe4]/95 backdrop-blur-sm' : 'bg-[#f3efe4]'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="shrink-0">
                        <Link to="/" className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 bg-[#1f4d3a] flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#f3efe4]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                                </svg>
                            </div>
                            <span className="text-[17px] font-semibold text-[#1c2620] tracking-tight">
                                Masjid Nurul Ilmi
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3.5 py-2 mx-0.5 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                    isActive(item.path)
                                        ? 'text-[#1f4d3a] border-[#1f4d3a]'
                                        : 'text-[#5c6b5f] border-transparent hover:text-[#1c2620]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        {user ? (
                            <div className="flex items-center space-x-1">
                                {/* Dashboard Link */}
                                <Link
                                    to={dashboardPath}
                                    className="flex items-center space-x-2 px-3.5 py-2 text-sm text-[#5c6b5f] hover:text-[#1c2620] transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm16 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2m16 0l-8.5 6L3 7"/>
                                    </svg>
                                    <span className="font-medium">Dashboard</span>
                                </Link>

                                {/* User Menu */}
                                <div className="relative group">
                                    <Button className="flex items-center space-x-2 px-3.5 py-2 bg-transparent hover:bg-transparent text-[#5c6b5f] hover:text-[#1c2620] transition-colors duration-200">
                                        <div className="w-8 h-8 bg-[#1f4d3a] flex items-center justify-center">
                                            <span className="text-[#f3efe4] text-sm font-medium">
                                                {user.nama?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium">{user.nama || 'User'}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </Button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-[#f3efe4] border border-[#1c2620] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="py-2">
                                            <div className="px-4 py-2 border-b border-dashed border-[#1c2620]/40">
                                                <p className="text-sm font-medium text-[#1c2620]">{user.nama}</p>
                                                <p className="text-xs text-[#5c6b5f] capitalize">{user.role}</p>
                                            </div>

                                            <Link
                                                to={dashboardPath}
                                                className="flex items-center px-4 py-2 text-sm text-[#1c2620] hover:bg-[#e8ede8] transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm16 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2m16 0l-8.5 6L3 7"/>
                                                </svg>
                                                Dashboard
                                            </Link>

                                            <Link
                                                to={profilePath}
                                                className="flex items-center px-4 py-2 text-sm text-[#1c2620] hover:bg-[#e8ede8] transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0"/>
                                                </svg>
                                                Profil
                                            </Link>

                                            <Button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 bg-transparent hover:bg-red-50 text-sm text-red-700 transition-colors justify-start rounded-none"
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                                </svg>
                                                Keluar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-[#1c2620] hover:text-[#1f4d3a] transition-colors duration-200"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 py-2 bg-[#1f4d3a] text-[#f3efe4] text-sm font-medium border border-[#1c2620] hover:bg-[#1c2620] transition-colors duration-200"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            onClick={toggleMenu}
                            className="p-2 bg-transparent hover:bg-[#e8ede8] text-[#1c2620] transition-colors duration-200 rounded-none"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-[#f3efe4] border-t border-dashed border-[#1c2620]/40">
                        {/* Mobile Navigation Items */}
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 text-sm font-medium border-l-2 transition-colors duration-200 ${
                                    isActive(item.path)
                                        ? 'text-[#1f4d3a] border-[#1f4d3a] bg-[#e8ede8]'
                                        : 'text-[#5c6b5f] border-transparent hover:text-[#1c2620] hover:bg-[#e8ede8]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Mobile Auth Section */}
                        <div className="pt-4 border-t border-dashed border-[#1c2620]/40">
                            {user ? (
                                <div className="space-y-1">
                                    {/* User Info */}
                                    <div className="px-3 py-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-[#1f4d3a] flex items-center justify-center">
                                                <span className="text-[#f3efe4] font-medium">
                                                    {user.nama?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#1c2620]">{user.nama}</p>
                                                <p className="text-sm text-[#5c6b5f] capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard Link */}
                                    <Link
                                        to={dashboardPath}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-3 py-2 text-[#5c6b5f] hover:text-[#1c2620] hover:bg-[#e8ede8] transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm16 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2m16 0l-8.5 6L3 7"/>
                                        </svg>
                                        Dashboard
                                    </Link>

                                    {/* Profile Link */}
                                    <Link
                                        to={profilePath}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-3 py-2 text-[#5c6b5f] hover:text-[#1c2620] hover:bg-[#e8ede8] transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0"/>
                                        </svg>
                                        Profil
                                    </Link>

                                    {/* Logout Button */}
                                    <Button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-3 py-2 bg-transparent hover:bg-red-50 text-red-700 transition-all duration-200 justify-start rounded-none"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                        </svg>
                                        Keluar
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 text-[#1c2620] hover:bg-[#e8ede8] font-medium transition-all duration-200"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 bg-[#1f4d3a] text-[#f3efe4] text-center font-medium border border-[#1c2620] hover:bg-[#1c2620] transition-all duration-200"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
