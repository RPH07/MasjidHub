const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

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
    const hashedPassword = await bcrypt.hash(password, 10);
    // handle error karena email duplikat
    await db.query('INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, hashedPassword, 'admin']
    );
    res.status(201).json({ message: 'Admin berhasil didaftarkan' });
  } catch (error) {
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// SIGNUP
router.post('/signup', async (req, res) => {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (nama, email, password) VALUES (?, ?, ?)', 
            [nama, email, hashedPassword]);
        res.status(201).json({ message: 'User berhasil didaftarkan' });
    } catch (error) {
      // handle error karena email duplikat
        if(error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email tidak ditemukan' });
        }
        
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // Jangan kirim password dalam respons
        const { password: _, ...userWithoutPassword } = user;

        // === Tambahkan kode berikut untuk membuat token ===
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'jamaah' },
            process.env.JWT_SECRET || 'secretkey', // Ganti dengan env JWT_SECRET di production!
            { expiresIn: '7d' }
        );
        // =================================================

        res.status(200).json({ 
            message: 'Login berhasil', 
            user: userWithoutPassword,
            token // ← kirim token ke FE
        });
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
});

module.exports = router;