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

const getPengeluaranKategori = async (where) => {
    const rows = await KasBukuBesar.findAll({
        attributes: [
            [fn('COALESCE', col('kategori'), 'operasional'), 'kategori_grouped'],
            [fn('COALESCE', fn('SUM', col('jumlah')), 0), 'total']
        ],
        where: {
            ...where,
            jenis: 'keluar'
        },
        group: [fn('COALESCE', col('kategori'), 'operasional')],
        raw: true
    });

    const result = {};
    rows.forEach(row => {
        result[row.kategori_grouped] = Number(row.total || 0);
    });
    return result;
};

const getPreviousPeriod = (period) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    let startDate, endDate;

    switch (period) {
        case 'hari-ini':
            startDate = new Date(year, month, date - 1);
            endDate = new Date(year, month, date);
            break;

        case 'minggu-ini': {
            const dayOfWeek = today.getDay();
            const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(year, month, date - daysFromMonday - 7);
            endDate = new Date(year, month, date - daysFromMonday);
            break;
        }

        case 'bulan-ini':
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 1);
            break;

        case 'tahun-ini':
            startDate = new Date(year - 1, 0, 1);
            endDate = new Date(year, 0, 1);
            break;
    
        default:
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 1);
    }
    return { 
        startDate: formatDateLocal(startDate),
        endDate: formatDateLocal(endDate)
    };
};

const calculatePercentageChanges = (current, previous) => {
    const curr = Number(current || 0);
    const prev = Number(previous || 0);

    if(curr ===  prev) return 0;
    if(prev === 0) {
        if (curr === 0) return 0;
        return curr > 0 ? 100 : -100;
    }

    const percentage = ((curr - prev) / Math.abs(prev)) * 100;
    const limited = Math.max(-100, Math.min(100, percentage));

    return Math.round(limited);
};

const getKasTransactions = async({
    startDate,
    endDate,
    period = 'bulan-ini',
    jenis = 'all',
    source = 'all',
    page = 1,
    limit = 20
} = {}) => {
    const dateFilter = startDate && endDate 
    ? {startDate, endDate}
    : getPeriodFilter(period);

    const where = {
        ...buildDateWhere(dateFilter.startDate, dateFilter.endDate)
    };

    if (jenis !== 'all') {
        where.jenis = jenis;
    }

    if (source !== 'all') {
        where.source_table = source;
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.max(Number(limit) || 20, 1);
    const offset = (currentPage - 1) * currentLimit;

    const {rows, count} = await KasBukuBesar.findAndCountAll({
        where,
        order: [
            [['tanggal', 'DESC']],
            [['created_at', 'DESC']]
        ],
        offset,
        limit: currentLimit
    });
    

    const totalPages = Math.ceil(count / currentLimit);

    return {
        transactions: rows,
        pagination: {
            page: currentPage,
            limit: currentLimit,
            totalPages,
            total: count
        },
        filters: {
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
            period, 
            jenis,
            source
        }
    };
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
    const pengeluaranKategori = await getPengeluaranKategori(periodWhere);

    const periodRows = await getTotalByJenis(periodWhere);
    const prevPeriod = await getPreviousPeriod(period);

    const prevTotalSaldoRows = await getTotalByJenis({
        tanggal: {
            [Op.lt]: dateFilter.startDate
        },
        deleted_at: null
    });

    const prevPeriodRows = await getTotalByJenis(
        buildDateWhere(prevPeriod.startDate, prevPeriod.endDate)
    );

    const currentTotalSaldo = totalSaldoRows.totalMasuk - totalSaldoRows.totalKeluar;
    const prevTotalSaldo = prevTotalSaldoRows.totalMasuk - prevTotalSaldoRows.totalKeluar;

    const percentageChanges = {
        saldo: calculatePercentageChanges(currentTotalSaldo, prevTotalSaldo),
        pemasukan: calculatePercentageChanges(periodRows.totalMasuk, prevPeriodRows.totalMasuk),
        pengeluaran: calculatePercentageChanges(periodRows.totalKeluar, prevPeriodRows.totalKeluar)
    };

    return {
        totalPemasukan: periodRows.totalMasuk,
        totalPengeluaran: periodRows.totalKeluar,
        saldoBersih: periodRows.totalMasuk - periodRows.totalKeluar,
        totalSaldo: totalSaldoRows.totalMasuk - totalSaldoRows.totalKeluar,
        dateFilter,
        kodeUnikStats,
        pemasukanKategori,
        pengeluaranKategori,
        percentageChanges
    };
};


module.exports = {
    getKasSummary,
    getKasTransactions
};
