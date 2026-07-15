const zakatSettingService = require('../../services/zakatSettingService');

const handleError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        msg: error.message || 'Server error'
    });
};

exports.getActiveSetting = async (req, res) => {
    try {
        const data = await zakatSettingService.getActiveZakatSetting();
        res.json({
            success: true,
            data
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getSettings = async (req, res) => {
    try {
        const data = await zakatSettingService.getZakatSettings();
        res.json({
            success: true,
            total_data: data.length,
            data
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.createSetting = async (req, res) => {
    try {
        const data = await zakatSettingService.createZakatSetting(req.body, req.userId);
        res.status(201).json({
            success: true,
            msg: 'Setting zakat berhasil dibuat',
            data
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const data = await zakatSettingService.updateZakatSetting(req.params.id, req.body, req.userId);
        res.json({
            success: true,
            msg: 'Setting zakat berhasil diperbarui',
            data
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.activateSetting = async (req, res) => {
    try {
        const data = await zakatSettingService.activateZakatSetting(req.params.id, req.userId);
        res.json({
            success: true,
            msg: 'Setting zakat berhasil diaktifkan',
            data
        });
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteSetting = async (req, res) => {
    try {
        await zakatSettingService.deleteZakatSetting(req.params.id);
        res.json({
            success: true,
            msg: 'Setting zakat berhasil dihapus'
        });
    } catch (error) {
        handleError(res, error);
    }
};
