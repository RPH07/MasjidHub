const kasManualService = require('../../services/kasManualService');
const kasReportService = require('../../services/kasReportService');
const kasPdfReportService = require('../../services/kasPdfReportService');
const kasExportService = require('../../services/kasExportService');
const kasVoidService = require('../../services/kasVoidService');

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

exports.getKasHistory = async(req, res) => {
    try {
        const data = await kasReportService.getKasHistory(req.query);
        res.json({
            success: true,
            msg: 'Riwayat transaksi kas berhasil diambil',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal mengambil riwayat transaksi kas',
            error: error.message
        });
    }
};

exports.exportsKasReportPdf = async(req, res) => {
    try {
        const {fileName, buffer} = await kasPdfReportService.generateKasReport(req.query);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal menghasilkan laporan PDF kas',
            error: error.message
        });
    }
};

exports.exportsKasHistory = async(req, res) => {
    try {
        const {fileName, contentType, buffer} = await kasExportService.generateKasHistoryExport(req.query);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal export laporan kas',
            error: error.message
        });
    }
};

exports.getKasTransactions = async(req, res) => {
    try {
        const data = await kasReportService.getKasTransactions(req.query);
        res.json({
            success: true,
            msg: 'Daftar transaksi kas berhasil diambil',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal mengambil daftar transaksi kas',
            error: error.message
        });
    }
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

exports.requestVoidKas = async(req, res) => {
    try {
        const data = await kasVoidService.requestVoid({
            ledgerId: req.params.id,
            reason: req.body.reason,
            requestedBy: req.userId,
            requesterJabatan: req.jabatan
        });

        res.status(200).json({
            success: true,
            msg: 'Permintaan void transaksi berhasil dibuat',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal membuat permintaan void transaksi',
            error: error.message
        });
    }
};

exports.approveVoidKas = async(req, res) => {
    try {
        const data = await kasVoidService.approveVoid({
            ledgerId: req.params.id,
            approverId: req.userId,
            approverJabatan: req.jabatan
        });

        res.status(200).json({
            success: true,
            msg: data.void_status === 'approved'
                ? 'Void transaksi sudah disetujui lengkap'
                : 'Persetujuan void transaksi berhasil dicatat',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal menyetujui void transaksi',
            error: error.message
        });
    }
};

exports.rejectVoidKas = async(req, res) => {
    try {
        const data = await kasVoidService.rejectVoid({
            ledgerId: req.params.id,
            rejectedBy: req.userId,
            rejectReason: req.body.reject_reason
        });

        res.status(200).json({
            success: true,
            msg: 'Permintaan void transaksi berhasil ditolak',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal menolak void transaksi',
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
