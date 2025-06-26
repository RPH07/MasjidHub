const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET semua pengguna
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data pengguna:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pengguna' });
  }
});

// POST tambah pengguna
router.post('/', async (req, res) => {
  const { nama, email, password, role } = req.body;
  if (!nama || !email || !password || !role) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, password, role]
    );
    res.status(201).json({ message: 'Pengguna berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error('Gagal menambahkan pengguna:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan pengguna' });
  }
});

// DELETE pengguna
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus pengguna:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus pengguna' });
  }
});

// GET user berdasarkan email
router.get('/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const [rows] = await db.query('SELECT id, nama, email, role FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
});

module.exports = router;
