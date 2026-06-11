const { Op } = require('sequelize');
const sequelize = require('../config/db');
const KasBukuBesar = require('../models/KasBukuBesarModels');
const KasManual = require('../models/KasManualModels');
const Zakat = require('../models/ZakatModels');
const DonasiPengadaan = require('../models/DonasiPengadaanModels');
const BarangPengadaan = require('../models/BarangPengadaanModels');

const getActiveLedger = async (ledgerId, transaction) => {
    const ledger = await KasBukuBesar.findOne({
        where: {
            id: ledgerId,
            deleted_at: null
        },
        transaction
    });

    if (!ledger) {
        const error = new Error('Transaksi kas tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    return ledger;
};

const refreshProgramDonationFunding = async (barangId, transaction) => {
    const program = await BarangPengadaan.findByPk(barangId, { transaction });

    if (!program) return null;

    const where = {
        barang_id: barangId,
        status: 'approved',
        deleted_at: null
    };

    const totalDonasi = await DonasiPengadaan.sum('nominal', { where, transaction });
    const totalDonatur = await DonasiPengadaan.count({ where, transaction });

    const danaDonasi = Number(totalDonasi || 0);
    const danaAwalKas = Number(program.dana_awal_kas || 0);
    const targetDana = Number(program.target_dana || 0);
    const danaTerkumpul = danaAwalKas + danaDonasi;

    await program.update({
        dana_donasi: danaDonasi,
        dana_terkumpul: danaTerkumpul,
        total_donatur: totalDonatur,
        status_pengadaan: danaTerkumpul >= targetDana ? 'terpenuhi' : 'belum_terpenuhi'
    }, { transaction });

    return program;
};

const markSourceAsVoided = async (ledger, transaction) => {
    if (ledger.source_table === 'zakat') {
        await Zakat.update({
            status: 'voided'
        }, {
            where: {
                id: ledger.source_id,
                status: 'approved'
            },
            transaction
        });
        return;
    }

    if (ledger.source_table === 'donasi_pengadaan') {
        const donasi = await DonasiPengadaan.findByPk(ledger.source_id, { transaction });

        if (!donasi) return;

        await donasi.update({
            status: 'voided'
        }, { transaction });

        await refreshProgramDonationFunding(donasi.barang_id, transaction);
        return;
    }

    if (ledger.source_table === 'manual' || ledger.source_table === 'kas_manual') {
        await KasManual.update({
            status: 'voided'
        }, {
            where: {
                id: ledger.source_id,
                status: {
                    [Op.ne]: 'voided'
                }
            },
            transaction
        });
    }
};

const requestVoid = async ({ ledgerId, reason, requestedBy, requesterJabatan }) => {
    if (!reason || !reason.trim()) {
        const error = new Error('Alasan void wajib diisi');
        error.statusCode = 400;
        throw error;
    }

    const transaction = await sequelize.transaction();

    try {
        const ledger = await getActiveLedger(ledgerId, transaction);

        if (ledger.void_status !== 'none') {
            const error = new Error('Transaksi ini sudah memiliki proses void');
            error.statusCode = 400;
            throw error;
        }

        const payload = {
            void_status: 'requested',
            void_reason: reason.trim(),
            void_requested_by: requestedBy,
            void_requested_at: new Date()
        };

        if (requesterJabatan === 'ketua_dkm') {
            payload.void_approved_ketua_by = requestedBy;
            payload.void_approved_ketua_at = payload.void_requested_at;
        }

        if (requesterJabatan === 'bendahara') {
            payload.void_approved_bendahara_by = requestedBy;
            payload.void_approved_bendahara_at = payload.void_requested_at;
        }

        await ledger.update(payload, { transaction });

        await transaction.commit();
        return ledger;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const approveVoid = async ({ ledgerId, approverId, approverJabatan }) => {
    const transaction = await sequelize.transaction();

    try {
        const ledger = await getActiveLedger(ledgerId, transaction);

        if (ledger.void_status !== 'requested') {
            const error = new Error('Transaksi tidak sedang menunggu persetujuan void');
            error.statusCode = 400;
            throw error;
        }

        const payload = {};
        const now = new Date();

        if (approverJabatan === 'ketua_dkm') {
            if (ledger.void_approved_ketua_by) {
                const error = new Error('Void sudah disetujui ketua DKM');
                error.statusCode = 400;
                throw error;
            }

            payload.void_approved_ketua_by = approverId;
            payload.void_approved_ketua_at = now;
        } else if (approverJabatan === 'bendahara') {
            if (ledger.void_approved_bendahara_by) {
                const error = new Error('Void sudah disetujui bendahara');
                error.statusCode = 400;
                throw error;
            }

            payload.void_approved_bendahara_by = approverId;
            payload.void_approved_bendahara_at = now;
        } else {
            const error = new Error('Jabatan tidak berhak menyetujui void');
            error.statusCode = 403;
            throw error;
        }

        const ketuaApproved = Boolean(payload.void_approved_ketua_by || ledger.void_approved_ketua_by);
        const bendaharaApproved = Boolean(payload.void_approved_bendahara_by || ledger.void_approved_bendahara_by);

        if (ketuaApproved && bendaharaApproved) {
            payload.void_status = 'approved';
            payload.voided_at = now;
        }

        await ledger.update(payload, { transaction });

        if (payload.void_status === 'approved') {
            await markSourceAsVoided(ledger, transaction);
        }

        await transaction.commit();
        return ledger.reload();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const rejectVoid = async ({ ledgerId, rejectedBy, rejectReason }) => {
    if (!rejectReason || !rejectReason.trim()) {
        const error = new Error('Alasan penolakan void wajib diisi');
        error.statusCode = 400;
        throw error;
    }

    const transaction = await sequelize.transaction();

    try {
        const ledger = await getActiveLedger(ledgerId, transaction);

        if (ledger.void_status !== 'requested') {
            const error = new Error('Transaksi tidak sedang menunggu persetujuan void');
            error.statusCode = 400;
            throw error;
        }

        await ledger.update({
            void_status: 'rejected',
            void_rejected_by: rejectedBy,
            void_rejected_at: new Date(),
            void_reject_reason: rejectReason.trim()
        }, { transaction });

        await transaction.commit();
        return ledger;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    requestVoid,
    approveVoid,
    rejectVoid
};
