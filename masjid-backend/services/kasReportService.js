const { Op, fn, col, literal } = require("sequelize");
const KasBukuBesar = require("../models/KasBukuBesarModels");
const Zakat = require("../models/ZakatModels");
const DonasiPengadaan = require("../models/DonasiPengadaanModels");
const BarangPengadaan = require("../models/BarangPengadaanModels");


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
    deleted_at: null,
    void_status: {
        [Op.ne]: 'approved'
    }
});

const activeLedgerWhere = {
    deleted_at: null,
    void_status: {
        [Op.ne]: 'approved'
    }
};

const normalizeTransaction = (item, type) => {
    if (type === 'zakat') {
        return {
            id: item.id,
            type: 'zakat',
            type_label: 'Zakat',
            nama_pemberi: item.nama,
            jumlah: Number(item.jumlah || 0),
            kategori: item.jenis_zakat || 'lainnya',
            metode_pembayaran: item.metode_pembayaran || 'tunai',
            status: item.status || 'n/a',
            reject_reason: item.status === 'voided'
                ? 'Transaksi dibatalkan melalui proses void'
                : item.reject_reason || null,
            bukti_transfer: item.bukti_transfer || null,
            kode_unik: item.kode_unik || null,
            total_transfer: item.total_bayar || null,
            created_at: item.created_at,
            validated_at: item.validated_at || null
        };
    }

    if (type === 'donasi') {
    return {
        id: item.id,
        type: 'donasi',
        type_label: 'Donasi Program',
        nama_pemberi: item.nama_donatur,
        jumlah: Number(item.nominal || 0),
        kategori: item.barang?.nama_barang || '-',
        program_donasi: item.barang?.nama_barang || '-',
        metode_pembayaran: item.metode_pembayaran || 'transfer_bank',
        status: item.status || 'n/a',
        reject_reason: item.status === 'voided'
            ? 'Transaksi dibatalkan melalui proses void'
            : item.reject_reason || null,
        bukti_transfer: item.bukti_transfer || null,
        kode_unik: item.kode_unik || null,
        total_transfer: item.total_transfer || null,
        created_at: item.created_at,
        validated_at: item.validated_at || null
    };
}

    return item;
};


// ======== main function ========

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
            ['tanggal', 'DESC'],
            ['created_at', 'DESC']
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

const getKasHistory = async({
    period = 'bulan-ini',
    startDate,
    endDate,
    type = 'all',
    status = 'all'
} = {}) => {
    const dateFilter = startDate && endDate 
    ? {startDate, endDate}
    : getPeriodFilter(period);

    const dateWhere = {
        [Op.gte]: dateFilter.startDate,
        [Op.lt]: dateFilter.endDate
    };

    const transactions = [];

    const shouldIncludeLedgerVoidStatus = (voidStatus) => {
        if (status === 'all') return true;
        if (status === 'approved') return voidStatus === 'none' || !voidStatus;
        if (status === 'voided') return voidStatus === 'approved';
        if (status === 'void_requested') return voidStatus === 'requested';
        if (status === 'void_rejected') return voidStatus === 'rejected';
        return false;
    };

    const mapLedgerHistoryStatus = (voidStatus) => {
        if (voidStatus === 'approved') return 'voided';
        if (voidStatus === 'requested') return 'void_requested';
        if (voidStatus === 'rejected') return 'void_rejected';
        return 'approved';
    };

    const mapLedgerHistoryReason = (item) => {
        if (item.void_status === 'approved') {
            return item.void_reason || 'Transaksi dibatalkan melalui proses void';
        }

        if (item.void_status === 'requested') {
            return item.void_reason || 'Menunggu persetujuan void';
        }

        if (item.void_status === 'rejected') {
            return item.void_reject_reason || item.void_reason || 'Permintaan void ditolak';
        }

        return null;
    };

    const getLedgerHistoryDate = (item) => {
        if (item.void_status === 'approved') {
            return item.voided_at || item.updated_at || item.created_at;
        }

        if (item.void_status === 'rejected') {
            return item.void_rejected_at || item.updated_at || item.created_at;
        }

        if (item.void_status === 'requested') {
            return item.void_requested_at || item.updated_at || item.created_at;
        }

        return item.created_at;
    };

    const ledgerHistoryDateOr = [
        { tanggal: dateWhere },
        { void_requested_at: dateWhere },
        { void_rejected_at: dateWhere },
        { voided_at: dateWhere }
    ];

    if (type ===  'all' || type === 'zakat') {
        const where = {
            created_at: dateWhere
        };

        if (status !== 'all') {
            where.status = status;
        }

        const zakatRows = await Zakat.findAll({
            where,
            order: [['created_at', 'DESC']]
        });

        transactions.push(...zakatRows.map((item) => normalizeTransaction(item, 'zakat')));
    }

    if (type === 'all' || type === 'donasi') {
        const where = {
            created_at: dateWhere,
            deleted_at: null
        };

        if (status !== 'all') {
            where.status = status;
        }

        const donasiRows = await DonasiPengadaan.findAll({
            where, 
            include: [{
                model: BarangPengadaan,
                as: 'barang',
                attributes: ['id', 'nama_barang']
            }],
            order: [['created_at', 'DESC']]
        });
        transactions.push(...donasiRows.map((item) => normalizeTransaction(item, 'donasi')));
    }
    
    if (type === 'all' || type === 'kas_manual') {
        if (status === 'all' || status === 'approved' || status === 'voided' || status === 'void_requested' || status === 'void_rejected') {
            const manualWhere = {
                [Op.or]: ledgerHistoryDateOr,
                source_table: 'manual',
                deleted_at: null
            };

            if (status === 'approved') {
                manualWhere.void_status = {
                    [Op.ne]: 'approved'
                };
            }

            if (status === 'voided') {
                manualWhere.void_status = 'approved';
            }

            const kasRows = await KasBukuBesar.findAll({
                where: manualWhere,
                order: [['created_at', 'DESC']]
            });
            transactions.push(...kasRows
            .filter((item) => shouldIncludeLedgerVoidStatus(item.void_status))
            .map((item) => ({
                id: item.id,
                type: 'kas',
                type_label: item.jenis === 'masuk' ? 'Kas Masuk' : 'Kas Keluar',
                nama_pemberi: item.nama_pemberi || item.deskripsi || 'n/a',
                jumlah: Number(item.jumlah || 0),
                kategori: item.kategori || 'operasional',
                metode_pembayaran: item.metode_pembayaran || 'n/a',
                status: mapLedgerHistoryStatus(item.void_status),
                reject_reason: mapLedgerHistoryReason(item),
                bukti_transfer: item.bukti_transfer || null,
                kode_unik: null,
                total_transfer: null,
                created_at: getLedgerHistoryDate(item),
                validated_at: item.created_at
            })));
        }
    }

    if (type === 'all') {
        const voidLedgerRows = await KasBukuBesar.findAll({
            where: {
                [Op.or]: ledgerHistoryDateOr,
                source_table: {
                    [Op.ne]: 'manual'
                },
                deleted_at: null,
                void_status: {
                    [Op.in]: ['requested', 'rejected', 'approved']
                }
            },
            order: [['created_at', 'DESC']]
        });

        transactions.push(...voidLedgerRows
        .filter((item) => shouldIncludeLedgerVoidStatus(item.void_status))
        .map((item) => ({
            id: item.id,
            type: item.source_table,
            type_label: item.jenis === 'masuk' ? 'Kas Masuk' : 'Kas Keluar',
            nama_pemberi: item.nama_pemberi || item.deskripsi || 'n/a',
            jumlah: Number(item.jumlah || 0),
            kategori: item.kategori || 'operasional',
            metode_pembayaran: item.metode_pembayaran || 'n/a',
            status: mapLedgerHistoryStatus(item.void_status),
            reject_reason: mapLedgerHistoryReason(item),
            bukti_transfer: item.bukti_transfer || null,
            kode_unik: item.kode_unik || null,
            total_transfer: item.kode_unik ? Number(item.jumlah || 0) + Number(item.kode_unik || 0) : null,
            created_at: getLedgerHistoryDate(item),
            validated_at: item.updated_at
        })));
    }
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const summary = {
        total: transactions.length,
        approved: transactions.filter(t => t.status === 'approved').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        rejected: transactions.filter(t => t.status === 'rejected').length,
        voided: transactions.filter(t => t.status === 'voided').length,
        void_requested: transactions.filter(t => t.status === 'void_requested').length,
        void_rejected: transactions.filter(t => t.status === 'void_rejected').length,
        totalAmount: {
            approved: transactions
                .filter((item) => item.status === 'approved')
                .reduce((sum, item) => sum + Number(item.jumlah || 0), 0),
            rejected: transactions
                .filter((item) => item.status === 'rejected')
                .reduce((sum, item) => sum + Number(item.jumlah || 0), 0),
            pending: transactions
                .filter((item) => item.status === 'pending')
                .reduce((sum, item) => sum + Number(item.jumlah || 0), 0),
            voided: transactions
                .filter((item) => item.status === 'voided')
                .reduce((sum, item) => sum + Number(item.jumlah || 0), 0),
            void_requested: transactions
                .filter((item) => item.status === 'void_requested')
                .reduce((sum, item) => sum + Number(item.jumlah || 0), 0),
            void_rejected: transactions
                .filter((item) => item.status === 'void_rejected')
                .reduce((sum, item) => sum + Number(item.jumlah || 0), 0)
        } 

    };

    return { 
        transactions, 
        summary,
        filters: {
            period, 
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
            type,
            status
        } 
    };
};

const getKasSummary = async ({period = 'bulan-ini', startDate, endDate}) => { 
    const dateFilter = startDate && endDate ? {startDate, endDate} : getPeriodFilter(period);
    const totalSaldoRows = await getTotalByJenis({
        ...activeLedgerWhere
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
        ...activeLedgerWhere
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
    getKasTransactions,
    getKasHistory
};
