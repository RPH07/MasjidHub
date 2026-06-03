const donasiPengadaanService = require('../../services/donasiPengadaanService');

const validateCreatePayload = (payload) => {
    if(!payload.barang_id) return 'Program pengadaan harus dipilih';
    if(!payload.nama_donatur) return 'Nama donatur harus diisi';
    if(!payload.nominal) return 'Nominal donasi harus diisi';
    return null;
};

exports.createDonasiPengadaan = async(req, res) => {
    try {
        const validationError = validateCreatePayload(req.body);
        if (validationError) {
            return res.status(400).json({
                success: false,
                msg: validationError
            });
        }

        const data = await donasiPengadaanService.createDonasiPengadaan({
            ...req.body,
            user_id: req.userId || null,
            bukti_transfer: req.file?.path || req.body.bukti_transfer || null
        });
        
        res.status(201).json({
            success: true,
            msg: 'Donasi pengadaan berhasil dibuat',
            data,
            instructions: {
                total_transfer: data.total_transfer,
                kode_unik: data.kode_unik
            }
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            msg: 'Gagal membuat donasi pengadaan',
            error: error.message
        });
    }
};

exports.verifyDonasiPengadaan = async(req, res) => {
    try {
        const data = await donasiPengadaanService.verifyDonasiPengadaan({
            id: req.params.id,
            action: req.body.action,
            reject_reason: req.body.reject_reason,
            validateBy: req.userId
        });
        res.status(200).json({
            success: true,
            msg: 'Donasi pengadaan berhasil diverifikasi',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal memverifikasi donasi pengadaan',
            error: error.message
        });
    }
};

exports.getDonasiByProgram = async(req, res) => {
    try {
        const data = await donasiPengadaanService.getDonasiByProgram(req.params.id, req.query);
        res.status(200).json({
            success: true,
            msg: 'Berhasil mengambil donasi pengadaan',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal mengambil donasi pengadaan',
            error: error.message
        });
    }
};