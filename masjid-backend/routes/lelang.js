const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// import middleware dan utils
const { publicAccess, publicRateLimit, bidRateLimit } = require('../middleware')
const { 
  calculateTimeLeft, 
  formatPublicLelang, 
  formatPublicBids,
  validateBidAmount,
  validateBidder 
} = require('../utils')

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
router.get('/', publicRateLimit, async (req, res) => {
  try {
    const { status, public_view } = req.query
    
    let whereCondition = 'WHERE deleted_at IS NULL'
    let params = []
    
    // Filter by status
    if (status && status !== 'all') {
      whereCondition += ' AND status_lelang = ?'
      params.push(status)
    }
    
    // Untuk public view, hanya tampilkan lelang aktif
    if (public_view === 'true') {
      whereCondition += ' AND status_lelang = "aktif"'
    }
    
    let selectFields = `
      id, nama_barang, deskripsi, harga_awal, foto_barang,
      kondisi_barang, status_lelang, harga_tertinggi, 
      tanggal_lelang, tanggal_mulai, tanggal_selesai, total_bid,
      durasi_lelang_jam, created_at
    `
    
    // Untuk public, hide sensitive admin fields
    if (public_view === 'true') {
      selectFields = `
        id, nama_barang, deskripsi, harga_awal, foto_barang,
        kondisi_barang, status_lelang, harga_tertinggi,
        tanggal_lelang, tanggal_mulai, total_bid, durasi_lelang_jam
      `
    }
    
    const query = `
      SELECT ${selectFields}
      FROM barang_lelang 
      ${whereCondition}
      ORDER BY ${public_view === 'true' ? 'tanggal_mulai DESC' : 'created_at DESC'}
    `
    
    const [rows] = await db.query(query, params)
    
    // Format data untuk public view
    let responseData = rows
    if (public_view === 'true') {
      responseData = formatPublicLelang(rows)
      
      // Filter out lelang yang sudah berakhir
      responseData = responseData.filter(item => item.sisa_detik > 0)
    }
    
    res.json({
      success: true,
      message: 'Data retrieved successfully',
      data: responseData,
      total: responseData.length
    })
  } catch (error) {
    console.error('Error fetching barang lelang:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data barang lelang',
      error: error.message
    })
  }
})

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
router.get('/:id', publicRateLimit, async (req, res) => {
  try {
    const { id } = req.params
    const { public_view } = req.query
    
    let selectFields = `
      id, nama_barang, deskripsi, harga_awal, foto_barang,
      kondisi_barang, status_lelang, harga_tertinggi, pemenang_nama,
      tanggal_lelang, tanggal_mulai, tanggal_selesai, total_bid,
      durasi_lelang_jam, pemenang_kontak, alasan_batal, created_at
    `
    
    // Untuk public, hide sensitive fields
    if (public_view === 'true') {
      selectFields = `
        id, nama_barang, deskripsi, harga_awal, foto_barang,
        kondisi_barang, status_lelang, harga_tertinggi,
        tanggal_lelang, tanggal_mulai, total_bid, durasi_lelang_jam
      `
    }
    
    const query = `
      SELECT ${selectFields}
      FROM barang_lelang 
      WHERE id = ? AND deleted_at IS NULL
    `
    
    const [rows] = await db.query(query, [id])
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang lelang tidak ditemukan'
      })
    }
    
    let responseData = rows[0]
    
    // Format untuk public view
    if (public_view === 'true') {
      const formatted = formatPublicLelang([responseData])
      responseData = formatted[0]
      
      // Cek apakah lelang masih aktif
      if (responseData.status_lelang !== 'aktif' || responseData.sisa_detik <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Lelang sudah tidak aktif'
        })
      }
    }
    
    res.json({
      success: true,
      message: 'Data retrieved successfully',
      data: responseData
    })
  } catch (error) {
    console.error('Error fetching lelang detail:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail lelang',
      error: error.message
    })
  }
})

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

// GET - History bid untuk barang tertentu
// FIX: Update query di GET /:id/bids
router.get('/:id/bids', publicRateLimit, async (req, res) => {
  try {
    const { id } = req.params
    const { public_view } = req.query
    
    // Cek apakah lelang exists dan aktif (untuk public)
    if (public_view === 'true') {
      const [lelangRows] = await db.query(
        'SELECT status_lelang FROM barang_lelang WHERE id = ? AND deleted_at IS NULL',
        [id]
      )
      
      if (lelangRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lelang tidak ditemukan'
        })
      }
      
      // COMMENT INI - terlalu strict untuk development
      // if (lelangRows[0].status_lelang !== 'aktif') {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'History bid hanya tersedia untuk lelang aktif'
      //   })
      // }
    }
    
    // FIX: Include nama_bidder untuk public view
    let selectFields = 'nama_bidder, kontak_bidder, jumlah_bid, tanggal_bid, urutan'
    
    // Untuk public, include nama_bidder tapi hide kontak
    if (public_view === 'true') {
      selectFields = 'nama_bidder, jumlah_bid, tanggal_bid, urutan' // ← ADD nama_bidder
    }
    
    const query = `
      SELECT ${selectFields}
      FROM lelang_bids 
      WHERE barang_lelang_id = ? 
      ORDER BY jumlah_bid DESC, tanggal_bid DESC
      LIMIT ${public_view === 'true' ? '20' : '50'}
    `
    
    const [rows] = await db.query(query, [id])
    
    let responseData = rows
    
    // Format untuk public view
    if (public_view === 'true') {
      responseData = formatPublicBids(rows)
    }
    
    res.json({
      success: true,
      message: 'Bid history retrieved successfully',
      data: responseData,
      total: responseData.length
    })
  } catch (error) {
    console.error('Error fetching bid history:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil history bid',
      error: error.message
    })
  }
})

// FIX: Update POST /:id/bid
router.post('/:id/bid', bidRateLimit, async (req, res) => {
  const connection = await db.getConnection()
  
  try {
    await connection.beginTransaction()
    
    const { id } = req.params
    const { nama_bidder, kontak_bidder, jumlah_bid } = req.body
    
    // Enhanced validation
    const bidderValidation = validateBidder(nama_bidder, kontak_bidder)
    if (!bidderValidation.valid) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: bidderValidation.message
      })
    }
    
    // Cek lelang status dengan lock
    const [lelangRows] = await connection.query(
      'SELECT status_lelang, harga_tertinggi, harga_awal, tanggal_mulai, durasi_lelang_jam FROM barang_lelang WHERE id = ? FOR UPDATE',
      [id]
    )
    
    if (lelangRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: 'Lelang tidak ditemukan'
      })
    }
    
    const lelang = lelangRows[0]
    
    if (lelang.status_lelang !== 'aktif') {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: 'Lelang sudah tidak aktif'
      })
    }
    
    // Cek apakah lelang masih berlangsung
    const sisaDetik = calculateTimeLeft(lelang.tanggal_mulai, lelang.durasi_lelang_jam)
    if (sisaDetik <= 0) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: 'Waktu lelang sudah berakhir'
      })
    }
    
    // Validate bid amount
    const currentHighest = lelang.harga_tertinggi || lelang.harga_awal
    const bidValidation = validateBidAmount(jumlah_bid, currentHighest)
    
    if (!bidValidation.valid) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: bidValidation.message
      })
    }
    
    // Hitung urutan bid
    const [countRows] = await connection.query(
      'SELECT COUNT(*) as total FROM lelang_bids WHERE barang_lelang_id = ?', // ← FIX column name
      [id]
    )
    const nextUrutan = countRows[0].total + 1
    
    // Insert bid baru
    const insertQuery = `
      INSERT INTO lelang_bids (
        barang_lelang_id, nama_bidder, kontak_bidder, jumlah_bid, urutan
      ) VALUES (?, ?, ?, ?, ?)
    `
    
    await connection.query(insertQuery, [
      id, 
      nama_bidder.trim(), 
      kontak_bidder ? kontak_bidder.trim() : null, 
      parseInt(jumlah_bid), 
      nextUrutan
    ])
    
    await connection.commit()
    
    res.json({
      success: true,
      message: 'Bid berhasil disubmit!',
      data: {
        nama_bidder: nama_bidder.trim(),
        jumlah_bid: parseInt(jumlah_bid),
        urutan: nextUrutan,
        sisa_waktu_detik: sisaDetik
      }
    })
    
  } catch (error) {
    await connection.rollback()
    console.error('Error submitting bid:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal submit bid',
      error: error.message
    })
  } finally {
    connection.release()
  }
})

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