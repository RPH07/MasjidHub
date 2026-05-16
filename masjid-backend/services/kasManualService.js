const { Op } = require('sequelize');
const sequelize = require('../config/db');
const KasManual = require('../models/KasManualModels');
const KasBukuBesar = require('../models/KasBukuBesarModels');

const toIntegerAmount = (jumlah) => {
    const parsed = parseInt(jumlah, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        const error = new Error('Jumlah harus berupa angka lebih dari 0');
        error.statusCode = 400;
        throw error;
    }

    return parsed;
};

const getLedgerCategory = ({ jenis, kategori, kategori_pemasukan }) => {
    if (jenis === 'masuk') {
        return kategori_pemasukan || kategori || 'donasi_umum';
    }

    return kategori || 'operasional';
};

const createKasManual = async (payload) => {
    const transaction = await sequelize.transaction();

    try {
        const jumlah = toIntegerAmount(payload.jumlah);
        const kategori = payload.kategori || 'operasional';
        const kategori_pemasukan = payload.kategori_pemasukan || null;
        const nama_pemberi = payload.nama_pemberi || null;

        const kasManual = await KasManual.create({
            tanggal: payload.tanggal,
            keterangan: payload.keterangan,
            jenis: payload.jenis,
            jumlah,
            kategori,
            kategori_pemasukan,
            nama_pemberi
        }, { transaction });

        const kasBukuBesar = await KasBukuBesar.create({
            tanggal: payload.tanggal,
            deskripsi: payload.keterangan,
            jenis: payload.jenis,
            jumlah,
            kategori: getLedgerCategory({ jenis: payload.jenis, kategori, kategori_pemasukan }),
            source_table: 'manual',
            source_id: kasManual.id,
            metode_input: 'manual',
            nama_pemberi
        }, { transaction });

        await transaction.commit();

        return { kasManual, kasBukuBesar };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const findActiveManualLedger = async (ledgerId, transaction) => {
    const kasBukuBesar = await KasBukuBesar.findOne({
        where: {
            id: ledgerId,
            source_table: 'manual',
            deleted_at: null
        },
        transaction
    });

    if (!kasBukuBesar) {
        const error = new Error('Transaksi kas tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    return kasBukuBesar;
};

const updateKasManual = async (ledgerId, payload) => {
    const transaction = await sequelize.transaction();

    try {
        const kasBukuBesar = await findActiveManualLedger(ledgerId, transaction);
        const jumlah = toIntegerAmount(payload.jumlah);
        const kategori = payload.kategori || 'operasional';
        const kategori_pemasukan = payload.kategori_pemasukan || null;
        const nama_pemberi = payload.nama_pemberi || null;

        const kasManual = await KasManual.findOne({
            where: {
                id: kasBukuBesar.source_id,
                deleted_at: null
            },
            transaction
        });

        if (!kasManual) {
            const error = new Error('Data kas manual tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        await kasManual.update({
            tanggal: payload.tanggal,
            keterangan: payload.keterangan,
            jenis: payload.jenis,
            jumlah,
            kategori,
            kategori_pemasukan,
            nama_pemberi
        }, { transaction });

        await kasBukuBesar.update({
            tanggal: payload.tanggal,
            deskripsi: payload.keterangan,
            jenis: payload.jenis,
            jumlah,
            kategori: getLedgerCategory({ jenis: payload.jenis, kategori, kategori_pemasukan }),
            nama_pemberi
        }, { transaction });

        await transaction.commit();

        return { kasManual, kasBukuBesar };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteKasManual = async (ledgerId) => {
    const transaction = await sequelize.transaction();

    try {
        const kasBukuBesar = await findActiveManualLedger(ledgerId, transaction);
        const deletedAt = new Date();

        await KasManual.update({
            deleted_at: deletedAt
        }, {
            where: {
                id: kasBukuBesar.source_id,
                deleted_at: null
            },
            transaction
        });

        await KasBukuBesar.update({
            deleted_at: deletedAt
        }, {
            where: {
                source_table: 'manual',
                source_id: kasBukuBesar.source_id,
                deleted_at: { [Op.is]: null }
            },
            transaction
        });

        await transaction.commit();

        return { deleted: true };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createKasManual,
    updateKasManual,
    deleteKasManual
};
