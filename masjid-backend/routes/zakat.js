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
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// POST - Submit pembayaran zakat
router.post('/', upload.single('bukti'), async (req, res) => {
  try {
    const { nama, nominal, jenisZakat, metodePembayaran } = req.body;
    const buktiTransfer = req.file ? req.file.filename : null;

    if (!nama || !nominal || !jenisZakat || !metodePembayaran) {
      return res.status(400).json({ 
        success: false, 
        message: 'Semua field harus diisi!' 
      });
    }

    if (!buktiTransfer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bukti transfer harus diupload!' 
      });
    }

    const query = `
      INSERT INTO zakat (nama, jumlah, jenis_zakat, bukti_transfer, metode_pembayaran, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    await db.execute(query, [nama, nominal, jenisZakat, buktiTransfer, metodePembayaran]);

    res.status(201).json({
      success: true,
      message: 'Pembayaran zakat berhasil dikirim! Terima kasih atas kontribusi Anda.'
    });

  } catch (error) {
    console.error('Error submitting zakat:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET - Ambil semua data zakat (untuk admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, nama, jumlah, jenis_zakat, bukti_transfer, metode_pembayaran, created_at 
      FROM zakat 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching zakat data:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

module.exports = router;