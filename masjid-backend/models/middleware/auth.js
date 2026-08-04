const jwt = require('jsonwebtoken');
const User = require('../UserModels');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if(token == null) return res.status(401).json({ msg: "Akses Ditolak! Token tidak ditemukan." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'email', 'role', 'jabatan', 'status']
        });

        if (!user || user.status !== 'active') {
            return res.status(403).json({ msg: "User tidak aktif atau tidak ditemukan." });
        }

        // Ambil role/jabatan terbaru dari DB supaya perubahan akses langsung berlaku.
        req.userId = user.id;
        req.email = user.email;
        req.role = user.role;
        req.jabatan = user.jabatan || null;
        
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Token Invalid atau Expired." });
    }
}

const optionalToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'email', 'role', 'jabatan', 'status']
        });

        if (user && user.status === 'active') {
            req.userId = user.id;
            req.email = user.email;
            req.role = user.role;
            req.jabatan = user.jabatan || null;
        }
    } catch (error) {
        // Endpoint publik tetap boleh lanjut tanpa identitas user.
    }

    next();
};

const adminOnly = (req, res, next) => {
    if(req.role !== "admin") {
        return res.status(403).json({ msg: "Akses Terlarang! Khusus Admin." });
    }
    next();
}

const dkmOrAdmin = (req, res, next) => {
    // Admin BOLEH, DKM BOLEH. Jamaah DILARANG.
    if(req.role === "admin" || req.role === "dkm") {
        next();
    } else {
        return res.status(403).json({ msg: "Akses Terlarang! Khusus Pengurus Masjid." });
    }
}

const requireJabatan = (...allowedJabatan) => {
    return (req, res, next) => {
        if (req.role === 'admin') return next();

        if (req.role !== 'dkm') {
            return res.status(403).json({ msg: 'Akses Terlarang! Khusus Pengurus Masjid.' });
        }

        if (!allowedJabatan.includes(req.jabatan)) {
            return res.status(403).json({ msg: 'Akses Terlarang! Jabatan tidak memiliki izin.' });
        }

        next();
    }
}

module.exports = { verifyToken, optionalToken, adminOnly, dkmOrAdmin, requireJabatan };
