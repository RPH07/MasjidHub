const kontribusiService = require('../../services/kontribusiService');

const resolveTargetUserId = (req) => Number(req.params.userId || req.userId);

const ensureCanAccess = (req, targetUserId) => {
    if (req.role === 'admin' || req.role === 'dkm') return;
    if (Number(req.userId) === Number(targetUserId)) return;

    const error = new Error('Tidak boleh mengakses riwayat kontribusi user lain');
    error.statusCode = 403;
    throw error;
};

exports.getContributionHistory = async(req, res) => {
    try {
        const targetUserId = resolveTargetUserId(req);
        ensureCanAccess(req, targetUserId);

        const data = await kontribusiService.getUserContributionHistory(targetUserId);

        res.json({
            success: true,
            msg: 'Riwayat kontribusi berhasil diambil',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal mengambil riwayat kontribusi',
            error: error.message
        });
    }
};

exports.getContributionSummary = async(req, res) => {
    try {
        const targetUserId = resolveTargetUserId(req);
        ensureCanAccess(req, targetUserId);

        const data = await kontribusiService.getUserContributionSummary(targetUserId);

        res.json({
            success: true,
            msg: 'Ringkasan kontribusi berhasil diambil',
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            msg: 'Gagal mengambil ringkasan kontribusi',
            error: error.message
        });
    }
};
