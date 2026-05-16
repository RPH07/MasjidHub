const { Op, fn, col, literal } = require("sequelize");
const KasBukuBesar = require("../models/KasBukuBesarModels");


// ======== helper function ========
const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getPeriodFilter = (period) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    let startDate, endDate;

    switch (period) {
        case "hari-ini":
            startDate = new Date(year, month, date);
            endDate = new Date(year, month, date + 1);
            break;

        case "kemarin":
            startDate = new Date(year, month, date - 1);
            endDate = new Date(year, month, date);
            break;

        case "minggu-ini":
            const dayOfWeek = today.getDay();
            const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Senin = 0
            startDate = new Date(year, month, date - daysFromMonday);
            endDate = new Date(year, month, date - daysFromMonday + 7);
            break;

        case "minggu-lalu":
            const lastWeekDay = today.getDay();
            const daysFromLastMonday = lastWeekDay === 0 ? 6 : lastWeekDay - 1;
            startDate = new Date(year, month, date - daysFromLastMonday - 7);
            endDate = new Date(year, month, date - daysFromLastMonday);
            break;

        case "bulan-ini":
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 1);
            break;

        case "bulan-lalu":
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 1);
            break;

        case "tahun-ini":
            startDate = new Date(year, 0, 1);
            endDate = new Date(year + 1, 0, 1);
            break;

        case "tahun-lalu":
            startDate = new Date(year - 1, 0, 1);
            endDate = new Date(year, 0, 1);
            break;

        default:
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month + 1, 1);
    }

    return {
        startDate: formatDateLocal(startDate),
        endDate: formatDateLocal(endDate),
    };
};

const buildDateWhere = (startDate, endDate) => ({
    tanggal: {
        [Op.gte]: startDate,
        [Op.lt]: endDate
    },
    deleted_at: null
});

const getTotalByJenis = async (where) => {
    const totalMasuk = await KasBukuBesar.sum('jumlah', {
        where: {
            ...where,
            jenis: 'masuk'
        }
    });

    const totalKeluar = await KasBukuBesar.sum('jumlah', {
        where: {
            ...where,
            jenis: 'keluar'
        }
    });

    return {
        totalMasuk: Number(totalMasuk || 0),
        totalKeluar: Number(totalKeluar || 0)
    };
};

const getKodeUnikStats = async (where) => {
    const rows = await KasBukuBesar.findAll({
        attributes: [
            [fn('COUNT', col('kode_unik')), 'totalTransaksi'],
            [fn('COALESCE', fn('SUM', col('kode_unik')), 0), 'totalKodeUnik']
        ],
        where: {
            ...where,
            jenis: 'masuk',
            kode_unik: {
                [Op.ne]: null
            }
        },
        raw: true
    });

    return {
        totalTransaksi: Number(rows[0]?.totalTransaksi || 0),
        totalKodeUnik: Number(rows[0]?.totalKodeUnik || 0)
    };
};

const getPemasukanKategori = async (where) => {
    const rows = await KasBukuBesar.findAll({
        attributes: [
            [
            literal(`CASE
                WHEN source_table = 'zakat' THEN 'zakat'
                WHEN source_table = 'infaq' THEN 'infaq'
                WHEN source_table = 'donasi_pengadaan' THEN 'donasi'
                ELSE 'kas_manual'
            END`),
            'kategori_grouped'
            ],
            [fn('COALESCE', fn('SUM', col('jumlah')), 0), 'total']
        ],
        where: {
            ...where,
            jenis: 'masuk'
        },
        group: [literal('kategori_grouped')],
        raw: true
    });

    const result = {
        zakat: 0,
        infaq: 0,
        donasi: 0,
        kas_manual: 0
    };

    rows.forEach(row => {
        result[row.kategori_grouped] = Number(row.total || 0);
    });
    
    return result;
};


// ======== main function ========

const getKasSummary = async ({period = 'bulan-ini', startDate, endDate}) => { 
    const dateFilter = startDate && endDate ? {startDate, endDate} : getPeriodFilter(period);
    const totalSaldoRows = await getTotalByJenis({
        deleted_at: null
    });
    const periodWhere = buildDateWhere(dateFilter.startDate, dateFilter.endDate);
    const kodeUnikStats = await getKodeUnikStats(periodWhere);
    const pemasukanKategori = await getPemasukanKategori(periodWhere);

    const periodRows = await getTotalByJenis(periodWhere);

    return {
        totalPemasukan: periodRows.totalMasuk,
        totalPengeluaran: periodRows.totalKeluar,
        saldoBersih: periodRows.totalMasuk - periodRows.totalKeluar,
        totalSaldo: totalSaldoRows.totalMasuk - totalSaldoRows.totalKeluar,
        dateFilter,
        kodeUnikStats,
        pemasukanKategori
    };
};


module.exports = {
    getKasSummary,
};
