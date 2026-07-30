const { Op, fn, col } = require('sequelize');
const sequelize = require('../config/db');
const Zakat = require('../models/ZakatModels');
const ZakatDistribusi = require('../models/ZakatDistribusiModels');
const BarangPengadaan = require('../models/BarangPengadaanModels');
const PengadaanRealisasi = require('../models/PengadaanRealisasiModels');
const KasBukuBesar = require('../models/KasBukuBesarModels');
const User = require('../models/UserModels');

const activeLedgerWhere = {
    deleted_at: null,
    void_status: {
        [Op.ne]: 'approved'
    }
};

const toPositiveAmount = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        const error = new Error('Nominal harus berupa angka lebih dari 0');
        error.statusCode = 400;
        throw error;
    }
    return amount;
};

const assertRequired = (payload, fields) => {
    const missing = fields.find((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
    if (missing) {
        const error = new Error(`${missing} wajib diisi`);
        error.statusCode = 400;
        throw error;
    }
};

const getZakatCollectedByJenis = async () => {
    const rows = await KasBukuBesar.findAll({
        attributes: [
            'kategori',
            [fn('SUM', col('jumlah')), 'total']
        ],
        where: {
            ...activeLedgerWhere,
            jenis: 'masuk',
            source_table: 'zakat'
        },
        group: ['kategori'],
        raw: true
    });

    return rows.reduce((acc, row) => {
        const jenis = String(row.kategori || '').replace('zakat_', '') || 'lainnya';
        acc[jenis] = Number(row.total || 0);
        return acc;
    }, { fitrah: 0, maal: 0, profesi: 0 });
};

const getApprovedDistributionByJenis = async () => {
    const rows = await ZakatDistribusi.findAll({
        attributes: [
            'jenis_zakat',
            [fn('SUM', col('nominal')), 'total']
        ],
        where: { status: 'approved' },
        group: ['jenis_zakat'],
        raw: true
    });

    return rows.reduce((acc, row) => {
        acc[row.jenis_zakat] = Number(row.total || 0);
        return acc;
    }, { fitrah: 0, maal: 0, profesi: 0 });
};

const getZakatTransparency = async (query = {}) => {
    const status = query.status || 'approved';
    const where = status === 'all' ? {} : { status };

    const [collectedByJenis, distributedByJenis, distributions, pendingCount] = await Promise.all([
        getZakatCollectedByJenis(),
        getApprovedDistributionByJenis(),
        ZakatDistribusi.findAll({
            where,
            include: [
                { model: User, as: 'creator', attributes: ['id', 'nama', 'jabatan'] },
                { model: User, as: 'approver', attributes: ['id', 'nama', 'jabatan'] }
            ],
            order: [['tanggal_distribusi', 'DESC'], ['created_at', 'DESC']]
        }),
        ZakatDistribusi.count({ where: { status: 'draft' } })
    ]);

    const totalTerkumpul = Object.values(collectedByJenis).reduce((sum, value) => sum + Number(value || 0), 0);
    const totalTersalurkan = Object.values(distributedByJenis).reduce((sum, value) => sum + Number(value || 0), 0);

    return {
        summary: {
            totalTerkumpul,
            totalTersalurkan,
            sisaAmanah: totalTerkumpul - totalTersalurkan,
            pendingApproval: pendingCount,
            collectedByJenis,
            distributedByJenis
        },
        distributions
    };
};

const createZakatDistribution = async (payload, userId) => {
    assertRequired(payload, ['jenis_zakat', 'kategori_mustahik', 'label_penerima_publik', 'nominal', 'tanggal_distribusi', 'deskripsi']);

    return ZakatDistribusi.create({
        jenis_zakat: payload.jenis_zakat,
        kategori_mustahik: payload.kategori_mustahik,
        nama_penerima: payload.nama_penerima || null,
        label_penerima_publik: payload.label_penerima_publik,
        nominal: toPositiveAmount(payload.nominal),
        tanggal_distribusi: payload.tanggal_distribusi,
        deskripsi: payload.deskripsi,
        bukti_foto: payload.bukti_foto || null,
        status: 'draft',
        created_by: userId || null
    });
};

const updateZakatDistribution = async (id, payload) => {
    const distribution = await ZakatDistribusi.findByPk(id);
    if (!distribution) {
        const error = new Error('Data distribusi zakat tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }
    if (distribution.status === 'approved') {
        const error = new Error('Distribusi zakat yang sudah disetujui tidak bisa diedit');
        error.statusCode = 400;
        throw error;
    }

    await distribution.update({
        jenis_zakat: payload.jenis_zakat || distribution.jenis_zakat,
        kategori_mustahik: payload.kategori_mustahik || distribution.kategori_mustahik,
        nama_penerima: payload.nama_penerima !== undefined ? payload.nama_penerima : distribution.nama_penerima,
        label_penerima_publik: payload.label_penerima_publik || distribution.label_penerima_publik,
        nominal: payload.nominal !== undefined ? toPositiveAmount(payload.nominal) : distribution.nominal,
        tanggal_distribusi: payload.tanggal_distribusi || distribution.tanggal_distribusi,
        deskripsi: payload.deskripsi || distribution.deskripsi,
        bukti_foto: payload.bukti_foto !== undefined ? payload.bukti_foto : distribution.bukti_foto,
        status: 'draft',
        reject_reason: null,
        rejected_by: null,
        rejected_at: null
    });

    return distribution;
};

const approveZakatDistribution = async (id, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const distribution = await ZakatDistribusi.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
        if (!distribution) {
            const error = new Error('Data distribusi zakat tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }
        if (distribution.status === 'approved') {
            const error = new Error('Distribusi zakat sudah disetujui');
            error.statusCode = 400;
            throw error;
        }

        const ledger = await KasBukuBesar.create({
            tanggal: distribution.tanggal_distribusi,
            deskripsi: `Penyaluran zakat ${String(distribution.jenis_zakat).toUpperCase()} - ${distribution.label_penerima_publik}`,
            jenis: 'keluar',
            jumlah: distribution.nominal,
            kategori: `penyaluran_zakat_${distribution.jenis_zakat}`,
            source_table: 'zakat_distribusi',
            source_id: distribution.id,
            metode_input: 'manual',
            bukti_transfer: distribution.bukti_foto,
            nama_pemberi: distribution.label_penerima_publik
        }, { transaction });

        await distribution.update({
            status: 'approved',
            approved_by: userId,
            approved_at: new Date(),
            rejected_by: null,
            rejected_at: null,
            reject_reason: null,
            ledger_id: ledger.id
        }, { transaction });

        await transaction.commit();
        return distribution;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const rejectZakatDistribution = async (id, userId, reason) => {
    const distribution = await ZakatDistribusi.findByPk(id);
    if (!distribution) {
        const error = new Error('Data distribusi zakat tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }
    if (distribution.status === 'approved') {
        const error = new Error('Distribusi zakat yang sudah disetujui tidak bisa ditolak');
        error.statusCode = 400;
        throw error;
    }

    await distribution.update({
        status: 'rejected',
        reject_reason: reason || 'Ditolak oleh pengurus',
        rejected_by: userId,
        rejected_at: new Date()
    });

    return distribution;
};

const getProgramTransparency = async (programId, query = {}) => {
    const status = query.status || 'approved';
    const where = status === 'all' ? { barang_id: programId } : { barang_id: programId, status };

    const program = await BarangPengadaan.findByPk(programId);
    if (!program) {
        const error = new Error('Program pengadaan tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    const [realisasi, approvedTotal, pendingCount] = await Promise.all([
        PengadaanRealisasi.findAll({
            where,
            include: [
                { model: User, as: 'creator', attributes: ['id', 'nama', 'jabatan'] },
                { model: User, as: 'approver', attributes: ['id', 'nama', 'jabatan'] }
            ],
            order: [['tanggal_realisasi', 'DESC'], ['created_at', 'DESC']]
        }),
        PengadaanRealisasi.sum('nominal', { where: { barang_id: programId, status: 'approved' } }),
        PengadaanRealisasi.count({ where: { barang_id: programId, status: 'draft' } })
    ]);

    const danaTerkumpul = Number(program.dana_terkumpul || 0);
    const totalRealisasi = Number(approvedTotal || 0);

    return {
        program,
        summary: {
            targetDana: Number(program.target_dana || 0),
            danaAwalKas: Number(program.dana_awal_kas || 0),
            danaDonasi: Number(program.dana_donasi || 0),
            danaTerkumpul,
            totalRealisasi,
            sisaDana: danaTerkumpul - totalRealisasi,
            pendingApproval: pendingCount
        },
        realisasi
    };
};

const createProgramRealisasi = async (programId, payload, userId) => {
    assertRequired(payload, ['penerima_vendor', 'nominal', 'tanggal_realisasi', 'deskripsi']);

    const program = await BarangPengadaan.findByPk(programId);
    if (!program) {
        const error = new Error('Program pengadaan tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    return PengadaanRealisasi.create({
        barang_id: programId,
        penerima_vendor: payload.penerima_vendor,
        nominal: toPositiveAmount(payload.nominal),
        tanggal_realisasi: payload.tanggal_realisasi,
        deskripsi: payload.deskripsi,
        bukti_foto: payload.bukti_foto || null,
        status: 'draft',
        created_by: userId || null
    });
};

const updateProgramRealisasi = async (id, payload) => {
    const realisasi = await PengadaanRealisasi.findByPk(id);
    if (!realisasi) {
        const error = new Error('Data realisasi pengadaan tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }
    if (realisasi.status === 'approved') {
        const error = new Error('Realisasi yang sudah disetujui tidak bisa diedit');
        error.statusCode = 400;
        throw error;
    }

    await realisasi.update({
        penerima_vendor: payload.penerima_vendor || realisasi.penerima_vendor,
        nominal: payload.nominal !== undefined ? toPositiveAmount(payload.nominal) : realisasi.nominal,
        tanggal_realisasi: payload.tanggal_realisasi || realisasi.tanggal_realisasi,
        deskripsi: payload.deskripsi || realisasi.deskripsi,
        bukti_foto: payload.bukti_foto !== undefined ? payload.bukti_foto : realisasi.bukti_foto,
        status: 'draft',
        reject_reason: null,
        rejected_by: null,
        rejected_at: null
    });

    return realisasi;
};

const approveProgramRealisasi = async (id, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const realisasi = await PengadaanRealisasi.findByPk(id, {
            include: [{ model: BarangPengadaan, as: 'program' }],
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!realisasi) {
            const error = new Error('Data realisasi pengadaan tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }
        if (realisasi.status === 'approved') {
            const error = new Error('Realisasi sudah disetujui');
            error.statusCode = 400;
            throw error;
        }

        const ledger = await KasBukuBesar.create({
            tanggal: realisasi.tanggal_realisasi,
            deskripsi: `Realisasi program pengadaan ${realisasi.program?.nama_barang || ''} - ${realisasi.penerima_vendor}`,
            jenis: 'keluar',
            jumlah: realisasi.nominal,
            kategori: 'realisasi_pengadaan',
            source_table: 'pengadaan_realisasi',
            source_id: realisasi.id,
            metode_input: 'manual',
            bukti_transfer: realisasi.bukti_foto,
            nama_pemberi: realisasi.penerima_vendor
        }, { transaction });

        await realisasi.update({
            status: 'approved',
            approved_by: userId,
            approved_at: new Date(),
            rejected_by: null,
            rejected_at: null,
            reject_reason: null,
            ledger_id: ledger.id
        }, { transaction });

        await transaction.commit();
        return realisasi;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const rejectProgramRealisasi = async (id, userId, reason) => {
    const realisasi = await PengadaanRealisasi.findByPk(id);
    if (!realisasi) {
        const error = new Error('Data realisasi pengadaan tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }
    if (realisasi.status === 'approved') {
        const error = new Error('Realisasi yang sudah disetujui tidak bisa ditolak');
        error.statusCode = 400;
        throw error;
    }

    await realisasi.update({
        status: 'rejected',
        reject_reason: reason || 'Ditolak oleh pengurus',
        rejected_by: userId,
        rejected_at: new Date()
    });

    return realisasi;
};

module.exports = {
    getZakatTransparency,
    createZakatDistribution,
    updateZakatDistribution,
    approveZakatDistribution,
    rejectZakatDistribution,
    getProgramTransparency,
    createProgramRealisasi,
    updateProgramRealisasi,
    approveProgramRealisasi,
    rejectProgramRealisasi
};
