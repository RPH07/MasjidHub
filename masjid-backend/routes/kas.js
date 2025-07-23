const express = require('express');
const router = express.Router();
const db = require('../config/db');
const XLSX = require('xlsx')

// Helper function untuk filter berdasarkan periode
const getPeriodFilter = (period) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  
  let startDate, endDate;

  switch (period) {
    case 'hari-ini':
      startDate = new Date(year, month, date);
      endDate = new Date(year, month, date + 1);
      break;
      
    case 'kemarin':
      startDate = new Date(year, month, date - 1);
      endDate = new Date(year, month, date);
      break;
      
    case 'minggu-ini':
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Senin = 0
      startDate = new Date(year, month, date - daysFromMonday);
      endDate = new Date(year, month, date - daysFromMonday + 7);
      break;
      
    case 'minggu-lalu':
      const lastWeekDay = today.getDay();
      const daysFromLastMonday = lastWeekDay === 0 ? 6 : lastWeekDay - 1;
      startDate = new Date(year, month, date - daysFromLastMonday - 7);
      endDate = new Date(year, month, date - daysFromLastMonday);
      break;
    
    case 'bulan-ini':
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
      break;
      
    case 'bulan-lalu':
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
      break;
      
    case 'tahun-ini':
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
      break;
      
    case 'tahun-lalu':
      startDate = new Date(year - 1, 0, 1);
      endDate = new Date(year, 0, 1);
      break;
      
    default:
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
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

    //  TAMBAH DONASI KE QUERY
    const [allRows] = await db.query(`
      SELECT 
        kb.*,
        kb.kode_unik,
        DATE_FORMAT(kb.tanggal, '%Y-%m-%d') AS tanggal,
        -- Zakat fields
        z.nama as zakat_nama,
        z.jenis_zakat,
        z.kode_unik as zakat_kode_unik,
        z.total_bayar as zakat_total_bayar,
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
        metode_pembayaran: row.metode_pembayaran,
        kode_unik: row.zakat_kode_unik || row.kode_unik,
        total_bayar: row.zakat_total_bayar
      }));

    const infaqRows = allRows
      .filter(row => row.source_table === 'infaq')
      .map(row => ({
        id: row.source_id,
        nama_pemberi: row.infaq_nama_pemberi,
        jumlah: row.jumlah,
        keterangan: row.infaq_keterangan,
        kategori_infaq: row.kategori_infaq,
        tanggal: row.infaq_tanggal,
        kode_unik: row.kode_unik
      }));

    
    const donasiRows = allRows
      .filter(row => row.source_table === 'donasi_pengadaan')
      .map(row => ({
        id: row.source_id,
        nama_donatur: row.donasi_nama_donatur,
        nama_pemberi: row.donasi_nama_donatur,
        jumlah: row.jumlah,
        kode_unik: row.kode_unik,
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

// summary endpoint
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
    // Debug log
    // console.log('Summary filter dates:', { sDate, eDate }); 

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

    // console.log('Total saldo calculation:', { totalMasuk, totalKeluar, totalSaldo }); // Debug log

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

    // console.log('Period calculation:', { periodMasuk, periodKeluar }); // Debug log

    // 3. KODE UNIK STATS
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

    // 4. BREAKDOWN KATEGORI PEMASUKAN
    const [pemasukanKategoriRows] = await db.query(`
      SELECT 
        CASE 
          WHEN source_table = 'zakat' THEN 'zakat'
          WHEN source_table = 'infaq' THEN 'infaq' 
          WHEN source_table = 'donasi_pengadaan' THEN 'donasi'
          WHEN source_table = 'manual' OR source_table IS NULL THEN 'kas_manual'
          ELSE 'kas_manual'
        END as kategori_grouped,
        COALESCE(SUM(jumlah), 0) as total
      FROM kas_buku_besar
      WHERE jenis = 'masuk'
        AND tanggal >= ? AND tanggal < ?
        AND deleted_at IS NULL
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

    // console.log('Pemasukan kategori:', pemasukanKategori); // Debug log

    // 5. BREAKDOWN KATEGORI PENGELUARAN
    const [pengeluaranKategoriRows] = await db.query(`
      SELECT 
        COALESCE(kategori, 'operasional') as kategori,
        COALESCE(SUM(jumlah), 0) as total
      FROM kas_buku_besar
      WHERE jenis = 'keluar'
        AND tanggal >= ? AND tanggal < ?
        AND deleted_at IS NULL
      GROUP BY kategori
    `, [sDate, eDate]);

    const pengeluaranKategori = {};
    pengeluaranKategoriRows.forEach(row => {
      pengeluaranKategori[row.kategori] = Number(row.total);
    });

    // console.log('Pengeluaran kategori:', pengeluaranKategori); // Debug log

    // 6. HITUNG PERIODE SEBELUMNYA UNTUK PERSENTASE
    const getPreviousPeriod = (period) => {
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

    // 7. HITUNG PERSENTASE PERUBAHAN
    const calculatePercentageChange = (current, previous) => {
      const curr = parseFloat(current) || 0;
      const prev = parseFloat(previous) || 0;

      if (curr === prev) return 0;
      
      if (prev === 0) {
        if (curr === 0) return 0;
        return curr > 0 ? 100 : -100;
      }

      let percentage = ((curr - prev) / Math.abs(prev)) * 100;
      percentage = Math.max(-100, Math.min(100, percentage));
      
      return Math.round(percentage * 10) / 10;
    };

    const percentageChanges = {
      saldo: calculatePercentageChange(totalSaldo, prevTotalSaldo),
      pemasukan: calculatePercentageChange(periodMasuk, prevPeriodMasuk),
      pengeluaran: calculatePercentageChange(periodKeluar, prevPeriodKeluar)
    };

    const responseData = {
      totalPemasukan: periodMasuk,
      totalPengeluaran: periodKeluar,
      saldoBersih: periodMasuk - periodKeluar,
      totalSaldo: totalSaldo,
      pemasukanKategori,
      pengeluaranKategori,
      percentageChanges,
      kodeUnikStats: {
        totalTransaksi: Number(kodeUnikSummary[0]?.total_transaksi_kode_unik || 0),
        totalKodeUnik: Number(kodeUnikSummary[0]?.total_kode_unik_terkumpul || 0)
      }
    };
    // Debug log
    // console.log('Final response data:', responseData); 

    res.json({
      success: true,
      data: responseData
    });

  } catch (err) {
    console.error('Error fetching kas summary:', err);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil ringkasan kas',
      error: err.message
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
    const [zakatRows] = await db.execute(`
      SELECT 
        id, nama as nama_pemberi, email, no_telepon, jenis_zakat, 
        jumlah_jiwa, total_harta, gaji_kotor, jumlah, 
        kode_unik, total_bayar, metode_pembayaran, 
        bukti_transfer, created_at,
        'zakat' as type
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

    // console.log('Pending transactions found:', {
    //   zakat: zakatRows.length,
    //   infaq: infaqRows.length,
    //   donasi: donasiRows.length,
    //   total: allPending.length
    // });

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
    console.log('📊 Export request received:', req.query);
    
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

    console.log('🗓️ Date filter:', dateFilter);

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

    // Sort by date
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`📋 Total transactions found: ${transactions.length}`);

    if (format === 'csv') {
      const generateFileName = (period, format) => {
        const today = new Date();
        const year = today.getFullYear();
        const mont = today.toLocaleDateString('id-ID', {mont: 'long'});

        let fileName = 'Riwayat-transaksi-'

        switch (period) {
          case 'hari-ini':
            const todayStr = today.toLocaleDateString('id-ID').replace(/\//g, '-');
            fileName += `hari-ini-${todayStr}`;
            break;
          case 'kemarin':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yeesterday.toLocaleDateString('id-ID').replace(/\//g, '-');
            fileName += `kemarin-${yesterdayStr}`;
            break;
          case 'minggu-ini':
            fileName += `minggu-ini-${month}-${year}`;
            break;
          case 'bulan-ini':
            fileName += `${month.toLowerCase()}-${year}`;
            break;
          case 'bulan-lalu':
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthName = lastMonth.toLocaleDateString('id-ID', {month: 'long'});
            const lastMontYear = lastMonth.getFullYear();
            fileName += `${lastMontName.toLowerCase()}-${lastMontYear}`;
            break;
          case 'tahun-ini':
            fileName += `tahun-${year}`;
            break;
          case 'tahun-lalu':
            fileName += `tahun-${year - 1}`;
            break;
          default:
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const startStr = start.toLocaleDateString('id-ID').replace(/\//g, '-');
              const endStr = end.toLocaleDateString('id-ID').replace(/\//g, '-');
              fileName += `periode-${startStr}-sampai-${endStr}`;
            } else {
              fileName += `${month.toLowerCase()}-${year}`;
            }
        }
        
        return fileName + `.${format}`;
      };

      const fileName = generateFileName(period, 'csv');

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
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="riwayat-transaksi-${Date.now()}.csv"`);
      res.send('\uFEFF' + csvHeader + csvData);
    } else if (format === 'excel') {
      console.log('📊 Creating Excel file...');
      const generateFileName = (period, format) => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.toLocaleDateString('id-ID', { month: 'long' });
        
        let fileName = 'riwayat-transaksi-';
        
        switch (period) {
          case 'hari-ini':
            const todayStr = today.toLocaleDateString('id-ID').replace(/\//g, '-');
            fileName += `hari-ini-${todayStr}`;
            break;
          case 'kemarin':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('id-ID').replace(/\//g, '-');
            fileName += `kemarin-${yesterdayStr}`;
            break;
          case 'minggu-ini':
            fileName += `minggu-ini-${month.toLowerCase()}-${year}`;
            break;
          case 'minggu-lalu':
            fileName += `minggu-lalu-${month.toLowerCase()}-${year}`;
            break;
          case 'bulan-ini':
            fileName += `${month.toLowerCase()}-${year}`;
            break;
          case 'bulan-lalu':
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthName = lastMonth.toLocaleDateString('id-ID', { month: 'long' });
            const lastMonthYear = lastMonth.getFullYear();
            fileName += `${lastMonthName.toLowerCase()}-${lastMonthYear}`;
            break;
          case 'tahun-ini':
            fileName += `tahun-${year}`;
            break;
          case 'tahun-lalu':
            fileName += `tahun-${year - 1}`;
            break;
          default:
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const startStr = start.toLocaleDateString('id-ID').replace(/\//g, '-');
              const endStr = end.toLocaleDateString('id-ID').replace(/\//g, '-');
              fileName += `periode-${startStr}-sampai-${endStr}`;
            } else {
              fileName += `${month.toLowerCase()}-${year}`;
            }
        }
        
        return fileName + `.${format === 'excel' ? 'xlsx' : format}`;
      };

      const fileName = generateFileName(period, 'excel');
      
      // Memastikan Data ada
      if (transactions.length === 0) {
        transactions = [{
          created_at: new Date(),
          type_label: 'Tidak ada data',
          nama_pemberi: '-',
          kategori: '-',
          metode_pembayaran: '-',
          jumlah: 0,
          kode_unik: null,
          status: '-',
          keterangan: 'Tidak ada transaksi pada periode ini',
          bukti_transfer: null
        }];
      }

      // Generate period label untuk header
      const getPeriodLabel = (period) => {
        const today = new Date();
        const options = { 
          year: 'numeric', 
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Jakarta'
        };
        
        switch (period) {
          case 'hari-ini':
            return `Hari Ini - ${today.toLocaleDateString('id-ID', options)}`;
          case 'kemarin':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return `Kemarin - ${yesterday.toLocaleDateString('id-ID', options)}`;
          case 'minggu-ini':
            return `Minggu Ini - ${today.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}`;
          case 'minggu-lalu':
            return `Minggu Lalu - ${today.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}`;
          case 'bulan-ini':
            return `Bulan ${today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
          case 'bulan-lalu':
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            return `Bulan ${lastMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
          case 'tahun-ini':
            return `Tahun ${today.getFullYear()}`;
          case 'tahun-lalu':
            return `Tahun ${today.getFullYear() - 1}`;
          default:
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              return `Periode ${start.toLocaleDateString('id-ID', options)} - ${end.toLocaleDateString('id-ID', options)}`;
            }
            return `Bulan ${today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
        }
      };

      const periodLabel = getPeriodLabel(period);
      const exportDate = new Date().toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      });

      // Hitung total untuk summary
      const totalApproved = transactions.filter(t => t.status === 'approved').length;
      const totalRejected = transactions.filter(t => t.status === 'rejected').length;
      const totalPending = transactions.filter(t => t.status === 'pending').length;
      const totalAmount = transactions.reduce((sum, t) => sum + Number(t.jumlah || 0), 0);

      // Create header data dengan informasi periode
      const headerData = [
        ['LAPORAN RIWAYAT TRANSAKSI MASJID'],
        ['Data Export: ' + periodLabel],
        ['Tanggal Export: ' + exportDate],
        [''],
        ['RINGKASAN:'],
        ['Total Transaksi: ' + transactions.length],
        ['Transaksi Approved: ' + totalApproved],
        ['Transaksi Rejected: ' + totalRejected],
        ['Transaksi Pending: ' + totalPending],
        ['Total Amount: Rp ' + new Intl.NumberFormat('id-ID').format(totalAmount)],
        [''],
        ['DETAIL TRANSAKSI:'],
        [''] // Empty row sebelum table headers
      ];

      // Convert transaction data
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

      console.log('📋 Excel data prepared, rows:', excelData.length);

      try {
        const workbook = XLSX.utils.book_new();
        
        // Create worksheet dengan header info
        const worksheet = XLSX.utils.aoa_to_sheet(headerData);
        
        // Append transaction data ke worksheet
        XLSX.utils.sheet_add_json(worksheet, excelData, {
          origin: 'A' + (headerData.length + 1), // Start after header
          skipHeader: false
        });

        // Set column widths
        const colWidth = [
          { wch: 12 }, // Tanggal
          { wch: 15 }, // Jenis
          { wch: 20 }, // Nama/Donatur
          { wch: 20 }, // Program/Kategori
          { wch: 12 }, // Metode
          { wch: 15 }, // Jumlah
          { wch: 10 }, // Kode Unik
          { wch: 10 }, // Status
          { wch: 30 }, // Keterangan
          { wch: 12 }  // Bukti Transfer
        ];
        worksheet['!cols'] = colWidth;

        // Set cell styles untuk header (bold dan centered)
        const headerRowStart = 1;
        const headerRowEnd = headerData.length;
        
        // Make title row bold and centered
        if (worksheet['A1']) {
          worksheet['A1'].s = {
            font: { bold: true, size: 14 },
            alignment: { horizontal: 'center' }
          };
        }
        
        // Make period info bold
        if (worksheet['A2']) {
          worksheet['A2'].s = {
            font: { bold: true },
            alignment: { horizontal: 'left' }
          };
        }

        // Merge cells for title
        if (!worksheet['!merges']) worksheet['!merges'] = [];
        worksheet['!merges'].push({
          s: { r: 0, c: 0 }, // Start: A1
          e: { r: 0, c: 9 }  // End: J1 (across all columns)
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Transaksi');

        console.log('📊 Workbook created, writing buffer...');
        
        const buffer = XLSX.write(workbook, {
          type: 'buffer',
          bookType: 'xlsx'
        });

        console.log('📦 Buffer created, size:', buffer.length);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="riwayat-transaksi-${Date.now()}.xlsx"`);
        res.setHeader('Content-Length', buffer.length);
        
        res.send(buffer);
        console.log('✅ Excel file sent successfully');

      } catch (xlsxError) {
        console.error('❌ XLSX Error:', xlsxError);
        res.status(500).json({
          success: false,
          message: 'Error creating Excel file: ' + xlsxError.message
        });
      }

    } else {
      res.status(400).json({
        success: false,
        message: 'Format tidak didukung. Gunakan "csv" atau "excel".'
      });
    }

  } catch (error) {
    console.error('❌ Error exporting transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat export data: ' + error.message
    });
  }
});

module.exports = router;