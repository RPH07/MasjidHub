const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GET semua kegiatan
// Update GET endpoint

router.get('/', async (req, res) => {
  try {
    const { search, kategori, status } = req.query;
    
    let query = `
      SELECT k.*, kk.nama_kategori as kategori_nama 
      FROM kegiatan k
      LEFT JOIN kategori_kegiatan kk ON k.kategori = kk.id
      WHERE 1=1
    `;
    let params = [];

    // ✅ ADD: Search functionality
    if (search) {
      query += ` AND (k.nama_kegiatan LIKE ? OR k.deskripsi LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // ✅ ADD: Filter by kategori
    if (kategori && kategori !== 'all') {
      query += ` AND k.kategori = ?`;
      params.push(kategori);
    }

    // ✅ ADD: Filter by status (if needed)
    if (status && status !== 'all') {
      // Assuming you have status logic for kegiatan
      const currentDate = new Date().toISOString().split('T')[0];
      switch (status) {
        case 'upcoming':
          query += ` AND k.tanggal > ?`;
          params.push(currentDate);
          break;
        case 'ongoing':
          query += ` AND k.tanggal = ?`;
          params.push(currentDate);
          break;
        case 'completed':
          query += ` AND k.tanggal < ?`;
          params.push(currentDate);
          break;
      }
    }

    query += ` ORDER BY k.tanggal DESC`;

    console.log('🔍 Executing kegiatan query:', query); // ✅ DEBUG
    console.log('🔍 Query params:', params); // ✅ DEBUG

    const [rows] = await db.query(query, params);

    console.log(`📊 Found ${rows.length} kegiatan entries`); // ✅ DEBUG

    // ✅ FIX: Return consistent structure
    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error('Error fetching kegiatan:', err);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan saat mengambil data kegiatan',
      error: err.message 
    });
  }
});

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST tambah kegiatan (dengan upload file + kategori)
router.post('/', upload.single('foto'), async (req, res) => {
  const { nama_kegiatan, tanggal, lokasi, deskripsi, kategori } = req.body;
  const foto = req.file ? req.file.filename : null;

  if (!nama_kegiatan || !tanggal || !lokasi || !deskripsi) {
    return res.status(400).json({ message: 'Field wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO kegiatan (nama_kegiatan, tanggal, lokasi, deskripsi, kategori, foto) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_kegiatan, tanggal, lokasi, deskripsi, kategori || 'pengajian', foto]
    );
    res.status(201).json({ 
      message: 'Kegiatan berhasil ditambahkan', 
      id: result.insertId,
      data: {
        id: result.insertId,
        nama_kegiatan,
        tanggal,
        lokasi,
        deskripsi,
        kategori: kategori || 'pengajian',
        foto
      }
    });
  } catch (err) {
    console.error('Gagal menambahkan kegiatan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan kegiatan' });
  }
});

// PUT update kegiatan (dengan kategori)
router.put('/:id', upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nama_kegiatan, tanggal, lokasi, deskripsi, kategori } = req.body;
  const newFoto = req.file ? req.file.filename : null;

  if (!nama_kegiatan || !tanggal || !lokasi || !deskripsi) {
    return res.status(400).json({ message: 'Field wajib diisi' });
  }

  try {
    // Cek apakah kegiatan ada
    const [existing] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    let query = 'UPDATE kegiatan SET nama_kegiatan = ?, tanggal = ?, lokasi = ?, deskripsi = ?, kategori = ?';
    let params = [nama_kegiatan, tanggal, lokasi, deskripsi, kategori || 'pengajian'];

    // Jika ada foto baru, update foto dan hapus foto lama
    if (newFoto) {
      const oldFoto = existing[0].foto;
      
      // Hapus foto lama jika ada
      if (oldFoto) {
        const oldPhotoPath = path.join('uploads', oldFoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          console.log('Foto lama berhasil dihapus:', oldFoto);
        }
      }
      
      query += ', foto = ?';
      params.push(newFoto);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    res.json({ 
      message: 'Kegiatan berhasil diperbarui',
      updated: {
        id: parseInt(id),
        nama_kegiatan,
        tanggal,
        lokasi,
        deskripsi,
        kategori: kategori || 'pengajian',
        foto: newFoto || existing[0].foto
      }
    });
  } catch (err) {
    console.error('Gagal memperbarui kegiatan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui kegiatan' });
  }
});

// DELETE kegiatan berdasarkan ID
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [existing] = await db.query('SELECT foto FROM kegiatan WHERE id = ?', [id]);
    
    const [result] = await db.query('DELETE FROM kegiatan WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    // Hapus foto jika ada
    if (existing.length > 0 && existing[0].foto) {
      const photoPath = path.join('uploads', existing[0].foto);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
        console.log('Foto berhasil dihapus:', existing[0].foto);
      }
    }

    res.json({ message: 'Kegiatan berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus kegiatan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus kegiatan' });
  }
});

module.exports = router;