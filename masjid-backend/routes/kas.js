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

// GET kas berdasarkan periode
router.get('/', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      // Custom date range
      dateFilter = { startDate, endDate };
    } else {
      // Use period filter
      dateFilter = getPeriodFilter(period);
    }

    const [rows] = await db.query(
      'SELECT * FROM kas WHERE tanggal >= ? AND tanggal < ? ORDER BY tanggal DESC',
      [dateFilter.startDate, dateFilter.endDate]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data kas:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kas' });
  }
});

// GET zakat berdasarkan periode atau custom date range
router.get('/zakat', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    const [rows] = await db.query(
      'SELECT * FROM zakat WHERE DATE(created_at) >= ? AND DATE(created_at) < ? ORDER BY created_at DESC',
      [dateFilter.startDate, dateFilter.endDate]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data zakat:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data zakat' });
  }
});

// GET infaq berdasarkan periode atau custom date range
router.get('/infaq', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    const [rows] = await db.query(
      'SELECT * FROM infaq WHERE DATE(tanggal) >= ? AND DATE(tanggal) < ? ORDER BY tanggal DESC',
      [dateFilter.startDate, dateFilter.endDate]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data infaq:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data infaq' });
  }
});

// GET lelang berdasarkan periode atau custom date range
router.get('/lelang', async (req, res) => {
  try {
    const { period = 'bulan-ini', startDate, endDate } = req.query;
    
    let dateFilter;
    if (startDate && endDate) {
      dateFilter = { startDate, endDate };
    } else {
      dateFilter = getPeriodFilter(period);
    }

    const [rows] = await db.query(
      'SELECT * FROM barang_lelang WHERE tanggal_lelang >= ? AND tanggal_lelang < ? ORDER BY tanggal_lelang DESC',
      [dateFilter.startDate, dateFilter.endDate]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data lelang:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data lelang' });
  }
});

// POST tambah transaksi kas
router.post('/', async (req, res) => {
  const { tanggal, keterangan, jenis, jumlah, kategori } = req.body;

  if (!tanggal || !keterangan || !jenis || !jumlah) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  if (!['masuk', 'keluar'].includes(jenis)) {
    return res.status(400).json({ message: 'Jenis harus masuk atau keluar' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO kas (tanggal, keterangan, jenis, jumlah, kategori) VALUES (?, ?, ?, ?, ?)',
      [tanggal, keterangan, jenis, jumlah, kategori || 'operasional']
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

// PUT update transaksi kas
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { tanggal, keterangan, jenis, jumlah, kategori } = req.body;

  if (!tanggal || !keterangan || !jenis || !jumlah) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'UPDATE kas SET tanggal = ?, keterangan = ?, jenis = ?, jumlah = ?, kategori = ? WHERE id = ?',
      [tanggal, keterangan, jenis, jumlah, kategori || 'operasional', id]
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

// DELETE transaksi kas
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM kas WHERE id = ?', [id]);

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