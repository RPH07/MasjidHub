const express = require('express');
const router = express.Router();
const db = require('../config/db');
const XLSX = require('xlsx')

// Helper function untuk filter berdasarkan periode
const getPeriodFilter = (period) => {
  // timezone Indonesia (UTC+7)
  const now = new Date();
  const indonesiaOffset = 7 * 60; // UTC+7 dalam menit
  const indonesiaTime = new Date(now.getTime() + (indonesiaOffset * 60 * 1000));
  
  let startDate, endDate;

  switch (period) {
    case 'hari-ini':
      startDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), indonesiaTime.getUTCMonth(), indonesiaTime.getUTCDate()));
      endDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), indonesiaTime.getUTCMonth(), indonesiaTime.getUTCDate() + 1));
      break;
      
    case 'minggu-ini':
      const dayOfWeek = indonesiaTime.getUTCDay();
      const startOfWeek = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), indonesiaTime.getUTCMonth(), indonesiaTime.getUTCDate() - dayOfWeek));
      startDate = startOfWeek;
      endDate = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() + 7));
      break;
      
    case 'bulan-ini':
      startDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), indonesiaTime.getUTCMonth(), 1));
      endDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), indonesiaTime.getUTCMonth() + 1, 1));
      break;
      
    case 'tahun-ini':
      startDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), 0, 1));
      endDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear() + 1, 0, 1));
      break;
      
    default:
      startDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), indonesiaTime.getUTCMonth(), 1));
      endDate = new Date(Date.UTC(indonesiaTime.getUTCFullYear(), indonesiaTime.getUTCMonth() + 1, 1));
  }

  const result = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
  return result;
};

router.get('/', async (req, res) => {
  try {
    const { period = 'bulan-ini' } = req.query;
    const { startDate, endDate } = getPeriodFilter(period);

    //  TAMBAH DONASI KE QUERY
    const [allRows] = await db.query(`
      SELECT 
        kb.*,
        kb.kode_unik,
        DATE_FORMAT(kb.tanggal, '%Y-%m-%d') AS tanggal,
        -- Zakat fields
        z.nama as zakat_nama,
        z.jenis_zakat,
        z.status as zakat_status,
        z.created_at as zakat_created_at,
        -- Infaq fields  
        i.nama_pemberi as infaq_nama_pemberi,
        i.keterangan as infaq_keterangan,
        i.kategori_infaq,
        i.status as infaq_status,
        i.tanggal as infaq_tanggal,
        -- Donasi Field
        d.nama_donatur as donasi_nama_donatur,
        d.nominal as donasi_nominal,
        d.kode_unik as donasi_kode_unik,
        d.total_transfer as donasi_total_transfer,
        d.metode_pembayaran as donasi_metode,
        d.bukti_transfer as donasi_bukti,
        d.status as donasi_status,
        p.nama_barang as donasi_program
      FROM kas_buku_besar kb
      LEFT JOIN zakat z ON kb.source_table = 'zakat' AND kb.source_id = z.id
      LEFT JOIN infaq i ON kb.source_table = 'infaq' AND kb.source_id = i.id
      LEFT JOIN donasi_pengadaan d ON kb.source_table = 'donasi_pengadaan' AND kb.source_id = d.id
      LEFT JOIN barang_pengadaan p ON d.barang_id = p.id
      WHERE kb.tanggal >= ? AND kb.tanggal < ?
        AND kb.deleted_at IS NULL
        AND (
          (kb.source_table = 'zakat' AND z.status = 'approved') OR
          (kb.source_table = 'infaq' AND i.status = 'approved') OR
          (kb.source_table = 'donasi_pengadaan' AND d.status = 'approved') OR
          (kb.source_table = 'manual')
        )
      ORDER BY kb.tanggal DESC, kb.created_at DESC
    `, [startDate, endDate]);

    // GROUP data by source
    const kasRows = allRows.filter(row => row.source_table === 'manual' || !row.source_table);
    
    const zakatRows = allRows
      .filter(row => row.source_table === 'zakat')
      .map(row => ({
        id: row.source_id,
        nama: row.zakat_nama,
        jenis_zakat: row.jenis_zakat,
        jumlah: row.jumlah,
        bukti_transfer: row.bukti_transfer,
        created_at: row.zakat_created_at,
        metode_pembayaran: row.metode_pembayaran
      }));

    const infaqRows = allRows
      .filter(row => row.source_table === 'infaq')
      .map(row => ({
        id: row.source_id,
        nama_pemberi: row.infaq_nama_pemberi,
        jumlah: row.jumlah,
        keterangan: row.infaq_keterangan,
        kategori_infaq: row.kategori_infaq,
        tanggal: row.infaq_tanggal
      }));

    
    const donasiRows = allRows
      .filter(row => row.source_table === 'donasi_pengadaan')
      .map(row => ({
        id: row.source_id,
        nama_donatur: row.donasi_nama_donatur,
        nama_pemberi: row.donasi_nama_donatur,
        jumlah: row.jumlah,
        nominal: row.donasi_nominal,
        kode_unik: row.donasi_kode_unik,
        total_transfer: row.donasi_total_transfer,
        metode_pembayaran: row.donasi_metode,
        bukti_transfer: row.donasi_bukti,
        program_donasi: row.donasi_program,
        tanggal: row.tanggal,
        created_at: row.created_at
      }));

    const lelangRows = allRows.filter(row => row.source_table === 'lelang');

    res.json({
      success: true,
      data: {
        kas: kasRows,
        zakat: zakatRows,
        infaq: infaqRows,
        donasi: donasiRows,
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
    const [kodeUnikSummary] = await db.query(`
      SELECT 
        COUNT(kode_unik) as total_transaksi_kode_unik,
        COALESCE(SUM(kode_unik), 0) as total_kode_unik_terkumpul
      FROM kas_buku_besar
      WHERE jenis = 'masuk'
        AND kode_unik IS NOT NULL
        AND tanggal >= ? AND tanggal < ?
        AND deleted_at IS NULL
    `, [sDate, eDate]);

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
      // Gunakan timezone Indonesia (UTC+7)
      const today = new Date();
      const jakartaOffset = 7 * 60;
      const localOffset = today.getTimezoneOffset();
      const jakartaTime = new Date(today.getTime() + (localOffset + jakartaOffset) * 60000);
      
      let prevStartDate, prevEndDate;

      switch (period) {
        case 'hari-ini':
          const yesterday = new Date(jakartaTime);
          yesterday.setDate(jakartaTime.getDate() - 1);
          prevStartDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          prevEndDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
          break;
        case 'minggu-ini':
          const prevWeekStart = new Date(jakartaTime);
          prevWeekStart.setDate(jakartaTime.getDate() - jakartaTime.getDay() - 7);
          prevStartDate = new Date(prevWeekStart.getFullYear(), prevWeekStart.getMonth(), prevWeekStart.getDate());
          prevEndDate = new Date(prevStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'bulan-ini':
          const prevMonth = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth() - 1, 1);
          prevStartDate = prevMonth;
          prevEndDate = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), 1);
          break;
        case 'tahun-ini':
          const prevYear = new Date(jakartaTime.getFullYear() - 1, 0, 1);
          prevStartDate = prevYear;
          prevEndDate = new Date(jakartaTime.getFullYear(), 0, 1);
          break;
        default:
          const prevMonthDefault = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth() - 1, 1);
          prevStartDate = prevMonthDefault;
          prevEndDate = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), 1);
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
      const curr = parseFloat(current) || 0;
      const prev = parseFloat(previous) || 0;

      // No change scenario
      if (curr === prev) return 0;
      
      // Handle zero previous value
      if (prev === 0) {
        if (curr === 0) return 0;
        return curr > 0 ? 100 : -100;
      }

      // Calculate percentage
      let percentage = ((curr - prev) / Math.abs(prev)) * 100;
      // Clamp percentage to -100% to 100%
      percentage = Math.max(-100, Math.min(100, percentage));
      
      return Math.round(percentage * 10) / 10;
    };

    const percentageChanges = {
      saldo: calculatePercentageChange(totalSaldo, prevTotalSaldo),
      pemasukan: calculatePercentageChange(periodMasuk, prevPeriodMasuk),
      pengeluaran: calculatePercentageChange(periodKeluar, prevPeriodKeluar)
    };

    // 6. BREAKDOWN KATEGORI UNTUK PERIODE SAAT INI
const [pemasukanKategoriRows] = await db.query(`
  SELECT 
    CASE 
      WHEN source_table = 'zakat' THEN 'zakat'
      WHEN source_table = 'infaq' THEN 'infaq' 
      WHEN source_table = 'donasi_pengadaan' THEN 'donasi'
      ELSE 'kas_manual'
    END as kategori_grouped,
    COALESCE(SUM(jumlah), 0) as total
  FROM kas_buku_besar
  WHERE jenis = 'masuk'
    AND tanggal >= ? AND tanggal < ?
    AND deleted_at IS NULL
    AND kategori IS NOT NULL
  GROUP BY kategori_grouped
`, [sDate, eDate]);

const pemasukanKategori = {
  zakat: 0,
  infaq: 0,
  donasi: 0,
  kas_manual: 0
};

pemasukanKategoriRows.forEach(row => {
  pemasukanKategori[row.kategori_grouped] = Number(row.total);
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
        percentageChanges,
        kodeUnikStats: {
          totalTransaksi: Number(kodeUnikSummary[0]?.total_transaksi_kode_unik || 0),
          totalKodeUnik: Number(kodeUnikSummary[0]?.total_kode_unik_terkumpul || 0)
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

    // Get pending donasi (TAMBAH INI)
    const [donasiRows] = await db.query(`
      SELECT 
        d.id,
        d.nama_donatur as nama_pemberi,
        d.nominal as jumlah,
        d.metode_pembayaran,
        d.bukti_transfer,
        d.catatan as keterangan,
        d.kode_unik,
        d.total_transfer,
        d.created_at,
        p.nama_barang,
        'donasi' as type
      FROM donasi_pengadaan d
      JOIN barang_pengadaan p ON d.barang_id = p.id
      WHERE d.status = 'pending'
      ORDER BY d.created_at DESC
    `);

    // Combine and sort by date
    const allPending = [...zakatRows, ...infaqRows, ...donasiRows].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    console.log('Pending transactions found:', {
      zakat: zakatRows.length,
      infaq: infaqRows.length,
      donasi: donasiRows.length,
      total: allPending.length
    });

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
      type = 'all',
      status = 'all'
    } = req.query;

    // Get date filter
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

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
        WHERE DATE(created_at) >= ? AND DATE(created_at) < ? 
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
        WHERE DATE(tanggal) >= ? AND DATE(tanggal) < ?
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

    // 3. Fetch Kas Manual data
    if (type === 'all' || type === 'kas') {
      const kasQuery = `
        SELECT 
          id,
          deskripsi as nama_pemberi,
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
        WHERE tanggal >= ? AND tanggal < ?
        AND (source_table IS NULL OR source_table NOT IN ('zakat', 'infaq'))
        AND deleted_at IS NULL
      `;
      
      const kasParams = [dateFilter.startDate, dateFilter.endDate];
      
      // Filter kas by status if needed (only show if status is 'all' or 'approved')
      if (status === 'approved' || status === 'all') {
        const [kasRows] = await db.query(kasQuery + ' ORDER BY tanggal DESC', kasParams);
        transactions.push(...kasRows);
      }
    }

    // 4. Fetch Donasi
    if (type === 'all' || type === 'donasi') {
        let donasiQuery = `
          SELECT
            d.id,
            d.nama_donatur as nama_pemberi,
            d.nominal as jumlah,
            d.kode_unik,
            d.total_transfer,
            d.bukti_transfer,
            d.metode_pembayaran,
            d.status,
            d.created_at,
            p.nama_barang as program_donasi,
            'donasi' as type,
            'Donasi Program' as type_label
          FROM donasi_pengadaan d
          JOIN barang_pengadaan p ON d.barang_id = p.id
          WHERE DATE(d.created_at) >= ? AND DATE(d.created_at) < ?
        `;

        

        const donasiParams = [dateFilter.startDate, dateFilter.endDate];

        if(status !== 'all'){
          donasiQuery += ' AND d.status = ?';
          donasiParams.push(status);
        }

        donasiQuery += ' ORDER BY d.created_at DESC';
        const [donasiRows] = await db.query(donasiQuery, donasiParams);
        transactions.push(...donasiRows);

      
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
      format = 'csv'
    } = req.query;

    // Get date filter
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    let transactions = [];

    //  1. ZAKAT - DARI APPROVED DI kas_buku_besar
    if (type === 'all' || type === 'zakat') {
      if (status === 'approved' || status === 'all') {
        const [zakatRows] = await db.query(`
          SELECT 
            kb.id,
            z.nama as nama_pemberi,
            kb.jumlah,
            z.jenis_zakat as kategori,
            z.bukti_transfer,
            z.metode_pembayaran,
            'approved' as status,
            kb.created_at,
            'zakat' as type,
            'Zakat' as type_label,
            NULL as kode_unik,
            NULL as keterangan
          FROM kas_buku_besar kb
          JOIN zakat z ON kb.source_table = 'zakat' AND kb.source_id = z.id
          WHERE kb.tanggal >= ? AND kb.tanggal < ?
            AND z.status = 'approved'
            AND kb.deleted_at IS NULL
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...zakatRows);
      }
    }

    //  2. INFAQ - DARI APPROVED DI kas_buku_besar
    if (type === 'all' || type === 'infaq') {
      if (status === 'approved' || status === 'all') {
        const [infaqRows] = await db.query(`
          SELECT 
            kb.id,
            i.nama_pemberi,
            kb.jumlah,
            i.kategori_infaq as kategori,
            i.bukti_transfer,
            i.metode_pembayaran,
            'approved' as status,
            kb.created_at,
            'infaq' as type,
            'Infaq' as type_label,
            NULL as kode_unik,
            i.keterangan
          FROM kas_buku_besar kb
          JOIN infaq i ON kb.source_table = 'infaq' AND kb.source_id = i.id
          WHERE kb.tanggal >= ? AND kb.tanggal < ?
            AND i.status = 'approved'
            AND kb.deleted_at IS NULL
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...infaqRows);
      }
    }

    //  3. DONASI - DARI APPROVED DI kas_buku_besar
    if (type === 'all' || type === 'donasi') {
      if (status === 'approved' || status === 'all') {
        const [donasiRows] = await db.query(`
          SELECT 
            kb.id,
            d.nama_donatur as nama_pemberi,
            kb.jumlah,
            p.nama_barang as kategori,
            d.bukti_transfer,
            d.metode_pembayaran,
            'approved' as status,
            kb.created_at,
            'donasi' as type,
            'Donasi Program' as type_label,
            kb.kode_unik,
            CONCAT('Program: ', p.nama_barang) as keterangan
          FROM kas_buku_besar kb
          JOIN donasi_pengadaan d ON kb.source_table = 'donasi_pengadaan' AND kb.source_id = d.id
          JOIN barang_pengadaan p ON d.barang_id = p.id
          WHERE kb.tanggal >= ? AND kb.tanggal < ?
            AND d.status = 'approved'
            AND kb.deleted_at IS NULL
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...donasiRows);
      }
    }

    //  4. KAS MANUAL
    if (type === 'all' || type === 'kas') {
      if (status === 'approved' || status === 'all') {
        const [kasRows] = await db.query(`
          SELECT 
            kb.id,
            COALESCE(kb.nama_pemberi, 'Hamba Allah') as nama_pemberi,
            kb.jumlah,
            CASE 
              WHEN kb.jenis = 'masuk' THEN COALESCE(kb.kategori, 'Kas Masuk')
              ELSE COALESCE(kb.kategori, 'Pengeluaran')
            END as kategori,
            NULL as bukti_transfer,
            'manual' as metode_pembayaran,
            'approved' as status,
            kb.created_at,
            'kas' as type,
            CASE 
              WHEN kb.jenis = 'masuk' THEN 'Kas Manual'
              ELSE 'Pengeluaran'
            END as type_label,
            NULL as kode_unik,
            kb.deskripsi as keterangan
          FROM kas_buku_besar kb
          WHERE kb.tanggal >= ? AND kb.tanggal < ?
            AND kb.source_table = 'manual'
            AND kb.deleted_at IS NULL
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...kasRows);
      }
    }

    //  5. PENDING TRANSACTIONS (jika status = pending atau all)
    if (status === 'pending' || status === 'all') {
      // Pending Zakat
      if (type === 'all' || type === 'zakat') {
        const [pendingZakat] = await db.query(`
          SELECT 
            id,
            nama as nama_pemberi,
            jumlah,
            jenis_zakat as kategori,
            bukti_transfer,
            metode_pembayaran,
            status,
            created_at,
            'zakat' as type,
            'Zakat' as type_label,
            NULL as kode_unik,
            NULL as keterangan
          FROM zakat 
          WHERE DATE(created_at) >= ? AND DATE(created_at) < ?
            AND status = 'pending'
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...pendingZakat);
      }

      // Pending Infaq
      if (type === 'all' || type === 'infaq') {
        const [pendingInfaq] = await db.query(`
          SELECT 
            id,
            nama_pemberi,
            jumlah,
            kategori_infaq as kategori,
            bukti_transfer,
            metode_pembayaran,
            status,
            tanggal as created_at,
            'infaq' as type,
            'Infaq' as type_label,
            NULL as kode_unik,
            keterangan
          FROM infaq 
          WHERE DATE(tanggal) >= ? AND DATE(tanggal) < ?
            AND status = 'pending'
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...pendingInfaq);
      }

      // Pending Donasi
      if (type === 'all' || type === 'donasi') {
        const [pendingDonasi] = await db.query(`
          SELECT 
            d.id,
            d.nama_donatur as nama_pemberi,
            d.nominal as jumlah,
            p.nama_barang as kategori,
            d.bukti_transfer,
            d.metode_pembayaran,
            d.status,
            d.created_at,
            'donasi' as type,
            'Donasi Program' as type_label,
            d.kode_unik,
            CONCAT('Program: ', p.nama_barang) as keterangan
          FROM donasi_pengadaan d
          JOIN barang_pengadaan p ON d.barang_id = p.id
          WHERE DATE(d.created_at) >= ? AND DATE(d.created_at) < ?
            AND d.status = 'pending'
        `, [dateFilter.startDate, dateFilter.endDate]);
        transactions.push(...pendingDonasi);
      }
    }

    // Sort by date
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (format === 'csv') {
      const csvHeader = 'Tanggal,Jenis,Nama/Donatur,Program/Kategori,Metode,Jumlah,Kode Unik,Status,Keterangan,Bukti Transfer\n';
      const csvData = transactions.map(t => {
        const tanggal = new Date(t.created_at).toLocaleDateString('id-ID');
        const jenis = t.type_label || t.type;
        const nama = t.nama_pemberi || 'Hamba Allah';
        const kategori = t.kategori || '-';
        const metode = t.metode_pembayaran === 'qris' ? 'QRIS' : 
                      t.metode_pembayaran === 'cash' || t.metode_pembayaran === 'tunai' ? 'Tunai' :
                      t.metode_pembayaran === 'transfer_bank' ? 'Transfer Bank' : 'Manual';
        const jumlah = Number(t.jumlah);
        const kodeUnik = t.kode_unik ? `+${t.kode_unik}` : '-';
        const status = t.status === 'approved' ? 'Approved' : 
                      t.status === 'pending' ? 'Pending' : 'Rejected';
        const keterangan = t.keterangan || '-';
        const bukti = t.bukti_transfer ? 'Ada' : 'Tidak Ada';
        
        return `"${tanggal}","${jenis}","${nama}","${kategori}","${metode}","${jumlah}","${kodeUnik}","${status}","${keterangan}","${bukti}"`;
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="riwayat-transaksi-${Date.now()}.csv"`);
      res.send(csvHeader + csvData);

    } else if (format === 'excel') {
  const excelData = transactions.map(t => ({
    'Tanggal': new Date(t.created_at).toLocaleDateString('id-ID'),
    'Jenis': t.type_label || t.type,
    'Nama/Donatur': t.nama_pemberi || 'Hamba Allah',
    'Program/Kategori': t.kategori || '-',
    'Metode': t.metode_pembayaran === 'qris' ? 'QRIS' : 
             t.metode_pembayaran === 'cash' || t.metode_pembayaran === 'tunai' ? 'Tunai' :
             t.metode_pembayaran === 'transfer_bank' ? 'Transfer Bank' : 'Manual',
    'Jumlah': Number(t.jumlah),
    'Kode Unik': t.kode_unik ? `+${t.kode_unik}` : '-',
    'Status': t.status === 'approved' ? 'Approved' : 
             t.status === 'pending' ? 'Pending' : 'Rejected',
    'Keterangan': t.keterangan || '-',
    'Bukti Transfer': t.bukti_transfer ? 'Ada' : 'Tidak Ada'
  }));

  const workbook = XLSX.utils.book_new();
  
  // BUAT WORKSHEET KOSONG DULU
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // TAMBAH HEADER YANG DI-MERGE
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const headerTitle = `Data Export Bulan: ${currentMonth}`;

  // Baris 1-4: Kosong untuk spacing
  XLSX.utils.sheet_add_aoa(worksheet, [
    [''], // Row 1
    [''], // Row 2  
    [''], // Row 3
    [''], // Row 4
    ['','','','','','','','',''], // Row 5 
    [''], // Row 6
    [''], // Row 7
    // Row 8 - Headers
    ['Tanggal', 'Jenis', 'Nama/Donatur', 'Program/Kategori', 'Metode', 'Jumlah', 'Kode Unik', 'Status', 'Keterangan', 'Bukti Transfer']
  ], { origin: 'A1' });

  //  TAMBAH DATA MULAI DARI ROW 9
  const dataRows = excelData.map(item => [
    item['Tanggal'],
    item['Jenis'], 
    item['Nama/Donatur'],
    item['Program/Kategori'],
    item['Metode'],
    item['Jumlah'],
    item['Kode Unik'],
    item['Status'],
    item['Keterangan'],
    item['Bukti Transfer']
  ]);

  XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: 'A9' });

  worksheet['C5'] = { v: headerTitle, t: 's'};

  //  MERGE HEADER TITLE (C5:H5)
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { r: 4, c: 2 }, // Start: Row 5 (index 4), Column C (index 2)
    e: { r: 4, c: 7 }  // End: Row 5 (index 4), Column H (index 7)
  });

  //  STYLING HEADER TITLE
  worksheet['C5'].s = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill: { fgColor: { rgb: 'E3F2FD' } }
  };

  //  STYLING TABLE HEADERS (ROW 8)
  const headerCells = ['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8', 'J8'];
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1976D2' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }
  });

  //  STYLING DATA ROWS
  for (let i = 0; i < dataRows.length; i++) {
    const rowNum = i + 9; // Data starts from row 9
    const rowCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(col => `${col}${rowNum}`);
    
    rowCells.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } }
          },
          alignment: { vertical: 'center' }
        };
        
        // Special styling for status column
        if (cell.startsWith('H')) { // Status column
          const statusValue = worksheet[cell].v;
          if (statusValue === 'Approved') {
            worksheet[cell].s.fill = { fgColor: { rgb: 'E8F5E8' } };
            worksheet[cell].s.font = { color: { rgb: '2E7D32' } };
          } else if (statusValue === 'Pending') {
            worksheet[cell].s.fill = { fgColor: { rgb: 'FFF3E0' } };
            worksheet[cell].s.font = { color: { rgb: 'F57C00' } };
          } else if (statusValue === 'Rejected') {
            worksheet[cell].s.fill = { fgColor: { rgb: 'FFEBEE' } };
            worksheet[cell].s.font = { color: { rgb: 'C62828' } };
          }
        }
        
        // Special styling for amount column (Right align)
        if (cell.startsWith('F')) { // Jumlah column
          worksheet[cell].s.alignment = { horizontal: 'right', vertical: 'center' };
          worksheet[cell].s.numFmt = '#,##0';
        }
        
        // Special styling for kode unik column (Center align)
        if (cell.startsWith('G')) { // Kode Unik column
          worksheet[cell].s.alignment = { horizontal: 'center', vertical: 'center' };
          if (worksheet[cell].v !== '-') {
            worksheet[cell].s.fill = { fgColor: { rgb: 'FFFDE7' } };
            worksheet[cell].s.font = { color: { rgb: 'F57F17' }, bold: true };
          }
        }
      }
    });
  }

  //  UPDATE COLUMN WIDTH - TAMBAH KODE UNIK
  const colWidth = [
    { wch: 12 }, // Tanggal (A)
    { wch: 15 }, // Jenis (B)
    { wch: 20 }, // Nama/Donatur (C)
    { wch: 20 }, // Program/Kategori (D)
    { wch: 12 }, // Metode (E)
    { wch: 15 }, // Jumlah (F)
    { wch: 10 }, // Kode Unik (G)
    { wch: 10 }, // Status (H)
    { wch: 30 }, // Keterangan (I)
    { wch: 12 }  // Bukti Transfer (J)
  ];
  worksheet['!cols'] = colWidth;

  //  SET ROW HEIGHTS
  worksheet['!rows'] = [
    { hpx: 20 }, // Row 1
    { hpx: 20 }, // Row 2
    { hpx: 20 }, // Row 3
    { hpx: 20 }, // Row 4
    { hpx: 30 }, // Row 5 - Header title (taller)
    { hpx: 20 }, // Row 6
    { hpx: 20 }, // Row 7
    { hpx: 25 }, // Row 8 - Table headers (taller)
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Transaksi');

  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="riwayat-transaksi-${Date.now()}.xlsx"`);
  res.send(buffer);

    } else {
      res.status(400).json({
        success: false,
        message: 'Format tidak didukung. Gunakan "csv" atau "excel".'
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