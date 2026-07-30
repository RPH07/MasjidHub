const transparansiService = require('../../services/transparansiService');
const transparansiPdfService = require('../../services/transparansiPdfService');

const sendError = (res, error, fallbackMsg) => {
    res.status(error.statusCode || error.status || 500).json({
        success: false,
        msg: fallbackMsg,
        error: error.message
    });
};

exports.getZakatTransparency = async (req, res) => {
    try {
        const data = await transparansiService.getZakatTransparency(req.query);
        res.json({
            success: true,
            msg: 'Laporan transparansi zakat berhasil diambil',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal mengambil laporan transparansi zakat');
    }
};

exports.exportZakatTransparencyPdf = async (req, res) => {
    try {
        const { fileName, buffer } = await transparansiPdfService.generateZakatTransparencyPdf();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    } catch (error) {
        sendError(res, error, 'Gagal menghasilkan PDF transparansi zakat');
    }
};

exports.createZakatDistribution = async (req, res) => {
    try {
        const data = await transparansiService.createZakatDistribution({
            ...req.body,
            bukti_foto: req.file?.path || req.body.bukti_foto || null
        }, req.userId);

        res.status(201).json({
            success: true,
            msg: 'Draft penyaluran zakat berhasil dibuat',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal membuat draft penyaluran zakat');
    }
};

exports.updateZakatDistribution = async (req, res) => {
    try {
        const data = await transparansiService.updateZakatDistribution(req.params.id, {
            ...req.body,
            bukti_foto: req.file?.path || req.body.bukti_foto
        });

        res.json({
            success: true,
            msg: 'Draft penyaluran zakat berhasil diperbarui',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal memperbarui draft penyaluran zakat');
    }
};

exports.approveZakatDistribution = async (req, res) => {
    try {
        const data = await transparansiService.approveZakatDistribution(req.params.id, req.userId);
        res.json({
            success: true,
            msg: 'Penyaluran zakat berhasil disetujui dan dicatat sebagai kas keluar',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal menyetujui penyaluran zakat');
    }
};

exports.rejectZakatDistribution = async (req, res) => {
    try {
        const data = await transparansiService.rejectZakatDistribution(req.params.id, req.userId, req.body.reason);
        res.json({
            success: true,
            msg: 'Penyaluran zakat berhasil ditolak',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal menolak penyaluran zakat');
    }
};

exports.getProgramTransparency = async (req, res) => {
    try {
        const data = await transparansiService.getProgramTransparency(req.params.programId, req.query);
        res.json({
            success: true,
            msg: 'Laporan transparansi program berhasil diambil',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal mengambil laporan transparansi program');
    }
};

exports.exportProgramTransparencyPdf = async (req, res) => {
    try {
        const { fileName, buffer } = await transparansiPdfService.generateProgramTransparencyPdf(req.params.programId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    } catch (error) {
        sendError(res, error, 'Gagal menghasilkan PDF transparansi program');
    }
};

exports.createProgramRealisasi = async (req, res) => {
    try {
        const data = await transparansiService.createProgramRealisasi(req.params.programId, {
            ...req.body,
            bukti_foto: req.file?.path || req.body.bukti_foto || null
        }, req.userId);

        res.status(201).json({
            success: true,
            msg: 'Draft realisasi program berhasil dibuat',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal membuat draft realisasi program');
    }
};

exports.updateProgramRealisasi = async (req, res) => {
    try {
        const data = await transparansiService.updateProgramRealisasi(req.params.id, {
            ...req.body,
            bukti_foto: req.file?.path || req.body.bukti_foto
        });

        res.json({
            success: true,
            msg: 'Draft realisasi program berhasil diperbarui',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal memperbarui draft realisasi program');
    }
};

exports.approveProgramRealisasi = async (req, res) => {
    try {
        const data = await transparansiService.approveProgramRealisasi(req.params.id, req.userId);
        res.json({
            success: true,
            msg: 'Realisasi program berhasil disetujui dan dicatat sebagai kas keluar',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal menyetujui realisasi program');
    }
};

exports.rejectProgramRealisasi = async (req, res) => {
    try {
        const data = await transparansiService.rejectProgramRealisasi(req.params.id, req.userId, req.body.reason);
        res.json({
            success: true,
            msg: 'Realisasi program berhasil ditolak',
            data
        });
    } catch (error) {
        sendError(res, error, 'Gagal menolak realisasi program');
    }
};
