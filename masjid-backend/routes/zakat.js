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

    // Untuk transfer/qris wajib ada bukti, untuk cash opsional
    if ((metodePembayaran === 'transfer_bank' || metodePembayaran === 'qris') && !buktiTransfer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bukti transfer harus diupload!' 
      });
    }

    const query = `
      INSERT INTO zakat (nama, jumlah, jenis_zakat, bukti_transfer, metode_pembayaran, status, created_at) 
      VALUES (?, ?, ?, ?, ?, 'pending', NOW())
    `;
    
    await db.execute(query, [nama, nominal, jenisZakat, buktiTransfer, metodePembayaran]);

    res.status(201).json({
      success: true,
      message: 'Pembayaran zakat berhasil dikirim! Menunggu verifikasi admin.'
    });

  } catch (error) {
    console.error('Error submitting zakat:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT - Approve/Reject pembayaran zakat
router.put('/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false,
        message: 'Action harus approve atau reject' 
      });
    }

    // Get zakat data
    const [zakatRows] = await db.query('SELECT * FROM zakat WHERE id = ?', [id]);
    
    if (zakatRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Data zakat tidak ditemukan' 
      });
    }

    const zakatData = zakatRows[0];

    if (zakatData.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Zakat sudah divalidasi sebelumnya' 
      });
    }

    if (action === 'approve') {
      // Update status ke approved
      await db.query(
        'UPDATE zakat SET status = ?, validated_at = NOW() WHERE id = ?',
        ['approved', id]
      );
      
      // Insert ke kas_buku_besar - perbaiki kolom dan SQL
      await db.query(`
        INSERT INTO kas_buku_besar 
        (tanggal, deskripsi, jenis, jumlah, kategori, source_table, source_id, metode_input, metode_pembayaran, bukti_transfer, nama_pemberi, created_at)
        VALUES (CURDATE(), ?, 'masuk', ?, ?, 'zakat', ?, 'online', ?, ?, ?, NOW())
      `, [
        `Zakat ${zakatData.jenis_zakat} dari ${zakatData.nama}`,
        zakatData.jumlah,
        `zakat_${zakatData.jenis_zakat}`,
        id,
        zakatData.metode_pembayaran,
        zakatData.bukti_transfer,
        zakatData.nama
      ]);

      res.json({
        success: true,
        message: 'Zakat berhasil diapprove'
      });
    } else {
      // Update status ke rejected
      await db.query(
        'UPDATE zakat SET status = ?, reject_reason = ?, validated_at = NOW() WHERE id = ?',
        ['rejected', reason || 'Tidak ada alasan yang diberikan', id]
      );
      
      res.json({
        success: true,
        message: 'Zakat telah ditolak'
      });
    }

  } catch (err) {
    console.error('Error validating zakat:', err);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan saat validasi zakat' 
    });
  }
});

// GET - Ambil data zakat pending untuk validasi
router.get('/pending', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, nama, jumlah, jenis_zakat, bukti_transfer, metode_pembayaran, created_at 
      FROM zakat 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching pending zakat:', error);
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
      SELECT id, nama, jumlah, jenis_zakat, bukti_transfer, metode_pembayaran, status, created_at, validated_at 
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