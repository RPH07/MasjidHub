const DonasiPengadaan = require('../models/DonasiPengadaanModels');
const BarangPengadaan = require('../models/BarangPengadaanModels');
const Zakat = require('../models/ZakatModels');

const toNumber = (value) => Number(value || 0);

const mapDonasi = (item) => ({
    id: item.id,
    type: 'donasi',
    nama: item.nama_donatur || 'Hamba Allah',
    detail_program: item.barang?.nama_barang || 'Program Donasi',
    jumlah: toNumber(item.nominal),
    status: item.status,
    metode_pembayaran: item.metode_pembayaran,
    kode_unik: item.kode_unik,
    total_transfer: toNumber(item.total_transfer),
    bukti_transfer: item.bukti_transfer,
    catatan: item.catatan,
    reject_reason: item.reject_reason,
    created_at: item.created_at,
    validated_at: item.validated_at
});

const mapZakat = (item) => ({
    id: item.id,
    type: 'zakat',
    nama: item.nama,
    detail_program: `Zakat ${item.jenis_zakat}`,
    jenis_kontribusi: item.jenis_zakat,
    jumlah: toNumber(item.jumlah),
    status: item.status,
    metode_pembayaran: item.metode_pembayaran,
    kode_unik: item.kode_unik,
    total_transfer: toNumber(item.total_bayar),
    bukti_transfer: item.bukti_transfer,
    reject_reason: item.reject_reason,
    created_at: item.created_at,
    validated_at: item.validated_at
});

const getUserContributionHistory = async(userId) => {
    const [donasi, zakat] = await Promise.all([
        DonasiPengadaan.findAll({
            where: {
                user_id: userId,
                deleted_at: null
            },
            include: [{
                model: BarangPengadaan,
                as: 'barang',
                attributes: ['id', 'nama_barang']
            }],
            order: [['created_at', 'DESC']]
        }),
        Zakat.findAll({
            where: {
                user_id: userId
            },
            order: [['created_at', 'DESC']]
        })
    ]);

    return [
        ...donasi.map(mapDonasi),
        ...zakat.map(mapZakat)
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const buildStatusSummary = (items) => ({
    total_count: items.length,
    total_amount: items
        .filter((item) => item.status === 'approved')
        .reduce((sum, item) => sum + toNumber(item.jumlah), 0),
    pending_count: items.filter((item) => item.status === 'pending').length,
    approved_count: items.filter((item) => item.status === 'approved').length,
    rejected_count: items.filter((item) => item.status === 'rejected').length
});

const getUserContributionSummary = async(userId) => {
    const history = await getUserContributionHistory(userId);
    const donasi = history.filter((item) => item.type === 'donasi');
    const zakat = history.filter((item) => item.type === 'zakat');

    return {
        total: buildStatusSummary(history),
        donasi: buildStatusSummary(donasi),
        zakat: buildStatusSummary(zakat)
    };
};

module.exports = {
    getUserContributionHistory,
    getUserContributionSummary
};
