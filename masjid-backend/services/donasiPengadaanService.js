const donasiPengadaan = require('../models/DonasiPengadaanModels');
const barangPengadaan = require('../models/BarangPengadaanModels');

const toNumber = (value) => {
    const parsed = Number(value);

    if(Number.isNaN(parsed)) {
        const error = new Error(`Nilai donasi harus berupa angka lebih dari 0. Diterima: ${value}`);
        error.status = 400;
        throw error;
    }

    return parsed;
};

const generatedKodeUnik = async() => {
    const pendingDonasi = await donasiPengadaan.find({
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
        error.status = 400;
        throw error;
    }

    return kodeUnik;
};

const createDonasiPengadaan = async(payload) => {
    const program = await barangPengadaan.findByPk(payload.barang_id);

    if(!program) {
        const error = new Error('Program pengadaan tidak ditemukan');
        error.status = 404;
        throw error;
    }

    if (program.status !== 'aktif') {
        const error = new Error('Program pengadaan tidak aktif');
        error.status = 400;
        throw error;
    }

    const nominal = toNumber(payload.nominal);
    const kodeUnik = await generatedKodeUnik(nominal, payload.barang_id);
    const totalTransfer = nominal + kodeUnik;

    return donasiPengadaan.create({
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
    createDonasiPengadaan
};