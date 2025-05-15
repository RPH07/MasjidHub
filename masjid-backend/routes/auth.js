const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Signup admin 
router.post('/admin/signup', async (req, res) => {
  const { nama, email, password, secret } = req.body;

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  if (!nama || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [nama, email, hashedPassword, 'admin'], (err, result) => {
      if (err) return res.status(500).json({ message: 'Gagal menyimpan admin', error: err });
      res.status(201).json({ message: 'Admin berhasil didaftarkan' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error });
  }
});


// SIGNUP
router.post('/signup', async (req, res) => {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try {
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)';
        db.query(sql, [nama, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal menyimpan user', error: err });
            }
            res.status(201).json({ message: 'User berhasil didaftarkan' });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server', error });
    }
});

// LOGIN (sementara masih plain)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try{
        const [row] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (row.length === 0) {
            return res.status(401).json({ message: 'Maaf, tapi email yang kamu masukin tidak ditemukan' });
        }
        const user = row[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Maaf, tapi password yang kamu masukin salah' });
        }

        res.status(200).json({ message: 'Login berhasil', user });
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server', error });
    }
});

module.exports = router;
