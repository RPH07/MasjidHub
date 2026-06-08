const Zakat = require('../ZakatModels');
const BankMasjid = require('../BankModels');
const {Op} = require('sequelize');
const {cloudinary} = require('../../config/cloudinary');
const zakatService = require('../../services/zakatService');

exports.getZakat = async(req, res) => {
    // todo: bikin get zakat.
    try {
        const {status, jenis_zakat} = req.query;

        let condition = {};
        if (status) {
            condition.status = status;
        }
        if (jenis_zakat) {
            condition.jenis_zakat = jenis_zakat;
        }

        const zakatList = await Zakat.findAll({
            where: condition,
            order: [['created_at', 'DESC']],
        });

        res.status(200).json({
            success: true,
            msg: "Berhasil mengambil data zakat",
            total_data: zakatList.length,
            data: zakatList
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Server error saat mengambil data zakat",
            error: error.message
        });
    }
}

// create zakat(hitung + generate kode unik)
exports.createZakat = async (req, res) => {
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

exports.uploadBuktiZakat = async (req, res) => {
    try {
        const { id } = req.params;
        const zakat = await Zakat.findByPk(id);

        if (!zakat) return res.status(404).json({ success: false, msg: "Data zakat tidak ditemukan" });

        if (!req.file) return res.status(400).json({ success: false, msg: "Mohon upload file bukti transfer" });

        await zakat.update({
            bukti_transfer: req.file.path,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            msg: "Bukti transfer berhasil diupload ke Cloudinary",
            url: req.file.path
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, msg: error.message });
    }
};

exports.verifyZakat = async(req, res) => {
    try {
        const zakat = await zakatService.verifyZakat({
            id: req.params.id,
            action: req.body.action,
            reject_reason: req.body.reject_reason,
            validateBy: req.userId
        });

        res.json({
            success: true,
            msg: `Zakat berhasil di-${req.body.action === 'approve' ? 'setujui' : 'tolak'}`,
            data: zakat
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: error.message
        });
    }
};