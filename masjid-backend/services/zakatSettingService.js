const sequelize = require('../config/db');
const ZakatSetting = require('../models/ZakatSettingModels');

const DEFAULT_ZAKAT_SETTING = {
    tahun: 2026,
    label: 'BAZNAS RI 2026',
    sumber: 'BAZNAS RI',
    source_url: 'https://baznas.go.id/zakatfitrah',
    fitrah_uang: 50000,
    fitrah_beras_kg: 2.5,
    fitrah_beras_liter: 3.5,
    nisab_maal: 91681728,
    nisab_penghasilan_bulanan: 7640144,
    nisab_penghasilan_tahunan: 91681728,
    kadar_zakat: 0.025,
    is_active: true,
    notes: 'Default awal berdasarkan publikasi BAZNAS RI 2026. Ubah lewat dashboard pengurus jika masjid memakai ketetapan lokal.'
};

let initPromise;

const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    return Number(value);
};

const normalizeSetting = (setting) => {
    const plain = setting?.toJSON ? setting.toJSON() : setting;
    if (!plain) return null;

    return {
        ...plain,
        fitrah_uang: toNumber(plain.fitrah_uang),
        fitrah_beras_kg: toNumber(plain.fitrah_beras_kg),
        fitrah_beras_liter: toNumber(plain.fitrah_beras_liter),
        nisab_maal: toNumber(plain.nisab_maal),
        nisab_penghasilan_bulanan: toNumber(plain.nisab_penghasilan_bulanan),
        nisab_penghasilan_tahunan: toNumber(plain.nisab_penghasilan_tahunan),
        kadar_zakat: toNumber(plain.kadar_zakat)
    };
};

const ensureZakatSettingsReady = async () => {
    if (!initPromise) {
        initPromise = (async () => {
            await ZakatSetting.sync();

            const total = await ZakatSetting.count();
            if (total === 0) {
                await ZakatSetting.create(DEFAULT_ZAKAT_SETTING);
            }
        })();
    }

    return initPromise;
};

const buildPayload = (body, userId) => {
    const payload = {
        tahun: Number(body.tahun),
        label: body.label?.trim(),
        sumber: body.sumber?.trim() || 'BAZNAS RI',
        source_url: body.source_url?.trim() || null,
        fitrah_uang: Number(body.fitrah_uang),
        fitrah_beras_kg: Number(body.fitrah_beras_kg ?? 2.5),
        fitrah_beras_liter: Number(body.fitrah_beras_liter ?? 3.5),
        nisab_maal: Number(body.nisab_maal),
        nisab_penghasilan_bulanan: Number(body.nisab_penghasilan_bulanan),
        nisab_penghasilan_tahunan: Number(body.nisab_penghasilan_tahunan),
        kadar_zakat: Number(body.kadar_zakat ?? 0.025),
        is_active: Boolean(body.is_active),
        notes: body.notes?.trim() || null,
        updated_by: userId
    };

    const required = [
        'tahun',
        'label',
        'fitrah_uang',
        'nisab_maal',
        'nisab_penghasilan_bulanan',
        'nisab_penghasilan_tahunan',
        'kadar_zakat'
    ];

    const invalidField = required.find((field) => {
        if (field === 'label') return !payload[field];
        return Number.isNaN(Number(payload[field])) || payload[field] <= 0;
    });

    if (invalidField) {
        const error = new Error(`Field ${invalidField} wajib diisi dengan nilai valid`);
        error.statusCode = 400;
        throw error;
    }

    if (payload.kadar_zakat > 1) {
        const error = new Error('Kadar zakat gunakan desimal, contoh 0.025 untuk 2.5%');
        error.statusCode = 400;
        throw error;
    }

    return payload;
};

const getActiveZakatSetting = async () => {
    await ensureZakatSettingsReady();

    const setting = await ZakatSetting.findOne({
        where: { is_active: true },
        order: [['tahun', 'DESC'], ['id', 'DESC']]
    });

    return normalizeSetting(setting || DEFAULT_ZAKAT_SETTING);
};

const getZakatSettings = async () => {
    await ensureZakatSettingsReady();

    const settings = await ZakatSetting.findAll({
        order: [['is_active', 'DESC'], ['tahun', 'DESC'], ['id', 'DESC']]
    });

    return settings.map(normalizeSetting);
};

const createZakatSetting = async (body, userId) => {
    await ensureZakatSettingsReady();
    const payload = buildPayload(body, userId);

    return sequelize.transaction(async (transaction) => {
        if (payload.is_active) {
            await ZakatSetting.update(
                { is_active: false, updated_by: userId },
                { where: { is_active: true }, transaction }
            );
        }

        const setting = await ZakatSetting.create(
            { ...payload, created_by: userId },
            { transaction }
        );

        return normalizeSetting(setting);
    });
};

const updateZakatSetting = async (id, body, userId) => {
    await ensureZakatSettingsReady();
    const payload = buildPayload(body, userId);

    return sequelize.transaction(async (transaction) => {
        const setting = await ZakatSetting.findByPk(id, { transaction });
        if (!setting) {
            const error = new Error('Setting zakat tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        if (setting.is_active && !payload.is_active) {
            const error = new Error('Setting aktif tidak bisa dinonaktifkan langsung. Aktifkan setting lain sebagai pengganti.');
            error.statusCode = 400;
            throw error;
        }

        if (payload.is_active) {
            await ZakatSetting.update(
                { is_active: false, updated_by: userId },
                { where: { is_active: true }, transaction }
            );
        }

        await setting.update(payload, { transaction });
        return normalizeSetting(setting);
    });
};

const activateZakatSetting = async (id, userId) => {
    await ensureZakatSettingsReady();

    return sequelize.transaction(async (transaction) => {
        const setting = await ZakatSetting.findByPk(id, { transaction });
        if (!setting) {
            const error = new Error('Setting zakat tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        await ZakatSetting.update(
            { is_active: false, updated_by: userId },
            { where: { is_active: true }, transaction }
        );

        await setting.update({ is_active: true, updated_by: userId }, { transaction });
        return normalizeSetting(setting);
    });
};

const deleteZakatSetting = async (id) => {
    await ensureZakatSettingsReady();

    const setting = await ZakatSetting.findByPk(id);
    if (!setting) {
        const error = new Error('Setting zakat tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    if (setting.is_active) {
        const error = new Error('Setting zakat aktif tidak boleh dihapus. Aktifkan setting lain terlebih dahulu.');
        error.statusCode = 400;
        throw error;
    }

    await setting.destroy();
};

module.exports = {
    DEFAULT_ZAKAT_SETTING,
    getActiveZakatSetting,
    getZakatSettings,
    createZakatSetting,
    updateZakatSetting,
    activateZakatSetting,
    deleteZakatSetting
};
