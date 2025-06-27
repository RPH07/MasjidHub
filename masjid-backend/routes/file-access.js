const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Middleware tiruan untuk pengembangan (GANTI DENGAN YANG ASLI NANTI)
const authenticateToken = (req, res, next) => next();
const isAdmin = (req, res, next) => next();


// Endpoint ini dilindungi. Hanya admin yang login yang bisa mengakses.
// URL: /api/secure-files/{folder}/{filename}
// Contoh: /api/secure-files/bukti-donasi/bukti-1672531200000.jpg
router.get('/:folder/:filename', authenticateToken, isAdmin, (req, res) => {
    const { folder, filename } = req.params;

    // Daftar folder privat yang diizinkan untuk diakses melalui route ini
    const allowedFolders = ['bukti-donasi', 'bukti-zakat'];
    if (!allowedFolders.includes(folder)) {
        return res.status(403).send('Akses ke folder ini ditolak.');
    }

    // Path absolut ke file yang diminta
    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

    // Cek apakah file benar-benar ada sebelum mengirimkannya
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error("File tidak ditemukan:", filePath);
            return res.status(404).send('File tidak ditemukan.');
        }
        
        // Kirim file ke client
        res.sendFile(filePath);
    });
});

module.exports = router;