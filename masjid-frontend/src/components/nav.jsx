import { useState } from 'react';
import { Link } from 'react-router';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between">
                    <div className="flex space-x-7">
                        <div>
                            <Link to="/" className="flex items-center py-4">
                                <span className="font-semibold text-gray-500 text-lg">MasjidHub</span>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link to="/" className="py-4 px-2 text-gray-500 hover:text-green-500 transition duration-300">Beranda</Link>
                        <Link to="/about" className="py-4 px-2 text-gray-500 hover:text-green-500 transition duration-300">Tentang</Link>
                        <Link to="/services" className="py-4 px-2 text-gray-500 hover:text-green-500 transition duration-300">Kegiatan</Link>
                        <Link to="/contact" className="py-4 px-2 text-gray-500 hover:text-green-500 transition duration-300">Kontak</Link>
                        <Link to="/zakat" className="py-4 px-2 text-gray-500 hover:text-green-500 transition duration-300">Zakat</Link>
                        <Link to="/login" className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">Masuk</Link>
                        <Link to="/signup" className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">Daftar</Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button className="outline-none mobile-menu-button" onClick={toggleMenu}>
                            <svg
                                className="w-6 h-6 text-gray-500 hover:text-green-500"
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
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link to="/" className="block px-2 py-1 text-gray-500 hover:text-green-500 transition duration-300">Home</Link>
                    <Link to="/about" className="block px-2 py-1 text-gray-500 hover:text-green-500 transition duration-300">About</Link>
                    <Link to="/services" className="block px-2 py-1 text-gray-500 hover:text-green-500 transition duration-300">Services</Link>
                    <Link to="/contact" className="block px-2 py-1 text-gray-500 hover:text-green-500 transition duration-300">Contact</Link>
                        <Link to="/login" className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">Masuk</Link>
                        <Link to="/signup" className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">Daftar</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;