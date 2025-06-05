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
    
        console.log('Final summary:', {
      totalPemasukan,
      breakdown: {
        kasManual: pemasukanResult[0].kas_masuk,
        zakat: zakatResult[0].total_zakat,
        infaq: infaqResult[0].total_infaq,
        lelang: 0
      }
    });
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
    // Ambil zakat pending
    const [zakatPending] = await db.query(`
      SELECT 
        id, nama, jumlah as nominal, jenis_zakat, bukti_transfer, 
        metode_pembayaran, created_at, 'zakat' as type
      FROM zakat 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);

    // Ambil infaq pending (jika ada tabel infaq dengan sistem serupa)
    const [infaqPending] = await db.query(`
      SELECT 
        id, nama_pemberi as nama, jumlah as nominal, kategori_infaq as jenis_zakat, 
        bukti_transfer, metode_pembayaran, tanggal as created_at, 'infaq' as type
      FROM infaq 
      WHERE status = 'pending'
      ORDER BY tanggal DESC
    `).catch(() => [[]]);

    const allPending = [...zakatPending, ...infaqPending];
    
    res.json(allPending);
  } catch (err) {
    console.error('Gagal mengambil data pending:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data pending' });
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

module.exports = router;