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

router.get('/', async (req, res) => {
  try {
    const { period = 'bulan-ini' } = req.query;
    const { startDate, endDate } = getPeriodFilter(period);

    // 1. Kas manual
    const [kasRows] = await db.query(`
      SELECT * FROM kas_buku_besar 
      WHERE tanggal >= ? AND tanggal <= ?
      AND (source_table IS NULL OR source_table NOT IN ('zakat', 'infaq'))
      AND deleted_at IS NULL
      ORDER BY tanggal DESC, created_at DESC
    `, [startDate, endDate]);

    // 2. Zakat
    const [zakatRows] = await db.query(`
      SELECT id, nama, jenis_zakat, jumlah, bukti_transfer, created_at, metode_pembayaran
      FROM zakat 
      WHERE status = 'approved' 
      AND DATE(created_at) >= ? AND DATE(created_at) <= ?
      ORDER BY created_at DESC
    `, [startDate, endDate]);

    // 3. Infaq 
    const [infaqRows] = await db.query(`
      SELECT id, nama_pemberi, jumlah, keterangan, kategori_infaq, tanggal
      FROM infaq 
      WHERE status = 'approved'
      AND DATE(tanggal) >= ? AND DATE(tanggal) <= ?
      ORDER BY tanggal DESC
    `, [startDate, endDate]);

    const lelangRows = []; // Kosong sementara

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

// endpoint summary
router.get('/summary', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;

    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    const { startDate: sDate, endDate: eDate } = dateFilter;

    // 1. HITUNG SALDO TOTAL (dari awal sampai sekarang)
    const [totalSaldoRows] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END), 0) as total_masuk,
        COALESCE(SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END), 0) as total_keluar
      FROM kas_buku_besar
      WHERE deleted_at IS NULL
    `);

    const totalMasuk = Number(totalSaldoRows[0].total_masuk);
    const totalKeluar = Number(totalSaldoRows[0].total_keluar);
    const totalSaldo = totalMasuk - totalKeluar;

    // 2. HITUNG TRANSAKSI PERIODE SAAT INI
    const [periodRows] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END), 0) as period_masuk,
        COALESCE(SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END), 0) as period_keluar
      FROM kas_buku_besar
      WHERE tanggal >= ? AND tanggal < ?
        AND deleted_at IS NULL
    `, [sDate, eDate]);

    const periodMasuk = Number(periodRows[0].period_masuk);
    const periodKeluar = Number(periodRows[0].period_keluar);
    const periodSaldo = periodMasuk - periodKeluar;

    // 3. HITUNG PERIODE SEBELUMNYA
    const getPreviousPeriod = (period) => {
      const today = new Date();
      let prevStartDate, prevEndDate;

      switch (period) {
        case 'hari-ini':
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          prevStartDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          prevEndDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
          break;
        case 'minggu-ini':
          const prevWeekStart = new Date(today);
          prevWeekStart.setDate(today.getDate() - today.getDay() - 7);
          prevStartDate = new Date(prevWeekStart.getFullYear(), prevWeekStart.getMonth(), prevWeekStart.getDate());
          prevEndDate = new Date(prevStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'bulan-ini':
          const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          prevStartDate = prevMonth;
          prevEndDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'tahun-ini':
          const prevYear = new Date(today.getFullYear() - 1, 0, 1);
          prevStartDate = prevYear;
          prevEndDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          const prevMonthDefault = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          prevStartDate = prevMonthDefault;
          prevEndDate = new Date(today.getFullYear(), today.getMonth(), 1);
      }

      return {
        startDate: prevStartDate.toISOString().split('T')[0],
        endDate: prevEndDate.toISOString().split('T')[0]
      };
    };

    // 4. HITUNG SALDO PERIODE SEBELUMNYA
    const prevPeriod = getPreviousPeriod(period);
    
    // Saldo sampai akhir periode sebelumnya
    const [prevTotalSaldoRows] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END), 0) as prev_total_masuk,
        COALESCE(SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END), 0) as prev_total_keluar
      FROM kas_buku_besar
      WHERE tanggal < ?
        AND deleted_at IS NULL
    `, [sDate]);

    const prevTotalMasuk = Number(prevTotalSaldoRows[0].prev_total_masuk);
    const prevTotalKeluar = Number(prevTotalSaldoRows[0].prev_total_keluar);
    const prevTotalSaldo = prevTotalMasuk - prevTotalKeluar;

    // Transaksi pada periode sebelumnya
    const [prevPeriodRows] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END), 0) as prev_period_masuk,
        COALESCE(SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END), 0) as prev_period_keluar
      FROM kas_buku_besar
      WHERE tanggal >= ? AND tanggal < ?
        AND deleted_at IS NULL
    `, [prevPeriod.startDate, prevPeriod.endDate]);

    const prevPeriodMasuk = Number(prevPeriodRows[0].prev_period_masuk);
    const prevPeriodKeluar = Number(prevPeriodRows[0].prev_period_keluar);

    // 5. HITUNG PERSENTASE PERUBAHAN
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0 && current === 0) return 0;
      if (previous === 0) return current > 0 ? 100 : -100;
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    const percentageChanges = {
      saldo: calculatePercentageChange(totalSaldo, prevTotalSaldo),
      pemasukan: calculatePercentageChange(periodMasuk, prevPeriodMasuk),
      pengeluaran: calculatePercentageChange(periodKeluar, prevPeriodKeluar)
    };

    // 6. BREAKDOWN KATEGORI UNTUK PERIODE SAAT INI
    const [pemasukanKategoriRows] = await db.query(`
      SELECT 
        kategori,
        COALESCE(SUM(jumlah), 0) as total
      FROM kas_buku_besar
      WHERE jenis = 'masuk'
        AND tanggal >= ? AND tanggal < ?
        AND deleted_at IS NULL
        AND kategori IS NOT NULL
      GROUP BY kategori
    `, [sDate, eDate]);

    const pemasukanKategori = {};
    pemasukanKategoriRows.forEach(row => {
      pemasukanKategori[row.kategori] = Number(row.total);
    });

    const [pengeluaranKategoriRows] = await db.query(`
      SELECT 
        kategori,
        COALESCE(SUM(jumlah), 0) as total
      FROM kas_buku_besar
      WHERE jenis = 'keluar'
        AND tanggal >= ? AND tanggal < ?
        AND deleted_at IS NULL
        AND kategori IS NOT NULL
      GROUP BY kategori
    `, [sDate, eDate]);

    const pengeluaranKategori = {};
    pengeluaranKategoriRows.forEach(row => {
      pengeluaranKategori[row.kategori] = Number(row.total);
    });

    res.json({
      success: true,
      data: {
        totalPemasukan: periodMasuk,
        totalPengeluaran: periodKeluar,
        saldoBersih: periodSaldo,
        totalSaldo: totalSaldo,
        pemasukanKategori,
        pengeluaranKategori,
        percentageChanges
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

// GET zakat berdasarkan periode
router.get('/zakat', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    // Ambil dari kas_buku_besar dengan filter source_table = 'zakat' dan status approved
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

// GET infaq berdasarkan periode
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

// GET lelang berdasarkan periode
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
  const { tanggal, keterangan, jenis, jumlah, kategori, kategori_pemasukan, nama_pemberi } = req.body; // Tambah nama_pemberi

  if (!tanggal || !keterangan || !jenis || !jumlah) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  if (!['masuk', 'keluar'].includes(jenis)) {
    return res.status(400).json({ message: 'Jenis harus masuk atau keluar' });
  }

  try {
    const jumlahInt = parseInt(jumlah, 10);
    // Insert ke kas_manual, trigger akan otomatis insert ke kas_buku_besar
    const [result] = await db.query(
      'INSERT INTO kas_manual (tanggal, keterangan, jenis, jumlah, kategori, kategori_pemasukan, nama_pemberi) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tanggal, keterangan, jenis, jumlahInt, kategori || 'operasional', kategori_pemasukan || null, nama_pemberi || null] // Tambah nama_pemberi
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
  try {
    const { id } = req.params;
    const { tanggal, keterangan, jenis, jumlah, kategori, kategori_pemasukan, nama_pemberi } = req.body; // Tambah nama_pemberi

    const[kbbResult] = await db.query(`
      SELECT source_id FROM kas_buku_besar
      WHERE id = ? AND source_table = 'manual'
      `, [id]);
    
    if (kbbResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    const jumlahInt = parseInt(jumlah, 10);
    const manualId = kbbResult[0].source_id;
    
    // Update ke kas_manual
    const [result] = await db.query(
      `UPDATE kas_manual SET 
      tanggal = ?, keterangan = ?, jenis = ?, 
      jumlah = ?, kategori = ?, kategori_pemasukan = ?, nama_pemberi = ?
      WHERE id = ?`,
      [tanggal, keterangan, jenis, jumlahInt, kategori, kategori_pemasukan, nama_pemberi || null, manualId] // Tambah nama_pemberi
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.json({ 
      success: true, 
      message: 'Transaksi berhasil diperbarui' 
    });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui transaksi' });
  }
});

// DELETE transaksi kas manual (SOFT DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // console.log('Soft deleting kas transaction with kas_buku_besar ID:', id);

    //Cek di kas_buku_besar untuk dapat source_id
    const [kbbResult] = await db.query(`
      SELECT * FROM kas_buku_besar 
      WHERE id = ? AND source_table = 'manual' AND deleted_at IS NULL
    `, [id]);
    
    if (kbbResult.length === 0) {
      // console.log('Transaction not found or already deleted:', id);
      return res.status(404).json({ 
        success: false,
        message: 'Transaksi kas tidak ditemukan' 
      });
    }

    const manualId = kbbResult[0].source_id;
    // console.log('Found manual transaction ID:', manualId);

    // Soft delete kas_manual
    const [result] = await db.query(
      'UPDATE kas_manual SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL', 
      [manualId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaksi kas manual tidak ditemukan atau sudah dihapus' 
      });
    }

    // Soft delete kas_buku_besar (jika trigger tidak jalan)
    await db.query(
      'UPDATE kas_buku_besar SET deleted_at = NOW() WHERE source_table = ? AND source_id = ? AND deleted_at IS NULL', 
      ['manual', manualId]
    );

    // console.log('Soft delete completed for manual ID:', manualId);

    res.json({ 
      success: true,
      message: 'Transaksi kas berhasil dihapus' 
    });

  } catch (err) {
    console.error('Gagal menghapus transaksi kas:', err);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan saat menghapus transaksi kas' 
    });
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

    // console.log('History filter:', { period, type, status, dateFilter });

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
      // For Excel
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