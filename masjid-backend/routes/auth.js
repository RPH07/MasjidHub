const express = require('express');
const router = express.Router();
const db = require('../config/db');

// signup route
router.post('/signup', (req, res) => {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const sql = 'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)';
    db.query(sql, [nama, email, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal menyimpan user', error: err });
        }
        res.status(201).json({ message: 'User berhasil didaftarkan' });
    });
});

// login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal melakukan login', error: err });
        }
        if (result.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }
        res.status(200).json({ message: 'Login berhasil', user: result[0] });
    });
});

module.exports = router;
