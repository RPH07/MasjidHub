const sequelize = require('../config/db');
const Zakat = require('../models/ZakatModels');
const KasBukuBesar = require('../models/KasBukuBesarModels');

const createLedgerFromZakat = async (zakat, transaction) => {
    const existingLedger = await KasBukuBesar.findOne({
        where: {
            source_id: zakat.id,
            source_table: 'zakat',
            deleted_at: null
        },
        transaction
    });

    if (existingLedger) return existingLedger;

    return KasBukuBesar.create({
        tanggal: zakat.created_at || new Date(),
        jenis: 'masuk',
        kategori: `zakat_${zakat.jenis_zakat}`,
        deskripsi: `Penerimaan zakat ${String(zakat.jenis_zakat).toUpperCase()} - Dari ${zakat.nama}`,
        jumlah: zakat.jumlah,
        kode_unik: zakat.kode_unik,
        source_table: 'zakat',
        source_id: zakat.id,
        metode_input: 'online',
        metode_pembayaran: zakat.metode_pembayaran,
        bukti_transfer: zakat.bukti_transfer,
        nama_pemberi: zakat.nama
    }, { transaction });
};



const verifyZakat = async ({ id, action, reject_reason, validateBy }) => {
    const transaction = await sequelize.transaction();

    try {
        const zakat = await Zakat.findByPk(id, { transaction });
        if (!zakat) {
            const error = new Error('Data zakat tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        if (zakat.status !== 'pending') {
            const error = new Error('Data zakat tidak dalam status pending');
            error.statusCode = 404;
            throw error;
        }

        if (action === 'approve') {
            await zakat.update({
                status: 'approved',
                reject_reason: null,
                validated_by: validateBy || null,
                validated_at: new Date()
            }, { transaction });
            await createLedgerFromZakat(zakat, transaction);
        } else if (action === 'reject') {
            await zakat.update({
                status: 'rejected',
                reject_reason: reject_reason || 'Bukti tidak sesuai',
                validated_by: validateBy || null,
                validated_at: new Date()
            }, { transaction });
            await KasBukuBesar.update({
                deleted_at: new Date()
            }, {
                where: {
                    source_table: 'zakat',
                    source_id: zakat.id,
                    deleted_at: null
                },
                transaction
            });
        } else {
            const error = new Error('Action tidak valid');
            error.statusCode = 404;
            throw error;
        }
        await transaction.commit();

        return zakat;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}




module.exports = {
    verifyZakat
};