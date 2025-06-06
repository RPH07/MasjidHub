const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper function untuk filter berdasarkan periode
const getPeriodFilter = (period) => {
  const today = new Date();
  let startDate, endDate;

  switch (period) {
    case 'hari-ini':
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      break;
    case 'minggu-ini':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'bulan-ini':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      break;
    case 'tahun-ini':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear() + 1, 0, 1);
      break;
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// ===== MAIN ENDPOINT: GET kas buku besar berdasarkan periode =====
// router.get('/', async (req, res) => {
//   try {
//     const { period = 'bulan-ini', startDate, endDate } = req.query;
    
//     let dateFilter;
//     if (startDate && endDate) {
//       dateFilter = { startDate, endDate };
//     } else {
//       dateFilter = getPeriodFilter(period);
//     }

//     // Ambil dari kas_buku_besar
//     const [rows] = await db.query(
//       'SELECT * FROM kas_buku_besar WHERE tanggal >= ? AND tanggal < ? ORDER BY tanggal DESC, id DESC',
//       [dateFilter.startDate, dateFilter.endDate]
//     );
    
//     res.json(rows);
//   } catch (err) {
//     console.error('Gagal mengambil data kas buku besar:', err);
//     res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kas' });
//   }
// });

router.get('/', async (req, res) => {
  try {
    const { period = 'bulan-ini' } = req.query;
    const { startDate, endDate } = getPeriodFilter(period);

    // 1. Kas manual saja (EXCLUDE yang dari zakat/infaq untuk avoid double)
    const [kasRows] = await db.query(`
      SELECT * FROM kas_buku_besar 
      WHERE tanggal >= ? AND tanggal <= ?
      AND (source_table IS NULL OR source_table NOT IN ('zakat', 'infaq'))
      ORDER BY tanggal DESC, created_at DESC
    `, [startDate, endDate]);

    // 2. Zakat - HANYA APPROVED, langsung dari table zakat
    const [zakatRows] = await db.query(`
      SELECT id, nama, jenis_zakat, jumlah, bukti_transfer, created_at, metode_pembayaran
      FROM zakat 
      WHERE status = 'approved' 
      AND DATE(created_at) >= ? AND DATE(created_at) <= ?
      ORDER BY created_at DESC
    `, [startDate, endDate]);

    // 3. Infaq - HANYA APPROVED, langsung dari table infaq
    const [infaqRows] = await db.query(`
      SELECT id, nama_pemberi, jumlah, keterangan, kategori_infaq, tanggal
      FROM infaq 
      WHERE status = 'approved'
      AND DATE(tanggal) >= ? AND DATE(tanggal) <= ?
      ORDER BY tanggal DESC
    `, [startDate, endDate]);

    const lelangRows = []; // Kosongkan sementara

    res.json({
      success: true,
      data: {
        kas: kasRows,
        zakat: zakatRows,
        infaq: infaqRows,
        lelang: lelangRows
      }
    });

  } catch (err) {
    console.error('Error fetching kas data:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil data kas' 
    });
  }
});

// Update summary juga
router.get('/summary', async (req, res) => {
  try {
    const { period = 'bulan-ini' } = req.query;
    const { startDate, endDate } = getPeriodFilter(period);

    // Kas manual saja (EXCLUDE zakat/infaq untuk avoid double counting)
    const [pemasukanResult] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END), 0) as kas_masuk,
        COALESCE(SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END), 0) as kas_keluar
      FROM kas_buku_besar 
      WHERE tanggal >= ? AND tanggal <= ?
      AND (source_table IS NULL OR source_table NOT IN ('zakat', 'infaq'))
    `, [startDate, endDate]);

    // Zakat - HANYA APPROVED
    const [zakatResult] = await db.query(`
      SELECT COALESCE(SUM(jumlah), 0) as total_zakat
      FROM zakat 
      WHERE status = 'approved'
      AND DATE(created_at) >= ? AND DATE(created_at) <= ?
    `, [startDate, endDate]);

    // Infaq - HANYA APPROVED
    const [infaqResult] = await db.query(`
      SELECT COALESCE(SUM(jumlah), 0) as total_infaq
      FROM infaq 
      WHERE status = 'approved'
      AND DATE(tanggal) >= ? AND DATE(tanggal) <= ?
    `, [startDate, endDate]);

    const kasManual = Number(pemasukanResult[0].kas_masuk) || 0;
    const totalZakat = Number(zakatResult[0].total_zakat) || 0;
    const totalInfaq = Number(infaqResult[0].total_infaq) || 0;
    const totalPengeluaran = Number(pemasukanResult[0].kas_keluar) || 0;

    // Mathematical addition
    const totalPemasukan = kasManual + totalZakat + totalInfaq;
    const saldoBersih = totalPemasukan - totalPengeluaran;

    // const totalPemasukan = 
    //   pemasukanResult[0].kas_masuk + 
    //   zakatResult[0].total_zakat + 
    //   infaqResult[0].total_infaq;

    // const totalPengeluaran = pemasukanResult[0].kas_keluar;
    // const saldoBersih = totalPemasukan - totalPengeluaran;
    
    //     console.log('Final summary:', {
    //   totalPemasukan,
    //   breakdown: {
    //     kasManual: pemasukanResult[0].kas_masuk,
    //     zakat: zakatResult[0].total_zakat,
    //     infaq: infaqResult[0].total_infaq,
    //     lelang: 0
    //   }
    // });
    res.json({
      success: true,
      data: {
        totalPemasukan,
        totalPengeluaran,
        saldoBersih,
        breakdown: {
          kasManual: pemasukanResult[0].kas_masuk,
          zakat: zakatResult[0].total_zakat,
          infaq: infaqResult[0].total_infaq,
          lelang: 0
        }
      }
    });

  } catch (err) {
    console.error('Error fetching kas summary:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil ringkasan kas' 
    });
  }
});

// ===== GET kas manual only (untuk CRUD admin) =====
router.get('/manual', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    // Ambil hanya data manual dari kas_manual
    const [rows] = await db.query(
      'SELECT * FROM kas_manual WHERE tanggal >= ? AND tanggal < ? ORDER BY tanggal DESC',
      [dateFilter.startDate, dateFilter.endDate]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data kas manual:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kas manual' });
  }
});


// GET zakat berdasarkan periode (untuk compatibility)
router.get('/zakat', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }    // Ambil dari kas_buku_besar dengan filter source_table = 'zakat' dan status approved
    const [rows] = await db.query(`
      SELECT 
        kb.*,
        z.nama, z.jenis_zakat, z.bukti_transfer, z.metode_pembayaran, z.created_at, z.status
      FROM kas_buku_besar kb
      LEFT JOIN zakat z ON kb.source_id = z.id AND kb.source_table = 'zakat'
      WHERE kb.source_table = 'zakat' 
        AND z.status = 'approved'
        AND kb.tanggal >= ? AND kb.tanggal < ? 
      ORDER BY kb.tanggal DESC
    `, [dateFilter.startDate, dateFilter.endDate]);
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data zakat:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data zakat' });
  }
});

// GET infaq berdasarkan periode (untuk compatibility)
router.get('/infaq', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    // Ambil dari kas_buku_besar dengan filter source_table = 'infaq'
    const [rows] = await db.query(`
      SELECT 
        kb.*,
        i.nama_pemberi, i.keterangan as infaq_keterangan, i.kategori_infaq, 
        i.metode_pembayaran, i.bukti_transfer, i.metode_input, i.tanggal as infaq_tanggal
      FROM kas_buku_besar kb
      LEFT JOIN infaq i ON kb.source_id = i.id AND kb.source_table = 'infaq'
      WHERE kb.source_table = 'infaq' 
        AND kb.tanggal >= ? AND kb.tanggal < ? 
      ORDER BY kb.tanggal DESC
    `, [dateFilter.startDate, dateFilter.endDate]);
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data infaq:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data infaq' });
  }
});

// GET lelang berdasarkan periode (untuk compatibility)
router.get('/lelang', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    // Ambil dari kas_buku_besar dengan filter source_table = 'lelang'
    const [rows] = await db.query(`
      SELECT 
        kb.*,
        bl.nama_barang, bl.deskripsi, bl.harga_awal, bl.tanggal_lelang
      FROM kas_buku_besar kb
      LEFT JOIN barang_lelang bl ON kb.source_id = bl.id AND kb.source_table = 'lelang'
      WHERE kb.source_table = 'lelang' 
        AND kb.tanggal >= ? AND kb.tanggal < ? 
      ORDER BY kb.tanggal DESC
    `, [dateFilter.startDate, dateFilter.endDate]);
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data lelang:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data lelang' });
  }
});

// ===== CRUD OPERATIONS untuk kas manual =====
// POST tambah transaksi kas manual
router.post('/', async (req, res) => {
  const { tanggal, keterangan, jenis, jumlah, kategori, kategori_pemasukan } = req.body;

  if (!tanggal || !keterangan || !jenis || !jumlah) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  if (!['masuk', 'keluar'].includes(jenis)) {
    return res.status(400).json({ message: 'Jenis harus masuk atau keluar' });
  }

  try {
    // Insert ke kas_manual, trigger akan otomatis insert ke kas_buku_besar
    const [result] = await db.query(
      'INSERT INTO kas_manual (tanggal, keterangan, jenis, jumlah, kategori, kategori_pemasukan) VALUES (?, ?, ?, ?, ?, ?)',
      [tanggal, keterangan, jenis, jumlah, kategori || 'operasional', kategori_pemasukan || null]
    );
    
    res.status(201).json({ 
      message: 'Transaksi kas berhasil ditambahkan', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Gagal menambahkan transaksi kas:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan transaksi kas' });
  }
});

// PUT update transaksi kas manual
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { tanggal, keterangan, jenis, jumlah, kategori, kategori_pemasukan } = req.body;

  if (!tanggal || !keterangan || !jenis || !jumlah) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    // Update kas_manual, trigger akan otomatis update kas_buku_besar
    const [result] = await db.query(
      'UPDATE kas_manual SET tanggal = ?, keterangan = ?, jenis = ?, jumlah = ?, kategori = ?, kategori_pemasukan = ? WHERE id = ?',
      [tanggal, keterangan, jenis, jumlah, kategori || 'operasional', kategori_pemasukan || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi kas tidak ditemukan' });
    }

    res.json({ message: 'Transaksi kas berhasil diupdate' });
  } catch (err) {
    console.error('Gagal mengupdate transaksi kas:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate transaksi kas' });
  }
});

// DELETE transaksi kas manual
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete dari kas_manual, trigger akan otomatis delete dari kas_buku_besar
    const [result] = await db.query('DELETE FROM kas_manual WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi kas tidak ditemukan' });
    }

    res.json({ message: 'Transaksi kas berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus transaksi kas:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus transaksi kas' });
  }
});

// ===== GET pembayaran pending untuk validasi admin =====
router.get('/pending', async (req, res) => {
  try {
    // Get pending zakat
    const [zakatRows] = await db.query(`
      SELECT id, nama as nama_pemberi, jumlah, jenis_zakat, bukti_transfer, 
             metode_pembayaran, created_at, 'zakat' as type
      FROM zakat 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);

    // Get pending infaq
    const [infaqRows] = await db.query(`
      SELECT id, nama_pemberi, jumlah, kategori_infaq, bukti_transfer, 
             metode_pembayaran, tanggal as created_at, 'infaq' as type
      FROM infaq 
      WHERE status = 'pending'
      ORDER BY tanggal DESC
    `);

    // Combine and sort by date
    const allPending = [...zakatRows, ...infaqRows].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    res.json({
      success: true,
      data: allPending
    });

  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// Endpoint untuk validate transaction (unified)
router.put('/validate/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action, reason } = req.body;

    if (!['zakat', 'infaq'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type harus zakat atau infaq' 
      });
    }

    // Forward to appropriate route
    if (type === 'zakat') {
      // Forward to zakat validation
      const zakatRoute = require('./zakat');
      req.params.id = id;
      return zakatRoute.handle(req, res);
    } else {
      // Forward to infaq validation  
      const infaqRoute = require('./infaq');
      req.params.id = id;
      return infaqRoute.handle(req, res);
    }

  } catch (error) {
    console.error('Error in validation router:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// ===== PUT approve/reject pembayaran =====
router.put('/validate/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action harus approve atau reject' });
    }

    if (!['zakat', 'infaq'].includes(type)) {
      return res.status(400).json({ message: 'Type harus zakat atau infaq' });
    }

    let tableName = type;
    let dataQuery = '';
    let updateQuery = '';

    if (type === 'zakat') {
      dataQuery = 'SELECT * FROM zakat WHERE id = ?';
      updateQuery = 'UPDATE zakat SET status = ?, validated_at = NOW() WHERE id = ?';
    } else {
      dataQuery = 'SELECT * FROM infaq WHERE id = ?';
      updateQuery = 'UPDATE infaq SET status = ?, validated_at = NOW() WHERE id = ?';
    }

    // Get data first
    const [dataRows] = await db.query(dataQuery, [id]);
    
    if (dataRows.length === 0) {
      return res.status(404).json({ message: `Data ${type} tidak ditemukan` });
    }

    const itemData = dataRows[0];

    if (itemData.status !== 'pending') {
      return res.status(400).json({ message: 'Data sudah divalidasi sebelumnya' });
    }

    if (action === 'approve') {
      // Update status ke approved
      await db.query(updateQuery, ['approved', id]);
      
      // Insert ke kas_buku_besar
      let kategori, keterangan, jumlah, tanggal;
      
      if (type === 'zakat') {
        kategori = `zakat_${itemData.jenis_zakat}`;
        keterangan = `Zakat ${itemData.jenis_zakat} dari ${itemData.nama}`;
        jumlah = itemData.nominal || itemData.jumlah;
        tanggal = new Date().toISOString().split('T')[0];
      } else {
        kategori = `infaq_${itemData.kategori_infaq || 'umum'}`;
        keterangan = `Infaq dari ${itemData.nama_pemberi} - ${itemData.infaq_keterangan || ''}`;
        jumlah = itemData.nominal || itemData.jumlah;
        tanggal = itemData.tanggal;
      }

      await db.query(`
        INSERT INTO kas_buku_besar (tanggal, deskripsi, jenis, jumlah, kategori, source_table, source_id, created_at)
        VALUES (?, ?, 'masuk', ?, ?, ?, ?, NOW())
      `, [tanggal, keterangan, jumlah, kategori, type, id]);

      res.json({
        success: true,
        message: `Pembayaran ${type} berhasil diapprove`
      });
    } else {
      // Update status ke rejected
      await db.query(updateQuery, ['rejected', id]);
      
      res.json({
        success: true,
        message: `Pembayaran ${type} telah ditolak`
      });
    }

  } catch (err) {
    console.error('Error validating payment:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat validasi pembayaran' });
      console.error('Error validating payment:', err.message || err.sqlMessage || err);
  }
});

// GET - History endpoint dengan filtering
router.get('/history', async (req, res) => {
  try {
    const { 
      period = 'bulan-ini',
      startDate,
      endDate,
      type = 'all', // 'zakat', 'infaq', 'kas', 'all'
      status = 'all' // 'approved', 'rejected', 'pending', 'all'
    } = req.query;

    // Get date filter
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    console.log('History filter:', { period, type, status, dateFilter });

    let transactions = [];

    // 1. Fetch Zakat data
    if (type === 'all' || type === 'zakat') {
      let zakatQuery = `
        SELECT 
          id,
          nama as nama_pemberi,
          jumlah,
          jenis_zakat,
          bukti_transfer,
          metode_pembayaran,
          status,
          reject_reason,
          validated_at,
          created_at,
          'zakat' as type,
          'Zakat' as type_label
        FROM zakat 
        WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
      `;
      
      const zakatParams = [dateFilter.startDate, dateFilter.endDate];
      
      if (status !== 'all') {
        zakatQuery += ' AND status = ?';
        zakatParams.push(status);
      }
      
      zakatQuery += ' ORDER BY created_at DESC';
      
      const [zakatRows] = await db.query(zakatQuery, zakatParams);
      transactions.push(...zakatRows);
    }

    // 2. Fetch Infaq data
    if (type === 'all' || type === 'infaq') {
      let infaqQuery = `
        SELECT 
          id,
          nama_pemberi,
          jumlah,
          kategori_infaq,
          keterangan,
          bukti_transfer,
          metode_pembayaran,
          status,
          reject_reason,
          validated_at,
          tanggal as created_at,
          'infaq' as type,
          'Infaq' as type_label
        FROM infaq 
        WHERE DATE(tanggal) >= ? AND DATE(tanggal) <= ?
      `;
      
      const infaqParams = [dateFilter.startDate, dateFilter.endDate];
      
      if (status !== 'all') {
        infaqQuery += ' AND status = ?';
        infaqParams.push(status);
      }
      
      infaqQuery += ' ORDER BY tanggal DESC';
      
      const [infaqRows] = await db.query(infaqQuery, infaqParams);
      transactions.push(...infaqRows);
    }

    // 3. Fetch Kas Manual data (always approved)
    if (type === 'all' || type === 'kas') {
      const kasQuery = `
        SELECT 
          id,
          keterangan as nama_pemberi,
          jumlah,
          jenis as kas_jenis,
          kategori,
          NULL as bukti_transfer,
          'manual' as metode_pembayaran,
          'approved' as status,
          NULL as reject_reason,
          created_at as validated_at,
          tanggal as created_at,
          'kas' as type,
          CONCAT('Kas ', UPPER(jenis)) as type_label
        FROM kas_buku_besar 
        WHERE tanggal >= ? AND tanggal <= ?
        AND (source_table IS NULL OR source_table NOT IN ('zakat', 'infaq'))
      `;
      
      const kasParams = [dateFilter.startDate, dateFilter.endDate];
      
      // Filter kas by status if needed (only show if status is 'all' or 'approved')
      if (status === 'approved' || status === 'all') {
        const [kasRows] = await db.query(kasQuery + ' ORDER BY tanggal DESC', kasParams);
        transactions.push(...kasRows);
      }
    }

    // Sort all transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate summary stats
    const summary = {
      total: transactions.length,
      approved: transactions.filter(t => t.status === 'approved').length,
      rejected: transactions.filter(t => t.status === 'rejected').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      totalAmount: {
        approved: transactions
          .filter(t => t.status === 'approved')
          .reduce((sum, t) => sum + Number(t.jumlah || 0), 0),
        rejected: transactions
          .filter(t => t.status === 'rejected')
          .reduce((sum, t) => sum + Number(t.jumlah || 0), 0),
        pending: transactions
          .filter(t => t.status === 'pending')
          .reduce((sum, t) => sum + Number(t.jumlah || 0), 0)
      }
    };

    res.json({
      success: true,
      data: {
        transactions,
        summary,
        filters: {
          period,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          type,
          status
        }
      }
    });

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil riwayat transaksi'
    });
  }
});

// GET - Export history to Excel/CSV
router.get('/history/export', async (req, res) => {
  try {
    const { 
      period = 'bulan-ini',
      startDate,
      endDate,
      type = 'all',
      status = 'all',
      format = 'csv' // 'csv' or 'excel'
    } = req.query;

    // Reuse history logic to get data
    const historyReq = {
      query: { period, startDate, endDate, type, status }
    };
    
    // Get the same data as history endpoint
    // (We can refactor this to a shared function later)
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    let transactions = [];

    // Same logic as history endpoint...
    if (type === 'all' || type === 'zakat') {
      let zakatQuery = `
        SELECT 
          id,
          nama as nama_pemberi,
          jumlah,
          jenis_zakat,
          bukti_transfer,
          metode_pembayaran,
          status,
          reject_reason,
          validated_at,
          created_at,
          'zakat' as type
        FROM zakat 
        WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
      `;
      
      const zakatParams = [dateFilter.startDate, dateFilter.endDate];
      if (status !== 'all') {
        zakatQuery += ' AND status = ?';
        zakatParams.push(status);
      }
      
      const [zakatRows] = await db.query(zakatQuery, zakatParams);
      transactions.push(...zakatRows);
    }

    if (type === 'all' || type === 'infaq') {
      let infaqQuery = `
        SELECT 
          id,
          nama_pemberi,
          jumlah,
          kategori_infaq,
          keterangan,
          bukti_transfer,
          metode_pembayaran,
          status,
          reject_reason,
          validated_at,
          tanggal as created_at,
          'infaq' as type
        FROM infaq 
        WHERE DATE(tanggal) >= ? AND DATE(tanggal) <= ?
      `;
      
      const infaqParams = [dateFilter.startDate, dateFilter.endDate];
      if (status !== 'all') {
        infaqQuery += ' AND status = ?';
        infaqParams.push(status);
      }
      
      const [infaqRows] = await db.query(infaqQuery, infaqParams);
      transactions.push(...infaqRows);
    }

    if (type === 'all' || type === 'kas') {
      if (status === 'approved' || status === 'all') {
        const [kasRows] = await db.query(`
          SELECT 
            id,
            keterangan as nama_pemberi,
            jumlah,
            kategori,
            tanggal as created_at,
            'kas' as type,
            'approved' as status
          FROM kas_buku_besar 
          WHERE tanggal >= ? AND tanggal <= ?
          AND (source_table IS NULL OR source_table NOT IN ('zakat', 'infaq'))
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...kasRows);
      }
    }

    // Sort by date
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Tanggal,Type,Nama,Jumlah,Status,Metode Pembayaran,Alasan Tolak\n';
      const csvData = transactions.map(t => 
        `${new Date(t.created_at).toLocaleDateString('id-ID')},${t.type},${t.nama_pemberi},"${t.jumlah}",${t.status},${t.metode_pembayaran || 'manual'},"${t.reject_reason || ''}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transaction-history-${Date.now()}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      // For Excel, return JSON for now (frontend can convert)
      res.json({
        success: true,
        data: transactions,
        filename: `transaction-history-${Date.now()}.xlsx`
      });
    }

  } catch (error) {
    console.error('Error exporting transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat export data'
    });
  }
});

module.exports = router;