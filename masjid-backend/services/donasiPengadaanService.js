const sequelize = require('../config/db');
const KasBukuBesar = require('../models/KasBukuBesarModels');
const DonasiPengadaan = require('../models/DonasiPengadaanModels');
const BarangPengadaan = require('../models/BarangPengadaanModels');


const toNumber = (value) => {
    const parsed = Number(value);

    if(Number.isNaN(parsed)) {
        const error = new Error(`Nilai donasi harus berupa angka lebih dari 0. Diterima: ${value}`);
        error.statusCode = 400;
        throw error;
    }

    return parsed;
};

const createLedgerFromDonasi = async(donasi, program, transaction   ) => {
    const existingLedger = await KasBukuBesar.findOne({
        where: {
            source_table: 'donasi_pengadaan',
            source_id: donasi.id,
            deleted_at: null
        },
        transaction
    });

    if(existingLedger) return existingLedger;

    return KasBukuBesar.create({
        tanggal: donasi.create_at || new Date(),
        deskripsi: `Donasi untuk program ${program.nama_barang} (ID: ${donasi.id})`,
        jenis: 'masuk',
        jumlah: donasi.nominal,
        kategori: 'donasi',
        source_table: 'donasi_pengadaan',
        source_id: donasi.id,
        kode_unik: donasi.kode_unik,
        nama_pemberi: donasi.nama_donatur,
        metode_pembayaran: donasi.metode_pembayaran,
        bukti_transfer: donasi.bukti_transfer,
        metode_input: 'online'
    }, {transaction});
};

const refreshProgramDonationFunding = async(barangId, transaction) => {
    const program = await BarangPengadaan.findByPk(barangId, {transaction});

    if (!program) {
        const error = new Error('Program pengadaan tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    const totalDonasi = await DonasiPengadaan.sum('nominal', {
        where: {
            barang_id: barangId,
            status: 'approved',
            deleted_at: null
        },
        transaction
    });

    const danaDonasi = Number(totalDonasi) || 0;
    const DanaAwalKas = Number(program.dana_awal_kas) || 0;
    const targetDana = Number(program.target_dana) || 0;
    const danaTerkumpul = danaDonasi + DanaAwalKas;

    await program.update({
        dana_donasi: danaDonasi,
        dana_terkumpul: danaTerkumpul,
        status_donasi: danaTerkumpul >= targetDana ? 'terpenuhi' : 'belum_terpenuhi',
        total_donatur: totalDonatur
    }, {transaction});

    return program;
};

const verifyDonasiPengadaan = async({id, action, reject_reason, validateBy}) => {
    const transaction = await sequelize.transaction();

    try {
        const donasi = await DonasiPengadaan.findByPk(id, {
            include: [{model: BarangPengadaan, as:'barang'}],

            transaction
        });

        if (!donasi) {
            const error = new Error('Donasi pengadaan tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        if (donasi.status !== 'pending') {
            const error = new Error('Donasi pengadaan tidak dalam status pending');
            error.statusCode = 400;
            throw error;
        }

        if (action === 'approve') {
            await donasi.update({
                status: 'approved',
                reject_reason: null,
                validated_by: validateBy || null,
            validated_at: new Date()
            }, {transaction});

            await createLedgerFromDonasi(donasi, donasi.barang, transaction);
            await refreshProgramDonationFunding(donasi.barang_id, transaction);
        } else if (action === 'reject') {
            await donasi.update({
                status: 'rejected',
                reject_reason: reject_reason || null,
                validated_by: validateBy || null,
                validated_at: new Date()
            }, {transaction});

            await KasBukuBesar.update({
                deleted_at: new Date()
            }, {
                where: {
                    source_table: 'donasi_pengadaan',
                    source_id: donasi.id,
                    deleted_at: null
                },
                transaction
            });

            await refreshProgramDonationFunding(donasi.barang_id, transaction);
        } else {
            const error = new Error('Aksi tidak valid. Harus "approve" atau "reject".');
            error.statusCode = 400;
            throw error;
        }
        await transaction.commit();
        return donasi;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}



const generatedKodeUnik = async(nominal, barangId) => {
    const pendingDonasi = await DonasiPengadaan.findAll({
        where: {
            status: 'pending',
            nominal,
            barang_id: barangId
        },
        attributes: ['kode_unik']
    });

    const usedCodes = pendingDonasi
        .map((item) => item.kode_unik)
        .filter((code) => code !== null);
    
    let kodeUnik = 1;
    while(usedCodes.includes(kodeUnik)){
        kodeUnik++;
    }

    if (kodeUnik > 999) {
        const error = new Error('Kode unik untuk donasi ini sudah habis. Silakan coba lagi nanti.');
        error.statusCode = 400;
        throw error;
    }

    return kodeUnik;
};

const createDonasiPengadaan = async(payload) => {
    const program = await BarangPengadaan.findByPk(payload.barang_id);

    if(!program) {
        const error = new Error('Program pengadaan tidak ditemukan');
        error.status = 404;
        throw error;
    }

    if (program.status !== 'aktif') {
        const error = new Error('Program pengadaan tidak aktif');
        error.statusCode = 400;
        throw error;
    }

    const nominal = toNumber(payload.nominal);
    const kodeUnik = await generatedKodeUnik(nominal, payload.barang_id);
    const totalTransfer = nominal + kodeUnik;

    return DonasiPengadaan.create({
        barang_id: payload.barang_id,
        user_id: payload.user_id ||  null,
        nama_donatur: payload.nama_donatur,
        nominal,
        nominal_asli: nominal,
        metode_pembayaran: payload.metode_pembayaran || 'transfer_bank',
        bukti_transfer: payload.bukti_transfer || null,
        status: 'pending',
        kontak_donatur: payload.kontak_donatur || null,
        catatan: payload.catatan || null,
        kode_unik: kodeUnik,
        total_transfer: totalTransfer
    });
};

module.exports = {
    verifyDonasiPengadaan,
    createDonasiPengadaan
};