const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Helper function untuk generate kode unik
const generateKodeUnik = (prefix = '') => {
  const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10; // Range 10-99
  return parseInt(prefix + randomNumber); // Gabungkan prefix dengan angka random
};

// Import middleware dan utils
const { publicAccess, publicRateLimit } = require('../middleware');

// Konfigurasi multer untuk upload foto barang
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/crowdfunding/'); // Simpan ke folder khusus crowdfunding
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'crowdfunding-' + uniqueSuffix + path.extname(file.originalname));
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

// ===== CRUD BARANG DONASI =====

// GET - Daftar barang donasi
router.get('/barang', publicRateLimit, async (req, res) => {
  try {
    const query = `
      SELECT id, nama_barang, deskripsi, target_dana, dana_terkumpul, status_pengadaan, foto_barang, created_at
      FROM barang_pengadaan
      ORDER BY created_at DESC
    `;

    const [rows] = await db.execute(query);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching barang donasi:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET - Detail barang donasi
router.get('/barang/:id', publicRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    // Query barang
    const barangQuery = `
      SELECT id, nama_barang, deskripsi, target_dana, dana_terkumpul, status_pengadaan, foto_barang, created_at
      FROM barang_pengadaan
      WHERE id = ?
    `;

    const [barangRows] = await db.execute(barangQuery, [id]);

    if (barangRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan'
      });
    }

    const barang = barangRows[0];

    // Query donasi terkait barang
    const donasiQuery = `
      SELECT id, nama_donatur, nominal, metode_pembayaran, status, created_at
      FROM donasi_pengadaan
      WHERE barang_id = ?
      ORDER BY created_at DESC
    `;

    const [donasiRows] = await db.execute(donasiQuery, [id]);

    res.status(200).json({
      success: true,
      data: {
        barang,
        donasi: donasiRows
      }
    });
  } catch (error) {
    console.error('Error fetching barang detail:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET - Barang yang sudah terpenuhi
router.get('/barang/terpenuhi', async (req, res) => {
  try {
    const query = `
      SELECT id, nama_barang, deskripsi, target_dana, dana_terkumpul, foto_barang, created_at
      FROM barang_pengadaan
      WHERE status_pengadaan = 'terpenuhi'
      ORDER BY created_at DESC
    `;

    const [rows] = await db.execute(query);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching barang terpenuhi:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST - Tambah barang donasi
router.post('/barang', upload.single('foto'), async (req, res) => {
  try {
    const { nama_barang, deskripsi, target_dana } = req.body;
    const foto_barang = req.file ? req.file.filename : null;

    if (!nama_barang || !deskripsi || !target_dana) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi!'
      });
    }

    const query = `
      INSERT INTO barang_pengadaan (nama_barang, deskripsi, target_dana, dana_terkumpul, status_pengadaan, foto_barang, created_at)
      VALUES (?, ?, ?, 0, 'belum_terpenuhi', ?, NOW())
    `;

    await db.execute(query, [nama_barang, deskripsi, target_dana, foto_barang]);

    res.status(201).json({
      success: true,
      message: 'Barang donasi berhasil ditambahkan!'
    });
  } catch (error) {
    console.error('Error adding barang donasi:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST - Tambah donasi untuk barang tertentu
router.post('/', publicRateLimit, async (req, res) => {
  try {
    const { barang_id, nama_donatur, nominal, metode_pembayaran } = req.body;

    if (!barang_id || !nominal || !metode_pembayaran) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi!'
      });
    }

    // Jika nama donatur tidak diisi, default ke "Hamba Allah"
    const nama = nama_donatur && nama_donatur.trim() ? nama_donatur.trim() : 'Hamba Allah';

    // Generate kode unik dengan prefix khusus untuk donasi barang
    const kode_unik = generateKodeUnik('1'); // Prefix '1' untuk donasi barang
    const total_donasi = parseInt(nominal) + kode_unik;

    const query = `
      INSERT INTO donasi_pengadaan (barang_id, nama_donatur, nominal, metode_pembayaran, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;

    await db.execute(query, [barang_id, nama, total_donasi, metode_pembayaran]);

    res.status(201).json({
      success: true,
      message: 'Donasi berhasil ditambahkan! Menunggu validasi admin.',
      data: {
        kode_unik,
        total_donasi
      }
    });
  } catch (error) {
    console.error('Error adding donasi:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT - Validasi donasi oleh admin
router.put('/donasi/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action harus approve atau reject'
      });
    }

    const query = `
      UPDATE donasi_pengadaan
      SET status = ?, reject_reason = ?, validated_at = NOW()
      WHERE id = ?
    `;

    const status = action === 'approve' ? 'approved' : 'rejected';
    const rejectReason = action === 'reject' ? reason || 'Tidak ada alasan' : null;

    await db.execute(query, [status, rejectReason, id]);

    res.status(200).json({
      success: true,
      message: `Donasi berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`
    });
  } catch (error) {
    console.error('Error validating donasi:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// DELETE - Hapus barang donasi
router.delete('/barang/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM barang_pengadaan
      WHERE id = ?
    `;

    await db.execute(query, [id]);

    res.status(200).json({
      success: true,
      message: 'Barang donasi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting barang donasi:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT - Update progress dana terkumpul
router.put('/barang/:id/update-progress', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE barang_pengadaan
      SET dana_terkumpul = (
        SELECT SUM(nominal)
        FROM donasi_pengadaan
        WHERE barang_id = ? AND status = 'approved'
      )
      WHERE id = ?
    `;

    await db.execute(query, [id, id]);

    res.status(200).json({
      success: true,
      message: 'Progress dana terkumpul berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

module.exports = router;