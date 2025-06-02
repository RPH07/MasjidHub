const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Konfigurasi multer untuk upload bukti transfer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'zakat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// POST - Submit pembayaran zakat
router.post('/', upload.single('bukti'), async (req, res) => {
  const { nama, nominal, jenisZakat } = req.body;
  const buktiTransfer = req.file ? req.file.filename : null;

  if (!nama || !nominal || !jenisZakat) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    // Insert ke tabel zakat
    const [result] = await db.query(
      'INSERT INTO zakat (nama, jenis_zakat, jumlah, bukti_transfer) VALUES (?, ?, ?, ?)',
      [nama, jenisZakat, parseInt(nominal), buktiTransfer]
    );
    
    res.status(201).json({ 
      message: 'Pembayaran zakat berhasil disubmit. Terima kasih atas kontribusi Anda!',
      id: result.insertId 
    });
  } catch (err) {
    console.error('Gagal menyimpan data zakat:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data zakat' });
  }
});

// GET - Ambil semua data zakat (untuk admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM zakat ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data zakat:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data zakat' });
  }
});

module.exports = router;