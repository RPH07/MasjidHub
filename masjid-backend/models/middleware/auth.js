const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if(token == null) return res.status(401).json({ msg: "Akses Ditolak! Token tidak ditemukan." });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(403).json({ msg: "Token Invalid atau Expired." });
        
        // Simpan data user dari token ke dalam request
        req.userId = decoded.userId;
        req.email = decoded.email;
        req.role = decoded.role; 
        
        next();
    });
}

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

module.exports = { verifyToken, adminOnly, dkmOrAdmin };