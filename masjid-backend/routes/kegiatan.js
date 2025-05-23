const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// GET semua kegiatan
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kegiatan ORDER BY tanggal DESC');
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data kegiatan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kegiatan' });
  }
});

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder penyimpanan
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST tambah kegiatan (dengan upload file)
router.post('/', upload.single('foto'), async (req, res) => {
  const { nama_kegiatan, tanggal, lokasi, deskripsi } = req.body;
  const foto = req.file ? req.file.filename : null;

  if (!nama_kegiatan || !tanggal || !lokasi || !deskripsi) {
    return res.status(400).json({ message: 'Field wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO kegiatan (nama_kegiatan, tanggal, lokasi, deskripsi, foto) VALUES (?, ?, ?, ?, ?)',
      [nama_kegiatan, tanggal, lokasi, deskripsi, foto]
    );
    res.status(201).json({ message: 'Kegiatan berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error('Gagal menambahkan kegiatan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan kegiatan' });
  }
});

// DELETE kegiatan berdasarkan ID
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM kegiatan WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    res.json({ message: 'Kegiatan berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus kegiatan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus kegiatan' });
  }
});

module.exports = router;
