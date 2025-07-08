const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET semua kategori kegiatan
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kategori_kegiatan WHERE is_active = 1 ORDER BY nama_kategori ASC');
    res.json(rows);
  } catch (err) {
    console.error('Gagal mengambil data kategori:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kategori' });
  }
});

// POST tambah kategori baru
router.post('/', async (req, res) => {
  const { nama_kategori, icon, warna, deskripsi } = req.body;

  if (!nama_kategori) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO kategori_kegiatan (nama_kategori, icon, warna, deskripsi) VALUES (?, ?, ?, ?)',
      [nama_kategori.toLowerCase(), icon || '📋', warna || 'blue', deskripsi || '']
    );
    
    res.status(201).json({ 
      message: 'Kategori berhasil ditambahkan', 
      id: result.insertId,
      data: {
        id: result.insertId,
        nama_kategori: nama_kategori.toLowerCase(),
        icon: icon || '📋',
        warna: warna || 'blue',
        deskripsi: deskripsi || ''
      }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kategori sudah ada' });
    }
    console.error('Gagal menambahkan kategori:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan kategori' });
  }
});

// PUT update kategori
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nama_kategori, icon, warna, deskripsi, is_active } = req.body;

  if (!nama_kategori) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'UPDATE kategori_kegiatan SET nama_kategori = ?, icon = ?, warna = ?, deskripsi = ?, is_active = ? WHERE id = ?',
      [nama_kategori.toLowerCase(), icon, warna, deskripsi, is_active !== undefined ? is_active : 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    res.json({ message: 'Kategori berhasil diperbarui' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kategori sudah ada' });
    }
    console.error('Gagal memperbarui kategori:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui kategori' });
  }
});

// DELETE kategori (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Cek apakah kategori digunakan di kegiatan
    const [usage] = await db.query(
      'SELECT COUNT(*) as count FROM kegiatan k JOIN kategori_kegiatan kk ON k.kategori = kk.nama_kategori WHERE kk.id = ?',
      [id]
    );

    if (usage[0].count > 0) {
      return res.status(400).json({ 
        message: `Kategori tidak dapat dihapus karena sedang digunakan oleh ${usage[0].count} kegiatan` 
      });
    }

    // Soft delete
    const [result] = await db.query('UPDATE kategori_kegiatan SET is_active = 0 WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus kategori:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus kategori' });
  }
});

module.exports = router;