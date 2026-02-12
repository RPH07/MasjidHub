const Zakat = require('../ZakatModels');
const BankMasjid = require('../BankModels');
const {Op} = require('sequelize');
const cloudinary = require('../../config/cloudinary');

// create zakat(hitung + generate kode unik)
exports.createZakat = async (data) => {
    const {
        nama, email, no_telepon, jenis_zakat,
        jumlah_jiwa, total_harta, gaji_kotor,
        jumlah, metode_pembayaran
    } = req.body;

    try {
        // caro semua transaksi dengan status pending
        const pendingZakat = await Zakat.findAll({
            where: {
                jumlah: jumlah,
                status: 'pending'
            },
            attributes: ['kode_unik']
        });

        const usedCodes = pendingZakat.map(t => t.kode_unik).filter(c => c !== null);

        // cari angka terkecil yang belum dipakai
        let kodeUnik = 1;
        while(usedCodes.includes(kodeUnik)) {
            kodeUnik++;
        }

        // safety untuk memastikan kode unik tidak lebih dari 999
        if(kodeUnik > 999) {
            return res.status(400).json({
                msg: "Antrian penuh untuk nominal ini. Silakan coba nominal lain (misal +1 rupiah) atau tunggu beberapa saat."
            });
        }

        const totalBayar = parseInt(jumlah) + kodeUnik;

        // simpen ke db
        const zakat = await Zakat.create({
            user_id: req.userId || null,
            nama, email, no_telepon, jenis_zakat,
            jumlah_jiwa, total_harta, gaji_kotor,
            jumlah,
            kode_unik: kodeUnik,
            total_bayar: totalBayar,
            nominal_asli: jumlah,
            metode_pembayaran,
            status: 'pending'
        });

        const daftarBank = await BankMasjid.findAll({
            where: {
                is_active: true
            },
            attributes: ['nama_bank', 'no_rekening', 'atas_nama', 'jenis']
        });

        res.status(201).json({ 
            msg: "Permintaan Zakat Dibuat", 
            data: zakat,
            instruction: {
                total_transfer: totalBayar,
                kode_unik: kodeUnik,
                rekening_tujuan: daftarBank
            }
        });
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

exports.getZakat = async(req, res) => {
    // todo: bikin get zakat.
}

exports.uploadBuktiZakat = async(req, res) => {
    // todo: bikin upload bukti transfer zakat
}

exports.verifyZakat = async(req, res) => {
    // todo: bikin verifikasi zakat (approve/reject)
}

exports.deleteZakat = async(req, res) => {
    // todo: bikin delete zakat
}