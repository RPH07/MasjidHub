const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/kontribusi/history/:userId - Gabungan zakat + donasi
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, jenis, startDate, endDate } = req.query;

    console.log('📋 Fetching combined history for user:', userId);
    console.log('🔍 Filters:', { status, jenis, startDate, endDate });

    // Query donasi pengadaan
    let donasiQuery = `
      SELECT 
        'donasi' as type,
        d.id,
        d.nama_donatur as nama,
        d.nominal as jumlah,
        d.metode_pembayaran,
        d.status,
        d.created_at,
        d.validated_at,
        d.bukti_transfer,
        d.kode_unik,
        d.total_transfer,
        CONCAT('Donasi: ', b.nama_barang) as detail_program,
        NULL as jenis_kontribusi,
        d.catatan
      FROM donasi_pengadaan d
      LEFT JOIN barang_pengadaan b ON d.barang_id = b.id
      WHERE d.user_id = ?
    `;

    // Query zakat
    let zakatQuery = `
      SELECT 
        'zakat' as type,
        z.id,
        z.nama,
        z.jumlah,
        z.metode_pembayaran,
        z.status,
        z.created_at,
        z.validated_at,
        z.bukti_transfer,
        z.kode_unik,
        z.total_bayar as total_transfer,
        CONCAT('Zakat ', UPPER(z.jenis_zakat)) as detail_program,
        z.jenis_zakat as jenis_kontribusi,
        z.reject_reason as catatan
      FROM zakat z
      WHERE z.user_id = ?
    `;

    const queryParams = [userId, userId];

    // Add filters
    if (status && status !== 'all') {
      donasiQuery += ` AND d.status = ?`;
      zakatQuery += ` AND z.status = ?`;
      queryParams.push(status, status);
    }

    if (jenis && jenis !== 'all') {
      if (jenis === 'donasi') {
        zakatQuery = 'SELECT NULL as type, NULL as id, NULL as nama, NULL as jumlah, NULL as metode_pembayaran, NULL as status, NULL as created_at, NULL as validated_at, NULL as bukti_transfer, NULL as kode_unik, NULL as total_transfer, NULL as detail_program, NULL as jenis_kontribusi, NULL as catatan LIMIT 0';
      } else if (jenis === 'zakat') {
        donasiQuery = 'SELECT NULL as type, NULL as id, NULL as nama, NULL as jumlah, NULL as metode_pembayaran, NULL as status, NULL as created_at, NULL as validated_at, NULL as bukti_transfer, NULL as kode_unik, NULL as total_transfer, NULL as detail_program, NULL as jenis_kontribusi, NULL as catatan LIMIT 0';
      } else if (['fitrah', 'maal', 'profesi'].includes(jenis)) {
        zakatQuery += ` AND z.jenis_zakat = ?`;
        donasiQuery = 'SELECT NULL as type, NULL as id, NULL as nama, NULL as jumlah, NULL as metode_pembayaran, NULL as status, NULL as created_at, NULL as validated_at, NULL as bukti_transfer, NULL as kode_unik, NULL as total_transfer, NULL as detail_program, NULL as jenis_kontribusi, NULL as catatan LIMIT 0';
        queryParams.push(jenis);
      }
    }

    if (startDate && endDate) {
      donasiQuery += ` AND DATE(d.created_at) BETWEEN ? AND ?`;
      zakatQuery += ` AND DATE(z.created_at) BETWEEN ? AND ?`;
      queryParams.push(startDate, endDate, startDate, endDate);
    }

    // Combine with UNION
    const finalQuery = `
      (${donasiQuery})
      UNION ALL
      (${zakatQuery})
      ORDER BY created_at DESC
    `;

    const [rows] = await db.execute(finalQuery, queryParams);

    // Filter out null results
    const filteredRows = rows.filter(row => row.type !== null);

    console.log(`📊 Found ${filteredRows.length} total contributions for user ${userId}`);

    res.json({
      success: true,
      data: filteredRows
    });

  } catch (error) {
    console.error('❌ Error fetching contribution history:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil history kontribusi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/kontribusi/summary/:userId - Summary kontribusi user
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📊 Fetching contribution summary for user:', userId);

    const [summaryRows] = await db.execute(`
      SELECT 
        'donasi' as type,
        COUNT(*) as total_count,
        COALESCE(SUM(nominal), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN nominal ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN nominal ELSE 0 END), 0) as pending_amount
      FROM donasi_pengadaan 
      WHERE user_id = ?
      
      UNION ALL
      
      SELECT 
        'zakat' as type,
        COUNT(*) as total_count,
        COALESCE(SUM(jumlah), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN jumlah ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN jumlah ELSE 0 END), 0) as pending_amount
      FROM zakat 
      WHERE user_id = ?
    `, [userId, userId]);

    const summary = {
      donasi: summaryRows.find(row => row.type === 'donasi') || {
        total_count: 0, total_amount: 0, approved_amount: 0, pending_amount: 0
      },
      zakat: summaryRows.find(row => row.type === 'zakat') || {
        total_count: 0, total_amount: 0, approved_amount: 0, pending_amount: 0
      }
    };

    // Total gabungan
    summary.total = {
      total_count: summary.donasi.total_count + summary.zakat.total_count,
      total_amount: summary.donasi.total_amount + summary.zakat.total_amount,
      approved_amount: summary.donasi.approved_amount + summary.zakat.approved_amount,
      pending_amount: summary.donasi.pending_amount + summary.zakat.pending_amount
    };

    console.log('📈 Summary generated:', summary);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Error fetching contribution summary:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil summary kontribusi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;