const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Konfigurasi multer untuk upload foto barang
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lelang-' + uniqueSuffix + path.extname(file.originalname));
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

// ===== CRUD BARANG LELANG =====

// GET - Ambil semua barang lelang
router.get('/', async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    let query = `
      SELECT 
        id, nama_barang, deskripsi, harga_awal, foto_barang,
        kondisi_barang, status_lelang, harga_tertinggi, pemenang_nama,
        tanggal_lelang, tanggal_mulai, tanggal_selesai, total_bid,
        durasi_lelang_jam, created_at
      FROM barang_lelang 
      WHERE deleted_at IS NULL
    `;
    
    const params = [];
    
    if (status !== 'all') {
      query += ' AND status_lelang = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.query(query, params);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching barang lelang:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET - Ambil barang lelang aktif untuk jamaah
router.get('/aktif', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, nama_barang, deskripsi, harga_awal, foto_barang,
        kondisi_barang, harga_tertinggi, total_bid,
        tanggal_mulai, tanggal_selesai, 
        TIMESTAMPDIFF(SECOND, NOW(), tanggal_selesai) as sisa_detik
      FROM barang_lelang 
      WHERE status_lelang = 'aktif' 
        AND tanggal_selesai > NOW()
        AND deleted_at IS NULL
      ORDER BY tanggal_selesai ASC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST - Tambah barang lelang baru (Admin only)
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { 
      nama_barang, 
      deskripsi, 
      harga_awal, 
      kondisi_barang = 'bekas_baik',
      durasi_lelang_jam = 24 
    } = req.body;
    
    const foto_barang = req.file ? req.file.filename : null;

    if (!nama_barang || !harga_awal) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nama barang dan harga awal wajib diisi!' 
      });
    }

    const [result] = await db.query(`
      INSERT INTO barang_lelang 
      (nama_barang, deskripsi, harga_awal, foto_barang, kondisi_barang, 
       durasi_lelang_jam, tanggal_lelang, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURDATE(), NOW())
    `, [
      nama_barang, 
      deskripsi || '', 
      parseInt(harga_awal), 
      foto_barang, 
      kondisi_barang,
      parseInt(durasi_lelang_jam)
    ]);

    res.status(201).json({
      success: true,
      message: 'Barang lelang berhasil ditambahkan',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Error adding barang lelang:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT - Update barang lelang
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nama_barang, 
      deskripsi, 
      harga_awal, 
      kondisi_barang,
      durasi_lelang_jam 
    } = req.body;
    
    // Check if auction exists and not started
    const [existing] = await db.query(
      'SELECT status_lelang FROM barang_lelang WHERE id = ? AND deleted_at IS NULL', 
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang lelang tidak ditemukan'
      });
    }
    
    if (existing[0].status_lelang === 'aktif') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengubah lelang yang sedang aktif'
      });
    }

    let updateQuery = `
      UPDATE barang_lelang 
      SET nama_barang = ?, deskripsi = ?, harga_awal = ?, 
          kondisi_barang = ?, durasi_lelang_jam = ?, updated_at = NOW()
    `;
    
    const params = [
      nama_barang, 
      deskripsi || '', 
      parseInt(harga_awal), 
      kondisi_barang,
      parseInt(durasi_lelang_jam)
    ];
    
    // Update foto jika ada file baru
    if (req.file) {
      updateQuery += ', foto_barang = ?';
      params.push(req.file.filename);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    await db.query(updateQuery, params);

    res.json({
      success: true,
      message: 'Barang lelang berhasil diperbarui'
    });

  } catch (error) {
    console.error('Error updating barang lelang:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// DELETE - Hapus barang lelang (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if auction can be deleted
    const [existing] = await db.query(
      'SELECT status_lelang FROM barang_lelang WHERE id = ? AND deleted_at IS NULL', 
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang lelang tidak ditemukan'
      });
    }
    
    if (existing[0].status_lelang === 'aktif') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus lelang yang sedang aktif'
      });
    }

    await db.query(
      'UPDATE barang_lelang SET deleted_at = NOW() WHERE id = ?', 
      [id]
    );

    res.json({
      success: true,
      message: 'Barang lelang berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting barang lelang:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// ===== KELOLA STATUS LELANG =====

// POST - Mulai lelang
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await db.query(
      'SELECT * FROM barang_lelang WHERE id = ? AND deleted_at IS NULL', 
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang lelang tidak ditemukan'
      });
    }
    
    const barang = existing[0];
    
    if (barang.status_lelang !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Hanya lelang dengan status draft yang dapat dimulai'
      });
    }

    // Hitung waktu selesai
    const tanggal_mulai = new Date();
    const tanggal_selesai = new Date(tanggal_mulai.getTime() + (barang.durasi_lelang_jam * 60 * 60 * 1000));

    await db.query(`
      UPDATE barang_lelang 
      SET status_lelang = 'aktif', 
          tanggal_mulai = ?, 
          tanggal_selesai = ?,
          harga_tertinggi = harga_awal,
          updated_at = NOW()
      WHERE id = ?
    `, [tanggal_mulai, tanggal_selesai, id]);

    res.json({
      success: true,
      message: 'Lelang berhasil dimulai',
      data: {
        tanggal_mulai,
        tanggal_selesai
      }
    });

  } catch (error) {
    console.error('Error starting auction:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// POST - Batal/stop lelang
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { alasan } = req.body;
    
    await db.query(`
      UPDATE barang_lelang 
      SET status_lelang = 'batal', 
          keterangan_admin = ?,
          updated_at = NOW()
      WHERE id = ? AND status_lelang IN ('draft', 'aktif')
    `, [alasan || 'Dibatalkan oleh admin', id]);

    res.json({
      success: true,
      message: 'Lelang berhasil dibatalkan'
    });

  } catch (error) {
    console.error('Error canceling auction:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// ===== BIDDING SYSTEM =====

// POST - Submit bid
router.post('/:id/bid', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_bidder, kontak_bidder, jumlah_bid } = req.body;

    if (!nama_bidder || !jumlah_bid) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan jumlah bid wajib diisi'
      });
    }

    // Check auction status
    const [auction] = await db.query(
      'SELECT * FROM barang_lelang WHERE id = ? AND status_lelang = "aktif" AND tanggal_selesai > NOW()',
      [id]
    );

    if (auction.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lelang tidak aktif atau sudah berakhir'
      });
    }

    const currentAuction = auction[0];
    const bidAmount = parseInt(jumlah_bid);

    // Validate bid amount
    if (bidAmount <= currentAuction.harga_tertinggi) {
      return res.status(400).json({
        success: false,
        message: `Bid harus lebih tinggi dari Rp ${currentAuction.harga_tertinggi.toLocaleString()}`
      });
    }

    // Insert bid (trigger akan handle auto-extend)
    await db.query(`
      INSERT INTO lelang_bids 
      (barang_lelang_id, nama_bidder, kontak_bidder, jumlah_bid, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `, [id, nama_bidder, kontak_bidder, bidAmount, req.ip]);

    // Get updated auction info
    const [updated] = await db.query(
      'SELECT harga_tertinggi, total_bid, tanggal_selesai FROM barang_lelang WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Bid berhasil disubmit',
      data: {
        harga_tertinggi: updated[0].harga_tertinggi,
        total_bid: updated[0].total_bid,
        tanggal_selesai: updated[0].tanggal_selesai
      }
    });

  } catch (error) {
    console.error('Error submitting bid:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET - History bid untuk barang tertentu
router.get('/:id/bids', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bids] = await db.query(`
      SELECT 
        nama_bidder, jumlah_bid, tanggal_bid,
        ROW_NUMBER() OVER (ORDER BY tanggal_bid DESC) as urutan
      FROM lelang_bids 
      WHERE barang_lelang_id = ?
      ORDER BY tanggal_bid DESC
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      data: bids
    });

  } catch (error) {
    console.error('Error fetching bid history:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// ===== SELESAIKAN LELANG MANUAL =====

// POST - Selesaikan lelang manual (Admin)
router.post('/:id/finish', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [auction] = await db.query(
      'SELECT * FROM barang_lelang WHERE id = ? AND status_lelang = "aktif"',
      [id]
    );

    if (auction.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lelang tidak ditemukan atau tidak aktif'
      });
    }

    await db.query(`
      UPDATE barang_lelang 
      SET status_lelang = "selesai", 
          harga_terjual = harga_tertinggi,
          updated_at = NOW() 
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Lelang berhasil diselesaikan'
    });

  } catch (error) {
    console.error('Error finishing auction:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

module.exports = router;