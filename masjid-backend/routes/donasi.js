const express = require('express');
const {jsPDF} = require('jspdf');
const autoTable = require('jspdf-autotable');
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
            SELECT p.id, p.nama_barang, p.deskripsi, p.target_dana, 
                COALESCE(p.dana_terkumpul, 0) as dana_terkumpul,
                COALESCE(p.dana_awal_kas, 0) as dana_awal_kas,
                COALESCE(p.dana_donasi, 0) as dana_donasi,
                (p.target_dana - COALESCE(p.dana_terkumpul, 0)) as sisa_kebutuhan,
                p.foto_barang, p.deadline, p.created_at, p.tanggal_selesai,
                COUNT(DISTINCT d.id) as total_donatur,
                COALESCE(p.status, 'aktif') as status,
                COALESCE(p.status, 'aktif') as status_pengadaan,  -- ✅ TAMBAH ALIAS
                COALESCE(p.kategori_barang, 'lainnya') as kategori_barang
            FROM barang_pengadaan p
            LEFT JOIN donasi_pengadaan d ON p.id = d.barang_id AND d.status = 'approved'
        `;
        
        let whereConditions = [];
        let params = [];
        
        // ✅ FIX: Handle multiple status filter untuk user
        if (status && status !== 'all') {
            // Handle multiple status (aktif,selesai)
            if (status.includes(',')) {
                const statusList = status.split(',').map(s => s.trim());
                const placeholders = statusList.map(() => '?').join(',');
                whereConditions.push(`COALESCE(p.status, "aktif") IN (${placeholders})`);
                params.push(...statusList);
            } else {
                whereConditions.push('COALESCE(p.status, "aktif") = ?');
                params.push(status);
            }
        }
        
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        query += ' GROUP BY p.id ORDER BY p.created_at DESC';
        
        console.log('🔍 Query:', query);
        console.log('📊 Params:', params);
        
        const [results] = await db.query(query, params);
        
        console.log(`📋 Found ${results.length} programs`);
        
        // Pastikan setiap record memiliki property yang dibutuhkan
        const formattedResults = results.map(row => ({
            ...row,
            status: row.status || 'aktif',
            status_pengadaan: row.status || 'aktif',  // ✅ ENSURE CONSISTENT FIELD
            kategori_barang: row.kategori_barang || 'lainnya',
            dana_terkumpul: parseFloat(row.dana_terkumpul) || 0,
            dana_awal_kas: parseFloat(row.dana_awal_kas) || 0,
            dana_donasi: parseFloat(row.dana_donasi) || 0,
            target_dana: parseFloat(row.target_dana) || 0,
            sisa_kebutuhan: parseFloat(row.sisa_kebutuhan) || 0,
            total_donatur: parseInt(row.total_donatur) || 0,
            tanggal_dibuat: row.created_at
        }));
        
        res.json(formattedResults);
    } catch (err) {
        console.error('Error fetching program donasi:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// POST: Membuat program donasi baru
router.post('/program', uploadProgram.single('foto_barang'), async (req, res) => {
    try {
        const { nama_barang, deskripsi, target_dana, kategori_barang, deadline } = req.body;
        const foto_barang = req.file ? req.file.filename : null;

        // Validasi penambahan donasi
        if (!nama_barang || !deskripsi || !target_dana) {
            return res.status(400).json({ 
                error: 'Nama barang, deskripsi, dan target dana harus diisi',
                success: false 
            });
        }

        // validasi target dana
        const targetDanaNum = parseInt(target_dana);
        if (targetDanaNum <= 0) {
            return res.status(400).json({ 
                error: 'Target dana harus lebih dari 0',
                success: false 
            });
        }

        // HITUNG TOTAL KAS SAAT INI
        const [kasResult] = await db.query(`
            SELECT COALESCE(SUM(CASE 
                WHEN jenis = 'masuk' THEN jumlah 
                WHEN jenis = 'keluar' THEN -jumlah 
                ELSE 0 
            END), 0) as total_kas
            FROM kas_buku_besar 
            WHERE deleted_at IS NULL
        `);

        const totalKas = kasResult[0].total_kas || 0;
        
        // Hitung dana awal dari kas
        const danaAwalKas = Math.min(totalKas, targetDanaNum);
        const danaDonasi = 0;
        const danaTerkumpul = danaAwalKas + danaDonasi;

        // Check apakah kolom ada di database
        const [kasColumns] = await db.query("SHOW COLUMNS FROM barang_pengadaan LIKE 'dana_awal_kas'");
        const hasKasColumns = kasColumns.length > 0;

        let insertColumns = ['nama_barang', 'deskripsi', 'target_dana', 'dana_terkumpul'];
        let insertValues = ['?', '?', '?', '?'];
        let params = [nama_barang, deskripsi, targetDanaNum, danaTerkumpul];

        // Tambahkan kolom kas jika ada
        if (hasKasColumns) {
            insertColumns.push('dana_awal_kas', 'dana_donasi');
            insertValues.push('?', '?');
            params.push(danaAwalKas, danaDonasi);
        }

        // Tambahkan kolom opsional lainnya
        const [kategoriColumns] = await db.query("SHOW COLUMNS FROM barang_pengadaan LIKE 'kategori_barang'");
        if (kategoriColumns.length > 0) {
            insertColumns.push('kategori_barang');
            insertValues.push('?');
            params.push(kategori_barang || 'lainnya');
        }

        const [deadlineColumns] = await db.query("SHOW COLUMNS FROM barang_pengadaan LIKE 'deadline'");
        if (deadlineColumns.length > 0 && deadline) {
            insertColumns.push('deadline');
            insertValues.push('?');
            params.push(deadline);
        }

        if (foto_barang) {
            insertColumns.push('foto_barang');
            insertValues.push('?');
            params.push(foto_barang);
        }

        const query = `
            INSERT INTO barang_pengadaan (${insertColumns.join(', ')}) 
            VALUES (${insertValues.join(', ')})
        `;
        
        const [result] = await db.query(query, params);
        
        res.status(201).json({ 
            message: `Program donasi berhasil dibuat. Dana awal dari kas: Rp ${danaAwalKas.toLocaleString('id-ID')}`, 
            id: result.insertId,
            success: true,
            data: {
                dana_awal_kas: danaAwalKas,
                dana_donasi: danaDonasi,
                dana_terkumpul: danaTerkumpul,
                sisa_kebutuhan: targetDanaNum - danaTerkumpul,
                total_kas_tersedia: totalKas
            }
        });
    } catch (err) {
        console.error('Error creating program donasi:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
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

// DELETE: Menghapus program donasi (oleh Admin)
router.delete('/program/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ FIX: Cek di barang_pengadaan, bukan donasi_pengadaan
        const [programRows] = await db.query(
            'SELECT * FROM barang_pengadaan WHERE id = ?',
            [id]
        );

        if (programRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Program donasi tidak ditemukan'
            });
        }

        const program = programRows[0];

        // ✅ FIX: Cek apakah program sudah ada donasi yang masuk (dari donasi_pengadaan)
        const [donasiRows] = await db.query(
            'SELECT COUNT(*) as total_donasi FROM donasi_pengadaan WHERE barang_id = ? AND status IN ("approved", "pending")',
            [id]
        );

        const totalDonasi = donasiRows[0].total_donasi;

        if (totalDonasi > 0) {
            return res.status(400).json({
                success: false,
                message: 'Program tidak dapat dihapus karena sudah ada donasi yang masuk. Silakan nonaktifkan program sebagai gantinya.'
            });
        }

        // ✅ FIX: Hapus program dari barang_pengadaan (hard delete karena belum ada donasi)
        await db.query(
            'DELETE FROM barang_pengadaan WHERE id = ?',
            [id]
        );

        // ✅ Optional: Hapus foto jika ada
        if (program.foto_barang) {
            const fs = require('fs');
            const path = require('path');
            const fotoPath = path.join(__dirname, '../public/images/donasi-program', program.foto_barang);
            
            fs.unlink(fotoPath, (err) => {
                if (err) console.log('Warning: Could not delete photo file:', err.message);
            });
        }

        res.json({
            success: true,
            message: 'Program donasi berhasil dihapus'
        });

    } catch (error) {
        console.error('Error deleting program donasi:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus program donasi',
            error: error.message
        });
    }
});

// PUT: Validasi donasi (Approve/Reject)
router.put('/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;

        console.log(`🔍 Validating donasi ${id} with action: ${action}`);

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
            console.log('✅ Approving donasi - trigger will handle the rest');
            
            // SEDERHANA: HANYA UPDATE STATUS - TRIGGER AKAN HANDLE SISANYA
            await db.query(
                'UPDATE donasi_pengadaan SET status = ?, validated_at = NOW() WHERE id = ?',
                ['approved', id]
            );
            
            console.log('✅ Donasi approved successfully');
            
            res.json({
                success: true,
                message: 'Donasi berhasil diapprove'
            });

        } else if (action === 'reject') {
            console.log('❌ Rejecting donasi');
            
            // Reject donasi
            const rejectReason = reason || 'Tidak ada alasan yang diberikan';
            
            await db.query(
                'UPDATE donasi_pengadaan SET status = ?, reject_reason = ?, validated_at = NOW() WHERE id = ?',
                ['rejected', rejectReason, id]
            );
            
            console.log('❌ Donasi rejected successfully');
            
            res.json({
                success: true,
                message: 'Donasi telah ditolak'
            });
        }

    } catch (error) {
        console.error('❌ Error validating donasi:', error);
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
        const { nama_donatur, kontak_donatur, nominal_donasi, metode_pembayaran, catatan, kode_unik_frontend, user_id } = req.body; // ✅ TAMBAH user_id
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
            (barang_id, user_id, nama_donatur, kontak_donatur, nominal, metode_pembayaran, bukti_transfer, catatan, kode_unik, total_transfer, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const [result] = await db.query(query, [
            programId, 
            user_id || null, // ✅ SEKARANG user_id sudah didefinisikan dari req.body
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

// GET: History donasi untuk user yang login
router.get('/history/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 10, offset = 0 } = req.query;
        
        console.log('🔍 Fetching donation history for user:', userId);
        
        let whereConditions = ['d.user_id = ?'];
        let params = [userId];
        
        // Filter berdasarkan status jika ada
        if (status && status !== 'all') {
            whereConditions.push('d.status = ?');
            params.push(status);
        }
        
        // Query utama untuk history donasi
        const query = `
            SELECT 
                d.id,
                d.nominal,
                d.metode_pembayaran,
                d.status,
                d.kode_unik,
                d.total_transfer,
                d.catatan,
                d.created_at,
                d.validated_at,
                d.reject_reason,
                p.nama_barang,
                p.foto_barang,
                p.target_dana,
                p.dana_terkumpul,
                DATE_FORMAT(d.created_at, '%d %M %Y %H:%i') as tanggal_donasi_formatted,
                DATE_FORMAT(d.validated_at, '%d %M %Y %H:%i') as tanggal_validasi_formatted
            FROM donasi_pengadaan d
            INNER JOIN barang_pengadaan p ON d.barang_id = p.id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY d.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        params.push(parseInt(limit), parseInt(offset));
        
        const [donations] = await db.query(query, params);
        
        // Query untuk total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM donasi_pengadaan d
            INNER JOIN barang_pengadaan p ON d.barang_id = p.id
            WHERE ${whereConditions.join(' AND ')}
        `;
        
        const [countResult] = await db.query(countQuery, [userId, ...(status && status !== 'all' ? [status] : [])]);
        
        // Query untuk statistik user
        const statsQuery = `
            SELECT 
                COUNT(*) as total_donasi,
                COALESCE(SUM(CASE WHEN d.status = 'approved' THEN d.nominal ELSE 0 END), 0) as total_nominal_approved,
                COALESCE(SUM(CASE WHEN d.status = 'pending' THEN d.nominal ELSE 0 END), 0) as total_nominal_pending,
                COUNT(CASE WHEN d.status = 'approved' THEN 1 END) as donasi_approved,
                COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as donasi_pending,
                COUNT(CASE WHEN d.status = 'rejected' THEN 1 END) as donasi_rejected
            FROM donasi_pengadaan d
            WHERE d.user_id = ?
        `;
        
        const [statsResult] = await db.query(statsQuery, [userId]);
        
        console.log(`📊 Found ${donations.length} donations for user ${userId}`);
        
        res.json({
            success: true,
            data: {
                donations: donations.map(donation => ({
                    ...donation,
                    nominal: parseFloat(donation.nominal) || 0,
                    total_transfer: parseFloat(donation.total_transfer) || 0,
                    target_dana: parseFloat(donation.target_dana) || 0,
                    dana_terkumpul: parseFloat(donation.dana_terkumpul) || 0
                })),
                pagination: {
                    total: countResult[0].total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + donations.length) < countResult[0].total
                },
                statistics: {
                    total_donasi: statsResult[0].total_donasi || 0,
                    total_nominal_approved: parseFloat(statsResult[0].total_nominal_approved) || 0,
                    total_nominal_pending: parseFloat(statsResult[0].total_nominal_pending) || 0,
                    donasi_approved: statsResult[0].donasi_approved || 0,
                    donasi_pending: statsResult[0].donasi_pending || 0,
                    donasi_rejected: statsResult[0].donasi_rejected || 0
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching user donation history:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil history donasi',
            error: error.message
        });
    }
});

// GET: Detail donasi spesifik untuk user
router.get('/history/user/:userId/donation/:donationId', async (req, res) => {
    try {
        const { userId, donationId } = req.params;
        
        const query = `
            SELECT 
                d.*,
                p.nama_barang,
                p.deskripsi,
                p.foto_barang,
                p.target_dana,
                p.dana_terkumpul,
                DATE_FORMAT(d.created_at, '%d %M %Y %H:%i:%s') as tanggal_donasi_formatted,
                DATE_FORMAT(d.validated_at, '%d %M %Y %H:%i:%s') as tanggal_validasi_formatted
            FROM donasi_pengadaan d
            INNER JOIN barang_pengadaan p ON d.barang_id = p.id
            WHERE d.id = ? AND d.user_id = ?
        `;
        
        const [result] = await db.query(query, [donationId, userId]);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Donasi tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: {
                ...result[0],
                nominal: parseFloat(result[0].nominal) || 0,
                total_transfer: parseFloat(result[0].total_transfer) || 0,
                target_dana: parseFloat(result[0].target_dana) || 0,
                dana_terkumpul: parseFloat(result[0].dana_terkumpul) || 0
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching donation detail:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail donasi',
            error: error.message
        });
    }
});


// ======= API untuk export ke pdf
router.get('/program/:programId/export/pdf', async (req, res) => {
    console.log('🚀 PDF export started for program:', req.params.programId);
    
    try {
        const { programId } = req.params;
        
        // Get program details
        console.log('📊 Fetching program details...');
        const [programDetails] = await db.query(`
            SELECT p.*, 
                   COALESCE(p.dana_terkumpul, 0) as dana_terkumpul,
                   COUNT(DISTINCT d.id) as total_donatur,
                   DATE_FORMAT(p.created_at, '%d %M %Y') as tanggal_dimulai,
                   DATE_FORMAT(p.tanggal_selesai, '%d %M %Y') as tanggal_selesai_formatted
            FROM barang_pengadaan p
            LEFT JOIN donasi_pengadaan d ON p.id = d.barang_id AND d.status = 'approved'
            WHERE p.id = ?
            GROUP BY p.id
        `, [programId]);

        console.log('📋 Program details found:', programDetails.length);

        if (programDetails.length === 0) {
            console.log('❌ Program not found');
            return res.status(404).json({ error: 'Program tidak ditemukan' });
        }

        // Get donation history
        console.log('💰 Fetching donations...');
        const [donations] = await db.query(`
            SELECT d.nama_donatur, d.nominal, d.metode_pembayaran, d.catatan,
                   d.kode_unik, d.total_transfer,
                   DATE_FORMAT(d.created_at, '%d %M %Y') as tanggal_donasi
            FROM donasi_pengadaan d
            WHERE d.barang_id = ? AND d.status = 'approved'
            ORDER BY d.created_at DESC
        `, [programId]);

        console.log('💵 Donations found:', donations.length);

        const program = programDetails[0];
        console.log('🏗️ Creating PDF for program:', program.nama_barang);

        // CREATE PDF (TANPA CHECK autoTable dulu)
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let currentY = 20;

        // HEADER - NAMA PROGRAM
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('LAPORAN DONASI PROGRAM', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 100, 0);
        const programName = program.nama_barang || 'Program Tidak Diketahui';
        doc.text(programName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
        currentY += 20;

        // SECTION 1: DETAIL PROGRAM
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 60, 3, 3, 'FD');
        currentY += 10;

        // Program details dalam 2 kolom
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        const leftCol = margin + 10;
        const rightCol = pageWidth / 2 + 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Deskripsi:', leftCol, currentY);
        doc.setFont('helvetica', 'normal');
        // Handle long text dengan splitTextToSize
        const deskripsi = program.deskripsi || 'Tidak ada deskripsi';
        const deskripsiLines = doc.splitTextToSize(deskripsi, 70);
        doc.text(deskripsiLines[0] || deskripsi, leftCol, currentY + 6);

        doc.setFont('helvetica', 'bold');
        doc.text('Tanggal Dimulai:', leftCol, currentY + 18);
        doc.setFont('helvetica', 'normal');
        doc.text(program.tanggal_dimulai || 'Tidak diketahui', leftCol, currentY + 24);

        doc.setFont('helvetica', 'bold');
        doc.text('Kategori:', leftCol, currentY + 36);
        doc.setFont('helvetica', 'normal');
        doc.text(program.kategori_barang || 'Lainnya', leftCol, currentY + 42);

        // Kolom kanan
        doc.setFont('helvetica', 'bold');
        doc.text('Target Dana:', rightCol, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(220, 53, 69);
        doc.text(`Rp ${Number(program.target_dana || 0).toLocaleString('id-ID')}`, rightCol, currentY + 6);

        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.text('Tanggal Selesai:', rightCol, currentY + 18);
        doc.setFont('helvetica', 'normal');
        doc.text(program.tanggal_selesai_formatted || 'Belum selesai', rightCol, currentY + 24);

        doc.setFont('helvetica', 'bold');
        doc.text('Dana Terkumpul:', rightCol, currentY + 36);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(25, 135, 84);
        doc.text(`Rp ${Number(program.dana_terkumpul || 0).toLocaleString('id-ID')}`, rightCol, currentY + 42);

        currentY += 70;

        // SUMMARY BOX
        doc.setTextColor(60, 60, 60);
        doc.setDrawColor(25, 135, 84);
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'FD');
        
        currentY += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RINGKASAN:', margin + 10, currentY);
        
        currentY += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const targetDana = Number(program.target_dana || 0);
        const danaTerkumpul = Number(program.dana_terkumpul || 0);
        const percentage = targetDana > 0 ? ((danaTerkumpul / targetDana) * 100).toFixed(1) : 0;
        
        const summaryText = `Total ${program.total_donatur || 0} donatur telah mengumpulkan ${percentage}% dari target (${danaTerkumpul.toLocaleString('id-ID')} dari ${targetDana.toLocaleString('id-ID')})`;
        const summaryLines = doc.splitTextToSize(summaryText, pageWidth - (margin * 2) - 20);
        doc.text(summaryLines, margin + 10, currentY);

        currentY += 25;

        // GARIS PEMISAH
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(1);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 15;

        // SECTION 2: DAFTAR DONATUR
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(`DAFTAR DONATUR (${donations.length} Orang)`, margin, currentY);
        currentY += 10;

        if (donations.length === 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(120, 120, 120);
            doc.text('Belum ada donatur untuk program ini.', margin, currentY);
            currentY += 20;
        } else {
            // MANUAL TABLE (simple dan works)
            console.log('📋 Creating donations table manually...');
            
            // Table headers
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(25, 135, 84);
            doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
            
            doc.text('No', margin + 2, currentY + 5);
            doc.text('Nama Donatur', margin + 15, currentY + 5);
            doc.text('Nominal', margin + 70, currentY + 5);
            doc.text('Kode Unik', margin + 105, currentY + 5);
            doc.text('Metode', margin + 130, currentY + 5);
            doc.text('Tanggal', margin + 155, currentY + 5);
            
            currentY += 8;
            
            // Table rows
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            
            donations.forEach((donation, index) => {
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(margin, currentY, pageWidth - (margin * 2), 6, 'F');
                }
                
                doc.text(String(index + 1), margin + 2, currentY + 4);
                
                // Truncate nama if too long
                const nama = (donation.nama_donatur || 'Anonim').substring(0, 20);
                doc.text(nama, margin + 15, currentY + 4);
                
                doc.text(`Rp ${Number(donation.nominal || 0).toLocaleString('id-ID')}`, margin + 70, currentY + 4);
                doc.text(donation.kode_unik ? `+${donation.kode_unik}` : '-', margin + 105, currentY + 4);
                
                // Truncate metode
                const metode = (donation.metode_pembayaran || 'UNKNOWN').substring(0, 8).toUpperCase();
                doc.text(metode, margin + 130, currentY + 4);
                
                doc.text(donation.tanggal_donasi || '-', margin + 155, currentY + 4);
                
                currentY += 6;
                
                // Check if new page needed
                if (currentY > 250) {
                    doc.addPage();
                    currentY = 20;
                }
            });
        }

        // FOOTER
        const finalY = currentY + 20;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 120, 120);
        doc.text(`Laporan digenerate pada: ${new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`, margin, finalY);

        doc.text('© MasjidHub - Sistem Manajemen Masjid', pageWidth - margin, finalY, { align: 'right' });

        console.log('📄 PDF created successfully');

        // Send PDF
        const pdfBuffer = doc.output('arraybuffer');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="laporan-donasi-${programName.replace(/\s+/g, '-')}-${Date.now()}.pdf"`);
        res.send(Buffer.from(pdfBuffer));

        console.log('✅ PDF sent to client');

    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Gagal generate PDF', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;