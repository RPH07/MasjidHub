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
router.get('/', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    // Ambil dari kas_buku_besar
    const [rows] = await db.query(
      'SELECT * FROM kas_buku_besar WHERE tanggal >= ? AND tanggal < ? ORDER BY tanggal DESC, id DESC',
      [dateFilter.startDate, dateFilter.endDate]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data kas buku besar:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kas' });
  }
});

// ===== GET summary kas untuk dashboard =====
router.get('/summary', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    // Summary total
    const [summaryRows] = await db.query(`
      SELECT 
        SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE 0 END) as total_pemasukan,
        SUM(CASE WHEN jenis = 'keluar' THEN jumlah ELSE 0 END) as total_pengeluaran,
        SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE -jumlah END) as saldo_periode
      FROM kas_buku_besar 
      WHERE tanggal >= ? AND tanggal < ?
    `, [dateFilter.startDate, dateFilter.endDate]);

    // Summary per kategori pemasukan
    const [pemasukanRows] = await db.query(`
      SELECT 
        kategori,
        SUM(jumlah) as total,
        COUNT(*) as jumlah_transaksi
      FROM kas_buku_besar 
      WHERE jenis = 'masuk' AND tanggal >= ? AND tanggal < ?
      GROUP BY kategori
    `, [dateFilter.startDate, dateFilter.endDate]);

    // Summary per kategori pengeluaran
    const [pengeluaranRows] = await db.query(`
      SELECT 
        kategori,
        SUM(jumlah) as total,
        COUNT(*) as jumlah_transaksi
      FROM kas_buku_besar 
      WHERE jenis = 'keluar' AND tanggal >= ? AND tanggal < ?
      GROUP BY kategori
    `, [dateFilter.startDate, dateFilter.endDate]);

    // Hitung saldo keseluruhan (dari awal)
    const [saldoRows] = await db.query(`
      SELECT 
        SUM(CASE WHEN jenis = 'masuk' THEN jumlah ELSE -jumlah END) as saldo_total
      FROM kas_buku_besar 
      WHERE tanggal <= ?
    `, [dateFilter.endDate]);

    // Format response
    const summary = summaryRows[0];
    const pemasukanKategori = {};
    const pengeluaranKategori = {};

    // Parse pemasukan per kategori
    pemasukanRows.forEach(row => {
      pemasukanKategori[row.kategori] = row.total;
    });

    // Parse pengeluaran per kategori
    pengeluaranRows.forEach(row => {
      pengeluaranKategori[row.kategori] = row.total;
    });

    res.json({
      totalSaldo: saldoRows[0].saldo_total || 0,
      totalPemasukan: summary.total_pemasukan || 0,
      totalPengeluaran: summary.total_pengeluaran || 0,
      saldoPeriode: summary.saldo_periode || 0,
      pemasukanKategori,
      pengeluaranKategori
    });

  } catch (err) {
    console.error('Gagal mengambil summary kas:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil summary kas' });
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
    }

    // Ambil dari kas_buku_besar dengan filter source_table = 'zakat'
    const [rows] = await db.query(`
      SELECT 
        kb.*,
        z.nama, z.jenis_zakat, z.bukti_transfer, z.metode_pembayaran, z.created_at
      FROM kas_buku_besar kb
      LEFT JOIN zakat z ON kb.source_id = z.id AND kb.source_table = 'zakat'
      WHERE kb.source_table = 'zakat' 
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

module.exports = router;