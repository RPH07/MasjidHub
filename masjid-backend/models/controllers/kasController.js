const kasManualService = require('../../services/kasManualService');
const kasReportService = require('../../services/kasReportService');

const validateKasManualPayload = (payload) => {
    const { tanggal, keterangan, jenis, jumlah } = payload;

    if (!tanggal || !keterangan || !jenis || jumlah === undefined || jumlah === null) {
        return 'Tanggal, keterangan, jenis, dan jumlah wajib diisi';
    }

    if (!['masuk', 'keluar'].includes(jenis)) {
        return 'Jenis harus masuk atau keluar';
    }

    return null;
};

exports.getKasSummary = async (req, res) => {
    try {
        const data = await kasReportService.getKasSummary(req.query);

        res.json({
            success: true,
            msg: 'Ringkasan kas berhasil diambil',
            data
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal mengambil ringkasan kas',
            error: error.message
        });
    }
};

exports.createKasManual = async(req, res) => {
    try {
        const validationError = validateKasManualPayload(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, msg: validationError });
        }

        const data = await kasManualService.createKasManual(req.body);
        res.status(201).json({
            success: true,
            msg: 'Data kas manual berhasil ditambahkan',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal menambahkan data kas manual',
            error: error.message
        });
    }
};

exports.updateKasManual = async(req, res) => {
    try {
        const validationError = validateKasManualPayload(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, msg: validationError });
        }

        const data = await kasManualService.updateKasManual(req.params.id, req.body);
        res.status(200).json({
            success: true,
            msg: 'Data kas manual berhasil diupdate',
            data
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal mengupdate data kas manual',
            error: error.message
        });
    }
}

exports.deleteKasManual = async(req, res) => {
    try {
        await kasManualService.deleteKasManual(req.params.id);
        res.status(200).json({
            success: true,
            msg: 'Data kas manual berhasil dihapus'
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal menghapus data kas manual',
            error: error.message
        });
    }
}
