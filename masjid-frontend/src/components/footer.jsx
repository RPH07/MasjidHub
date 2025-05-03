import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white py-8 text-center">
            <p className="text-sm">
                &copy; {currentYear} Sistem Informasi Masjid Al-Ikhlas. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;