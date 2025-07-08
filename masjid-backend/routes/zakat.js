const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');

// Helper function untuk generate kode unik zakat
const generateKodeUnikZakat = () => {
  const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10; // Range 10-99
  return parseInt('2' + randomNumber); // Prefix '2' untuk zakat
};

// Konfigurasi multer untuk upload bukti transfer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/bukti-zakat');
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

// ✅ NEW: POST - Generate kode unik saja (sebelum submit final)
router.post('/generate-kode', async (req, res) => {
  try {
    console.log('🔄 Generating kode unik...');
    console.log('📋 Request body:', req.body);
    
    const { nominal } = req.body;

    if (!nominal || nominal <= 0) {
      console.log('❌ Invalid nominal:', nominal);
      return res.status(400).json({ 
        success: false, 
        message: 'Nominal harus lebih dari 0' 
      });
    }

    // Generate kode unik
    const kodeUnik = generateKodeUnikZakat();
    const totalBayar = parseInt(nominal) + kodeUnik;

    console.log('✅ Generated kode unik:', kodeUnik);
    console.log('💰 Total bayar:', totalBayar);
    console.log('📤 Sending response...');

    res.json({
      success: true,
      message: 'Kode unik berhasil di-generate',
      data: {
        kode_unik: kodeUnik,
        total_bayar: totalBayar,
        nominal: parseInt(nominal)
      }
    });

  } catch (error) {
    console.error('❌ Error generating kode unik:', error);
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat generate kode unik',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST - Submit pembayaran zakat
router.post('/', upload.single('bukti'), async (req, res) => {
  try {
    console.log('🚀 Zakat submission received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request file:', req.file);
    console.log('🔑 Request headers:', req.headers);

    let user_id = null;
console.log('🔍 Checking authorization header...');
if (req.headers.authorization) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log('🎫 Extracted token:', token ? 'EXISTS' : 'NULL');
    
    // ✅ FIX: Pastikan jwtSecret didefinisikan dulu
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    console.log('🔐 JWT Secret exists:', jwtSecret ? 'YES' : 'NO');
    
    const decoded = jwt.verify(token, jwtSecret);
    user_id = decoded.id;
    console.log('👤 User login detected, ID:', user_id);
    console.log('👤 Decoded user data:', decoded);
    
  } catch (error) { // ✅ FIX: Variable name harus 'error' bukan 'jwtError'
    console.log('🔓 JWT Verification failed:', error.message); // ✅ FIX: 'error' bukan 'jwtError'
    console.log('🔓 Anonymous user (invalid token)');
    // user_id tetap null untuk anonymous user
  } 
} else {
  console.log('🔓 No authorization header found - anonymous user');
}

console.log('🎯 Final user_id for zakat:', user_id);

    const { 
      nama, 
      email, 
      no_telepon, 
      jenis_zakat,        
      jumlah_jiwa,        
      total_harta,          
      gaji_kotor,         
      nominal,            
      kode_unik,          
      total_bayar,        
      metode_pembayaran   
    } = req.body;
    
    const buktiTransfer = req.file ? req.file.filename : null;

    // Validasi field yang wajib
    if (!nama || !email || !no_telepon || !jenis_zakat || !nominal || !metode_pembayaran) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Field nama, email, no_telepon, jenis_zakat, nominal, dan metode_pembayaran harus diisi!' 
      });
    }

    // Untuk transfer/qris wajib ada bukti, untuk cash/tunai opsional
    if ((metode_pembayaran === 'transfer' || metode_pembayaran === 'qris') && !buktiTransfer) {
      console.log('❌ Missing bukti transfer for non-cash payment');
      return res.status(400).json({ 
        success: false, 
        message: 'Bukti transfer harus diupload untuk metode pembayaran selain tunai!' 
      });
    }

    // Generate kode unik jika belum ada dari frontend
    const finalKodeUnik = kode_unik || generateKodeUnikZakat();
    const finalTotalBayar = total_bayar || (parseInt(nominal) + finalKodeUnik);

    console.log('💰 Final calculation:');
    console.log('- Nominal:', nominal);
    console.log('- Kode Unik:', finalKodeUnik);
    console.log('- Total Bayar:', finalTotalBayar);

    // Query dengan field lengkap
    const query = `
  INSERT INTO zakat (
    user_id,
    nama, 
    email, 
    no_telepon, 
    jenis_zakat, 
    jumlah_jiwa, 
    total_harta, 
    gaji_kotor, 
    jumlah, 
    kode_unik, 
    total_bayar, 
    metode_pembayaran, 
    bukti_transfer, 
    status, 
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
`;
//          1  2  3  4  5  6  7  8  9  10 11 12 13     14      15
//          ↑ 13 placeholder + 'pending' + NOW() = 15 values ✅

// ✅ VALUES tetap 13 elements (untuk 13 placeholder)
const values = [
  user_id,                    // 1
  nama,                       // 2
  email,                      // 3
  no_telepon,                 // 4
  jenis_zakat,                // 5
  jumlah_jiwa || null,        // 6
  total_harta || null,        // 7
  gaji_kotor || null,         // 8
  nominal,                    // 9
  finalKodeUnik,              // 10
  finalTotalBayar,            // 11
  metode_pembayaran,          // 12
  buktiTransfer               // 13
  // status = 'pending' (hardcoded di query)
  // created_at = NOW() (hardcoded di query)
];

    console.log('📝 Executing query with values:', values);

    const [result] = await db.execute(query, values);

    console.log('✅ Zakat submitted successfully with ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Pembayaran zakat berhasil dikirim! Menunggu verifikasi admin.',
      data: {
        id: result.insertId,
        kode_unik: finalKodeUnik,
        total_bayar: finalTotalBayar,
        user_id: user_id
      }
    });

  } catch (error) {
    console.error('❌ Error submitting zakat:', error);
    
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message,
        stack: error.stack
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT - Approve/Reject pembayaran zakat
router.put('/:id/validate', async (req, res) => {
  try {
    console.log('🔍 Validating zakat ID:', req.params.id);
    
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      console.log('❌ Invalid action:', action);
      return res.status(400).json({ 
        success: false,
        message: 'Action harus approve atau reject' 
      });
    }

    // Get zakat data
    const [zakatRows] = await db.query('SELECT * FROM zakat WHERE id = ?', [id]);
    
    if (zakatRows.length === 0) {
      console.log('❌ Zakat not found for ID:', id);
      return res.status(404).json({ 
        success: false,
        message: 'Data zakat tidak ditemukan' 
      });
    }

    const zakatData = zakatRows[0];
    console.log('📊 Zakat data found:', zakatData);

    if (zakatData.status !== 'pending') {
      console.log('❌ Zakat already validated with status:', zakatData.status);
      return res.status(400).json({ 
        success: false,
        message: 'Zakat sudah divalidasi sebelumnya' 
      });
    }

    if (action === 'approve') {
      console.log('✅ Approving zakat...');
      
      await db.query(
        'UPDATE zakat SET status = ?, validated_at = NOW() WHERE id = ?',
        ['approved', id]
      );
      
      console.log('✅ Zakat approved successfully');

      res.json({
        success: true,
        message: 'Zakat berhasil diapprove'
      });
    } else {
      console.log('❌ Rejecting zakat with reason:', reason);
      
      await db.query(
        'UPDATE zakat SET status = ?, reject_reason = ?, validated_at = NOW() WHERE id = ?',
        ['rejected', reason || 'Tidak ada alasan yang diberikan', id]
      );
      
      console.log('❌ Zakat rejected successfully');
      
      res.json({
        success: true,
        message: 'Zakat telah ditolak'
      });
    }

  } catch (err) {
    console.error('❌ Error validating zakat:', err);
    
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan saat validasi zakat',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET - Ambil data zakat pending untuk validasi
router.get('/pending', async (req, res) => {
  try {
    console.log('📋 Fetching pending zakat...');
    
    const [rows] = await db.execute(`
      SELECT 
        id, user_id, nama, email, no_telepon, jenis_zakat, 
        jumlah_jiwa, total_harta, gaji_kotor, jumlah, 
        kode_unik, total_bayar, metode_pembayaran, 
        bukti_transfer, created_at,
        nama as nama_pemberi
      FROM zakat 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Found ${rows.length} pending zakat entries`);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Error fetching pending zakat:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET - Ambil semua data zakat (untuk admin)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all zakat data...');
    
    const [rows] = await db.execute(`
      SELECT 
        id, user_id, nama, email, no_telepon, jenis_zakat, jumlah_jiwa, 
        total_harta, gaji_kotor, jumlah, kode_unik, total_bayar,
        bukti_transfer, metode_pembayaran, status, created_at, validated_at,
        reject_reason
      FROM zakat 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Error fetching zakat data:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

//GET - History zakat untuk user tertentu
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📋 Fetching zakat history for user:', userId);
    
    const [rows] = await db.execute(`
      SELECT 
        id, nama, email, no_telepon, jenis_zakat, 
        jumlah_jiwa, total_harta, gaji_kotor, jumlah, 
        kode_unik, total_bayar, metode_pembayaran, 
        bukti_transfer, status, created_at, validated_at,
        reject_reason
      FROM zakat 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    console.log(`📊 Found ${rows.length} zakat entries for user ${userId}`);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Error fetching user zakat history:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;