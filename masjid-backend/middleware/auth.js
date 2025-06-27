import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// 1. Middleware untuk memverifikasi token
function authenticateToken(req, res, next) {
    // Mengambil token dari header 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) {
        // Jika tidak ada token, kirim status 401 Unauthorized
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    // Memverifikasi token menggunakan secret key
    verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Jika token tidak valid (misal: sudah expired atau salah), kirim status 403 Forbidden
            console.error('JWT Verify Error:', err.message);
            return res.status(403).json({ message: 'Token tidak valid.' });
        }
        
        // Jika token valid, simpan informasi pengguna dari token ke object `req`
        // agar bisa digunakan oleh middleware atau route selanjutnya.
        req.user = user;
        next(); // Lanjutkan ke proses selanjutnya (misal: isAdmin atau controller)
    });
}

// 2. Middleware untuk memeriksa apakah pengguna adalah admin
function isAdmin(req, res, next) {
    // Middleware ini harus dijalankan SETELAH authenticateToken
    if (req.user && req.user.role === 'admin') {
        next(); // Jika rolenya 'admin', izinkan akses
    } else {
        // Jika bukan admin, kirim status 403 Forbidden
        return res.status(403).json({ message: 'Akses ditolak. Hanya untuk admin.' });
    }
}

export default {
    authenticateToken,
    isAdmin,
};