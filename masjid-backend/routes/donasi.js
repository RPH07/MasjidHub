const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const generateKodeUnikDonasi = () => {
    const kategoriKode = 3
    const randomDigit = Math.floor(Math.random() * 90) + 10;
    return parseInt(`${kategoriKode}${randomDigit}`); // Random 3 digit
};

// --- Konfigurasi Penyimpanan File ---

// 1. Untuk FOTO PROGRAM DONASI (Publik)
const storageProgram = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/donasi-program'); 
    },
    filename: (req, file, cb) => {
        cb(null, 'program-' + Date.now() + path.extname(file.originalname));
    }
});
const uploadProgram = multer({ storage: storageProgram });

// 2. Untuk BUKTI TRANSFER DONASI (Privat)
const storageBukti = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/bukti-donasi');
    },
    filename: (req, file, cb) => {
        cb(null, 'bukti-' + Date.now() + path.extname(file.originalname));
    }
});
const uploadBukti = multer({ storage: storageBukti });

// --- CRUD Program Donasi ---

// GET: Mendapatkan semua program donasi
router.get('/program', async (req, res) => {
    try {
        const { status } = req.query;
                let query = `
            SELECT p.*, 
                   COALESCE(p.dana_terkumpul, 0) as dana_terkumpul,
                   (p.target_dana - COALESCE(p.dana_terkumpul, 0)) as sisa_kekurangan,
                   COUNT(DISTINCT d.id) as total_donatur,
                   COUNT(DISTINCT k.id) as total_kas_entries,
                   p.created_at as tanggal_dibuat,
                   COALESCE(p.status, 'aktif') as status,
                   COALESCE(p.kategori_barang, 'lainnya') as kategori_barang
            FROM barang_pengadaan p
            LEFT JOIN donasi_pengadaan d ON p.id = d.barang_id AND d.status = 'approved'
            LEFT JOIN kas_buku_besar k ON k.source_table = 'donasi_pengadaan' AND k.source_id = d.id
        `;
        
        let whereConditions = [];
        let params = [];
        
        // Filter berdasarkan status jika ada
        if (status && status !== 'all') {
            whereConditions.push('COALESCE(p.status, "aktif") = ?');
            params.push(status);
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        query += ' GROUP BY p.id ORDER BY p.created_at DESC';
        
        const [results] = await db.query(query, params);
        
        // Pastikan setiap record memiliki property yang dibutuhkan
        const formattedResults = results.map(row => ({
            ...row,
            status: row.status || 'aktif',
            kategori_barang: row.kategori_barang || 'lainnya',
            dana_terkumpul: parseFloat(row.dana_terkumpul) || 0,
            target_dana: parseFloat(row.target_dana) || 0,
            total_donatur: parseInt(row.total_donatur) || 0
        }));
        
        res.json(formattedResults);
    } catch (err) {
        console.error('Error fetching program donasi:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// POST: Membuat program donasi baru (perbaikan)
router.post('/program', uploadProgram.single('foto_barang'), async (req, res) => {
    try {
        const { nama_barang, deskripsi, target_dana, kategori_barang, deadline } = req.body;
        const foto_barang = req.file ? req.file.filename : null;

        // Validasi
        if (!nama_barang || !deskripsi || !target_dana) {
            return res.status(400).json({ 
                error: 'Nama barang, deskripsi, dan target dana harus diisi',
                success: false 
            });
        }

        if (parseInt(target_dana) < 100000) {
            return res.status(400).json({ 
                error: 'Target dana minimal Rp 100.000',
                success: false 
            });
        }

        // Cek apakah kolom ada di database
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'barang_pengadaan'
        `);
        
        const columnNames = columns.map(col => col.COLUMN_NAME);
        const hasStatusColumn = columnNames.includes('status');
        const hasKategoriColumn = columnNames.includes('kategori_barang');
        const hasDeadlineColumn = columnNames.includes('deadline');

        // Build query dinamis berdasarkan kolom yang ada
        let insertColumns = ['nama_barang', 'deskripsi', 'target_dana'];
        let insertValues = ['?', '?', '?'];
        let params = [nama_barang, deskripsi, parseInt(target_dana)];

        if (hasStatusColumn) {
            insertColumns.push('status');
            insertValues.push('?');
            params.push('draft');
        }

        if (hasKategoriColumn) {
            insertColumns.push('kategori_barang');
            insertValues.push('?');
            params.push(kategori_barang || 'lainnya');
        }

        if (hasDeadlineColumn && deadline) {
            insertColumns.push('deadline');
            insertValues.push('?');
            params.push(deadline);
        }

        if (foto_barang) {
            insertColumns.push('foto_barang');
            insertValues.push('?');
            params.push(foto_barang);
        }

        // Pastikan dana_terkumpul 0
        if (columnNames.includes('dana_terkumpul')) {
            insertColumns.push('dana_terkumpul');
            insertValues.push('?');
            params.push(0);
        }

        const query = `
            INSERT INTO barang_pengadaan (${insertColumns.join(', ')}) 
            VALUES (${insertValues.join(', ')})
        `;
        
        const [result] = await db.query(query, params);
        
        res.status(201).json({ 
            message: 'Program donasi berhasil dibuat', 
            id: result.insertId,
            success: true
        });
    } catch (err) {
        console.error('Error creating program:', err);
        res.status(500).json({ 
            error: 'Gagal membuat program', 
            details: err.message,
            success: false 
        });
    }
});

// PUT: Update program donasi (oleh Admin)
router.put('/program/:id', uploadProgram.single('foto_barang'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_barang, deskripsi, target_dana, kategori_barang, deadline } = req.body;
        
        // Cek apakah program exists
        const [existing] = await db.query('SELECT * FROM barang_pengadaan WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Program tidak ditemukan' });
        }

        let foto_barang = existing[0].foto_barang;
        if (req.file) {
            foto_barang = req.file.filename;
        }

        const query = `
            UPDATE barang_pengadaan 
            SET nama_barang = ?, deskripsi = ?, target_dana = ?, kategori_barang = ?, 
                deadline = ?, foto_barang = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await db.query(query, [
            nama_barang, 
            deskripsi, 
            parseInt(target_dana), 
            kategori_barang,
            deadline,
            foto_barang,
            id
        ]);
        
        res.json({ message: 'Program donasi berhasil diperbarui', success: true });
    } catch (err) {
        console.error('Error updating program:', err);
        res.status(500).json({ error: 'Gagal memperbarui program', message: err.message });
    }
});

// PUT: Validasi donasi (Approve/Reject) - FIXED VERSION
// UPDATE: Standardisasi kategori donasi

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

        const [donasiRows] = await db.query('SELECT * FROM donasi_pengadaan WHERE id = ?', [id]);
        
        if (donasiRows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Data donasi tidak ditemukan' 
            });
        }

        const donasiData = donasiRows[0];

        if (donasiData.status !== 'pending') {
            return res.status(400).json({ 
                success: false,
                message: 'Donasi sudah divalidasi sebelumnya' 
            });
        }

        if (action === 'approve') {
            await db.query('START TRANSACTION');

            try {
                // HANYA UPDATE STATUS - BIARKAN TRIGGER YANG MENGHANDLE SISANYA
                await db.query(
                    'UPDATE donasi_pengadaan SET status = ?, validated_at = NOW() WHERE id = ?',
                    ['approved', id]
                );

                // HAPUS SEMUA MANUAL INSERT KE kas_buku_besar
                // HAPUS JUGA MANUAL UPDATE dana_terkumpul (kalau trigger sudah handle)
                
                await db.query('COMMIT');
                
                res.json({
                    success: true,
                    message: 'Donasi berhasil diapprove'
                });

            } catch (error) {
                await db.query('ROLLBACK');
                console.error('Error in approve transaction:', error);
                throw error;
            }

        } else {
            // Reject donasi
            const rejectReason = reason || 'Tidak ada alasan yang diberikan';
            
            await db.query(
                'UPDATE donasi_pengadaan SET status = ?, reject_reason = ?, validated_at = NOW() WHERE id = ?',
                ['rejected', rejectReason, id]
            );
            
            res.json({
                success: true,
                message: 'Donasi telah ditolak'
            });
        }

    } catch (error) {
        console.error('Error validating donasi:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
});

// --- Kelola Status Program ---

// POST: Aktifkan program
router.post('/program/:id/activate', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'UPDATE barang_pengadaan SET status = "aktif", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "draft"';
        const [result] = await db.query(query, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Program tidak dapat diaktifkan. Pastikan program dalam status draft.' });
        }
        
        res.json({ message: 'Program berhasil diaktifkan', success: true });
    } catch (err) {
        console.error('Error activating program:', err);
        res.status(500).json({ error: 'Gagal mengaktifkan program', message: err.message });
    }
});

// POST: Nonaktifkan program
router.post('/program/:id/deactivate', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'UPDATE barang_pengadaan SET status = "batal", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "aktif"';
        const [result] = await db.query(query, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Program tidak dapat dinonaktifkan. Pastikan program dalam status aktif.' });
        }
        
        res.json({ message: 'Program berhasil dinonaktifkan', success: true });
    } catch (err) {
        console.error('Error deactivating program:', err);
        res.status(500).json({ error: 'Gagal menonaktifkan program', message: err.message });
    }
});

// POST: Selesaikan program
router.post('/program/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'UPDATE barang_pengadaan SET status = "selesai", tanggal_selesai = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "aktif"';
        const [result] = await db.query(query, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Program tidak dapat diselesaikan. Pastikan program dalam status aktif.' });
        }
        
        res.json({ message: 'Program berhasil diselesaikan', success: true });
    } catch (err) {
        console.error('Error completing program:', err);
        res.status(500).json({ error: 'Gagal menyelesaikan program', message: err.message });
    }
});

// --- Donasi Management ---

// POST: Submit donasi (oleh Jamaah)
router.post('/submit/:programId', uploadBukti.single('bukti_transfer'), async (req, res) => {
    try {
        const { programId } = req.params;
        const { nama_donatur, kontak_donatur, nominal_donasi, metode_pembayaran, catatan, kode_unik_frontend } = req.body;
        const bukti_transfer = req.file ? req.file.filename : null;

        if (!nama_donatur || !nominal_donasi || !metode_pembayaran) {
            return res.status(400).json({ error: 'Nama donatur, nominal, dan metode pembayaran harus diisi' });
        }

        if (metode_pembayaran !== 'tunai' && !bukti_transfer) {
            return res.status(400).json({ error: 'Bukti transfer harus diupload untuk pembayaran non-tunai' });
        }

        if (parseInt(nominal_donasi) < 10000) {
            return res.status(400).json({ error: 'Nominal donasi minimal Rp 10.000' });
        }

        // Cek apakah program masih aktif
        const [program] = await db.query('SELECT * FROM barang_pengadaan WHERE id = ? AND status = "aktif"', [programId]);
        if (program.length === 0) {
            return res.status(400).json({ error: 'Program donasi tidak ditemukan atau tidak aktif' });
        }

        // Generate kode unik di backend (lebih aman)
        let kodeUnik;
        if (kode_unik_frontend && !isNaN(parseInt(kode_unik_frontend))) {
            kodeUnik = parseInt(kode_unik_frontend);
            console.log('Using kode unik from frontend:', kodeUnik);
        } else {
            kodeUnik = generateKodeUnikDonasi();
            console.log('Generated new kode unik:', kodeUnik);
        }
        const totalTransfer = parseInt(nominal_donasi) + kodeUnik;

        console.log('Generated kode unik:', kodeUnik); // Debug log

        const query = `
            INSERT INTO donasi_pengadaan 
            (barang_id, nama_donatur, kontak_donatur, nominal, metode_pembayaran, bukti_transfer, catatan, kode_unik, total_transfer, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const [result] = await db.query(query, [
            programId, 
            nama_donatur, 
            kontak_donatur || null,
            parseInt(nominal_donasi), 
            metode_pembayaran, 
            bukti_transfer,
            catatan || null,
            kodeUnik,
            totalTransfer
        ]);
        
        res.status(201).json({ 
            message: 'Terima kasih, donasi Anda berhasil dikirim dan akan segera divalidasi oleh admin.',
            success: true,
            data: {
                donasi_id: result.insertId,
                total_transfer: totalTransfer,
                kode_unik: kodeUnik,
                nominal_donasi: parseInt(nominal_donasi)
            }
        });
    } catch (err) {
        console.error('Error submitting donasi:', err);
        res.status(500).json({ error: 'Gagal mengirim donasi.', message: err.message });
    }
});

// GET: History donasi untuk program tertentu (update untuk menampilkan donasi yang sudah diverifikasi)
router.get('/program/:programId/donations', async (req, res) => {
    try {
        const { programId } = req.params;
        
        const query = `
            SELECT d.nama_donatur, d.nominal, d.metode_pembayaran, d.catatan,
                DATE_FORMAT(d.created_at, '%d %M %Y %H:%i') as tanggal_donasi
            FROM donasi_pengadaan d
            JOIN barang_pengadaan p ON d.barang_id = p.id
            WHERE d.barang_id = ? AND d.status = 'approved'
            ORDER BY d.created_at DESC
        `;
        
        const [results] = await db.query(query, [programId]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching donation history:', err);
        res.status(500).json({ error: 'Gagal mengambil history donasi' });
    }
});

// Tambahkan di bagian bawah file sebelum module.exports

// POST: Force refresh dana terkumpul untuk semua program
router.post('/admin/refresh-dana', async (req, res) => {
    try {
        // Recalculate dana_terkumpul berdasarkan donasi yang benar-benar approved dan ada di kas
        const [result] = await db.query(`
            UPDATE barang_pengadaan p
            SET p.dana_terkumpul = (
                SELECT COALESCE(SUM(d.nominal), 0)
                FROM donasi_pengadaan d
                INNER JOIN kas_buku_besar k ON k.source_table = 'donasi_pengadaan' AND k.source_id = d.id
                WHERE d.barang_id = p.id 
                AND d.status = 'approved'
                AND k.deleted_at IS NULL
            ),
            p.updated_at = CURRENT_TIMESTAMP
        `);
        
        // Get programs that were updated
        const [updatedPrograms] = await db.query(`
            SELECT id, nama_barang, dana_terkumpul, target_dana
            FROM barang_pengadaan
            ORDER BY updated_at DESC
        `);
        
        res.json({
            success: true,
            message: 'Dana terkumpul berhasil di-refresh untuk semua program',
            affectedRows: result.affectedRows,
            programs: updatedPrograms
        });
        
    } catch (err) {
        console.error('Error refreshing dana:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal refresh dana terkumpul',
            error: err.message
        });
    }
});

// GET: Cek konsistensi data (untuk debugging)
router.get('/admin/check-consistency', async (req, res) => {
    try {
        const [inconsistentData] = await db.query(`
            SELECT 
                p.id, 
                p.nama_barang, 
                p.dana_terkumpul as current_dana,
                p.target_dana,
                COALESCE(SUM(d.nominal), 0) as calculated_dana,
                COUNT(d.id) as total_approved_donations,
                COUNT(k.id) as total_kas_entries
            FROM barang_pengadaan p
            LEFT JOIN donasi_pengadaan d ON p.id = d.barang_id AND d.status = 'approved'
            LEFT JOIN kas_buku_besar k ON k.source_table = 'donasi_pengadaan' AND k.source_id = d.id AND k.deleted_at IS NULL
            GROUP BY p.id
            HAVING p.dana_terkumpul != calculated_dana OR total_approved_donations != total_kas_entries
            ORDER BY p.updated_at DESC
        `);
        
        res.json({
            success: true,
            message: 'Data konsistensi berhasil diperiksa',
            inconsistentPrograms: inconsistentData,
            needsRefresh: inconsistentData.length > 0
        });
        
    } catch (err) {
        console.error('Error checking consistency:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memeriksa konsistensi data',
            error: err.message
        });
    }
});

module.exports = router;