const {jsPDF} = require('jspdf');
const { Op } = require('sequelize');
const KasReportService = require('./kasReportService');
const KasBukuBesar = require('../models/KasBukuBesarModels');
const User = require('../models/UserModels');

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const formatDate = (value) => {
    if(!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
    }) + ' WIB';
};

const formatDateOnly = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    });
};


const getPeriodLabel = ({period, startDate, endDate}) => {
    const currentYear = new Date().getFullYear();

    const labels = {
        'hari-ini': 'Hari Ini',
        'kemarin': 'Kemarin',
        'minggu-ini': 'Minggu Ini',
        'minggu-lalu': 'Minggu Lalu',
        'bulan-ini': 'Bulan Ini',
        'bulan-lalu': 'Bulan Lalu',
        'tahun-ini': `Tahun ${new Date().getFullYear()}`,
        'tahun-lalu': `Tahun ${new Date().getFullYear() - 1}`
    };

    if (period && labels[period]) {
        return labels[period];
    }

    if (startDate && endDate) {
        const displayEndDate = new Date(endDate);
        displayEndDate.setDate(displayEndDate.getDate() - 1); // kurangi 1 hari untuk tampilan

        return `${formatDateOnly(startDate)} - ${formatDateOnly(displayEndDate)}`;
    }

    return labels[period] || 'Bulan Ini';
};

const drawKeyValue = (doc, label, value, x, y, valueColor = [60, 60, 60]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(label, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...valueColor);
    doc.text(value, x, y + 6);
};

const trimTextToWidth = (doc, value, maxWidth) => {
    let text = String(value || '-');

    while (text.length > 0 && doc.getTextWidth(text) > maxWidth) {
        text = text.slice(0, -1);
    }

    return text || '-';
};

const ensureSpace = (doc, currentY, margin, neededHeight = 18) => {
    if (currentY + neededHeight <= 275) return currentY;

    doc.addPage();
    return margin;
};

const getVoidedTransactions = async (dateFilter) => {
    return KasBukuBesar.findAll({
        where: {
            tanggal: {
                [Op.gte]: dateFilter.startDate,
                [Op.lt]: dateFilter.endDate
            },
            deleted_at: null,
            void_status: 'approved'
        },
        order: [
            ['voided_at', 'DESC'],
            ['updated_at', 'DESC']
        ],
        limit: 200
    });
};

const buildUserMap = async (transactions) => {
    const userIds = [
        ...new Set(
            transactions
                .flatMap((trx) => [
                    trx.void_requested_by,
                    trx.void_approved_ketua_by,
                    trx.void_approved_bendahara_by
                ])
                .filter(Boolean)
        )
    ];

    if (userIds.length === 0) return new Map();

    const users = await User.findAll({
        where: {
            id: userIds
        },
        attributes: ['id', 'nama', 'jabatan'],
        raw: true
    });

    return new Map(users.map((user) => [user.id, user]));
};

const formatUserName = (userId, userMap) => {
    if (!userId) return '-';

    const user = userMap.get(userId);
    if (!user) return '-';

    return user.nama || '-';
};

const generateKasReport = async(query = {}) => {
    const summary = await KasReportService.getKasSummary(query);
    const transactionsResult = await KasReportService.getKasTransactions({
        ...query,
        jenis: 'all',
        source: 'all',
        page: 1,
        limit: 500
    });
    
    const transactions = transactionsResult.transactions || [];
    const voidedTransactions = await getVoidedTransactions(summary.dateFilter);
    const voidUserMap = await buildUserMap(voidedTransactions);
    const periodLabel = getPeriodLabel({
        period: query.period,
        startDate: summary.dateFilter?.startDate,
        endDate: summary.dateFilter?.endDate
    });

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Header pdf
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Laporan Arus Kas Masjid', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Periode: ${periodLabel}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 18;

    // Summary
    doc.setDrawColor(20, 200, 200);
    doc.setFillColor(240, 250, 252);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 55, 3, 3, 'FD');
    currentY += 10;

    const leftCol = margin + 8;
    const rightCol = pageWidth / 2 + 8;

    drawKeyValue(doc, 'Total pemasukan', formatRupiah(summary.totalPemasukan), leftCol, currentY, [25, 135, 84]);
    drawKeyValue(doc, 'Total pengeluaran', formatRupiah(summary.totalPengeluaran), rightCol, currentY, [220, 53, 69]);

    currentY += 22;

    drawKeyValue(doc, 'Saldo Bersih Periode', formatRupiah(summary.saldoBersih), leftCol, currentY, [37, 99, 234]);

    currentY += 35;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Breakdown Pemasukan', margin, currentY);
    doc.text('Breakdown Pengeluaran', pageWidth / 2 + 5, currentY);
    currentY += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const pemasukanEntries = Object.entries(summary.pemasukanKategori || {});
    const pengeluaranEntries = Object.entries(summary.pengeluaranKategori || {});

    const maxEntries = Math.max(pemasukanEntries.length, pengeluaranEntries.length, 1);

    for (let i = 0; i < maxEntries; i++) {
        const masuk = pemasukanEntries[i];
        const keluar = pengeluaranEntries[i];

        doc.setTextColor(60, 60, 60);
        if (masuk) {
            doc.text(`${masuk[0]}: ${formatRupiah(masuk[1])}`, margin, currentY);
        }
        if (keluar) {
            doc.text(`${keluar[0]}: ${formatRupiah(keluar[1])}`, pageWidth / 2 + 5, currentY);
        } else {
            doc.text('Tidak ada pengeluaran', pageWidth / 2 + 5, currentY);
        }
        currentY += 6;
    }

    currentY += 10;

    doc.setDrawColor(200, 200, 200);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`Daftar transaksi ${transactions.length}`, margin, currentY);
    currentY += 10;

    const contentWidth = pageWidth - margin * 2;
    const cols = [
    {key: 'tanggal',  label: 'Tanggal',  x: margin,       w: 28},
    {key: 'jenis',    label: 'Jenis',    x: margin + 28,  w: 20},
    {key: 'kategori', label: 'Kategori', x: margin + 48,  w: 32},
    {key: 'deskripsi',label: 'Deskripsi',x: margin + 80,  w: 55},
    {key: 'jumlah',   label: 'Jumlah',   x: margin + 135, w: 35},
];

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(25, 135, 84);
    doc.rect(margin, currentY, contentWidth, 8, 'F');

    cols.forEach((col) => doc.text(col.label, col.x + 2, currentY + 6));
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    transactions.forEach((trx, index) => {
        currentY = ensureSpace(doc, currentY, margin, 10);

        if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, currentY, contentWidth, 8, 'F');
        }

        const row = {
            tanggal: formatDateOnly(trx.tanggal || trx.created_at),
            jenis: trx.jenis || '-',
            kategori: trx.kategori || '-',
            deskripsi: trx.deskripsi || trx.nama_pemberi || '-',
            jumlah: formatRupiah(trx.jumlah)
        };

        cols.forEach((col) => {
            const text = trimTextToWidth(doc, row[col.key], col.w - 6);
            doc.text(text, col.x + 1, currentY + 5);
        });
        currentY += 8;
    });

    currentY += 12;
    currentY = ensureSpace(doc, currentY, margin, 24);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`Catatan transaksi void (${voidedTransactions.length})`, margin, currentY);
    currentY += 8;

    if (voidedTransactions.length === 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 120, 120);
        doc.text('Tidak ada transaksi yang dibatalkan pada periode ini.', margin, currentY);
        currentY += 8;
    } else {
        const voidCols = [
            { key: 'tanggal', label: 'Tanggal', x: margin, w: 22 },
            { key: 'deskripsi', label: 'Deskripsi', x: margin + 22, w: 42 },
            { key: 'jumlah', label: 'Jumlah', x: margin + 64, w: 25 },
            { key: 'requested_by', label: 'Request', x: margin + 89, w: 24 },
            { key: 'ketua_by', label: 'Ketua', x: margin + 113, w: 22 },
            { key: 'bendahara_by', label: 'Bendahara', x: margin + 135, w: 27 },
            { key: 'alasan', label: 'Alasan', x: margin + 162, w: 18 }
        ];

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(180, 70, 70);
        doc.rect(margin, currentY, contentWidth, 8, 'F');
        voidCols.forEach((col) => doc.text(col.label, col.x + 1, currentY + 5.5));
        currentY += 8;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(70, 70, 70);

        voidedTransactions.forEach((trx, index) => {
            currentY = ensureSpace(doc, currentY, margin, 10);

            if (index % 2 === 0) {
                doc.setFillColor(250, 238, 238);
                doc.rect(margin, currentY, contentWidth, 8, 'F');
            }

            const row = {
                tanggal: formatDateOnly(trx.tanggal),
                jenis: trx.jenis || '-',
                deskripsi: trx.deskripsi || '-',
                jumlah: formatRupiah(trx.jumlah),
                requested_by: formatUserName(trx.void_requested_by, voidUserMap),
                ketua_by: formatUserName(trx.void_approved_ketua_by, voidUserMap),
                bendahara_by: formatUserName(trx.void_approved_bendahara_by, voidUserMap),
                alasan: trx.void_reason || '-'
            };

            voidCols.forEach((col) => {
                const text = trimTextToWidth(doc, row[col.key], col.w - 4);
                doc.text(text, col.x + 1, currentY + 5);
            });

            currentY += 8;
        });

        currentY += 6;
        currentY = ensureSpace(doc, currentY, margin, 18);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const note = 'Catatan: transaksi void tetap ditampilkan sebagai audit, tetapi tidak dihitung dalam total pemasukan, pengeluaran, atau saldo aktif.';
        doc.text(doc.splitTextToSize(note, contentWidth), margin, currentY);
        currentY += 12;
    }

    const footerY = Math.min(currentY + 20, 275);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Laporan ini dihasilkan pada ${formatDateOnly(new Date())}`, margin, footerY);
    doc.text(`Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${doc.internal.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });
    doc.text(`© 2025 - ${new Date().getFullYear()} MasjidHub - Solusi Digital untuk Masjid`, pageWidth / 2, footerY + 10, { align: 'center' });

    const pdfBuffer = doc.output('arraybuffer');
    const now = new Date();
const options = { timeZone: 'Asia/Jakarta' };

const dateStamp = now.toLocaleDateString('id-ID', {
    ...options,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
}).replace(/[/.]/g, '-');

const timeStamp = now.toLocaleTimeString('id-ID', {
    ...options,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
}).replace(/[.:]/g, '-');

const cleanPeriod = periodLabel
    .replace(/\s*-\s*/g, '_')
    .replace(/\s+/g, '-');

return {
    fileName: `Laporan-Arus-Kas_${cleanPeriod}_${dateStamp}_${timeStamp}.pdf`,
    buffer: Buffer.from(pdfBuffer)
};
}

module.exports = {
    generateKasReport
};
