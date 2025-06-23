const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Ambil data infaq pending untuk validasi
router.get('/pending', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, nama_pemberi, jumlah, keterangan, kategori_infaq, 
             metode_pembayaran, bukti_transfer, tanggal, created_at
      FROM infaq 
      WHERE status = 'pending'
      ORDER BY tanggal DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching pending infaq:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT - Approve/Reject pembayaran infaq
router.put('/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action harus approve atau reject' 
      });
    }

    // Get infaq data first
    const [infaqRows] = await db.execute('SELECT * FROM infaq WHERE id = ?', [id]);
    
    if (infaqRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data infaq tidak ditemukan' 
      });
    }

    const infaqData = infaqRows[0];

    if (infaqData.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Data sudah divalidasi sebelumnya' 
      });
    }

    if (action === 'approve') {
      // Update status ke approved
      await db.execute(
        'UPDATE infaq SET status = ?, validated_at = NOW() WHERE id = ?', 
        ['approved', id]
      );
      
      // Insert ke kas_buku_besar untuk audit trail
      const kategori = `infaq_${infaqData.kategori_infaq || 'umum'}`;
      const keterangan = `Infaq dari ${infaqData.nama_pemberi}${infaqData.keterangan ? ' - ' + infaqData.keterangan : ''}`;
      
      await db.execute(`
        INSERT INTO kas_buku_besar 
        (tanggal, deskripsi, jenis, jumlah, kategori, source_table, source_id, created_at)
        VALUES (?, ?, 'masuk', ?, ?, 'infaq', ?, NOW())
      `, [infaqData.tanggal, keterangan, infaqData.jumlah, kategori, id]);

      res.json({
        success: true,
        message: 'Pembayaran infaq berhasil diapprove dan dicatat ke kas'
      });

    } else {
      // Reject dengan reason
      const rejectReason = reason || 'Tidak ada alasan yang diberikan';
      
      await db.execute(
        'UPDATE infaq SET status = ?, reject_reason = ?, validated_at = NOW() WHERE id = ?', 
        ['rejected', rejectReason, id]
      );
      
      res.json({
        success: true,
        message: 'Pembayaran infaq telah ditolak'
      });
    }

  } catch (error) {
    console.error('Error validating infaq:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

module.exports = router;