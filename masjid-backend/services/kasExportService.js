const ExcelJS = require('exceljs');
const kasReportService = require('./kasReportService');
const { formatRupiahCompact, formatRupiahNumber } = require('../utils/currencyFormatter');

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    });
};

const getExportFileName = ({period = 'bulan-ini', format = 'csv' } = {}) => {
    const now = new Date();
    const dateStamp = now.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '-');

    const extension = format === 'excel' ? 'xlsx' : 'csv';

    return `laporan-kas-${period}-${dateStamp}.${extension}`;
};

const mapTransactionForExport = (trx) => ({
    Tanggal: formatDate(trx.created_at),
    Jenis: trx.type_label || trx.type || '-',
    'Nama/Donatur': trx.nama_pemberi || 'Hamba Allah',
    'Program/Kategori': trx.program_donasi || trx.kategori || '-',
    Metode: trx.metode_pembayaran || '-',
    Jumlah: formatRupiahNumber(trx.jumlah),
    'Kode Unik': trx.kode_unik ? `+${trx.kode_unik}` : '-',
    Status: trx.status || '-',
    Keterangan: trx.status === 'voided'
        ? (trx.reject_reason || trx.void_reason || 'Transaksi dibatalkan melalui proses void')
        : (trx.reject_reason || trx.keterangan || '-'),
    'Bukti Transfer': trx.bukti_transfer ? 'Ada' : 'Tidak Ada'
});

// csv export
const generateExportCsv = async (query = {}) => {
    const history = await kasReportService.getKasHistory(query);
    const rows = history.transactions.map(mapTransactionForExport);
    const { summary, filters } = history;

    const headers = [    
        'Tanggal',
        'Jenis',
        'Nama/Donatur',
        'Program/Kategori',
        'Metode',
        'Jumlah',
        'Kode Unik',
        'Status',
        'Keterangan',
        'Bukti Transfer'
    ];

    const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;

    const summaryLines = [
        ['Laporan Riwayat Transaksi Kas Masjid'],
        [`Periode: ${filters.startDate} - ${filters.endDate}`],
        [],
        ['Ringkasan'],
        ['Total Transaksi', summary.total],
        ['Approved', summary.approved, 'Total Approved', formatRupiahNumber(summary.totalAmount.approved)],
        ['Pending', summary.pending, 'Total Pending', formatRupiahNumber(summary.totalAmount.pending)],
        ['Rejected', summary.rejected, 'Total Rejected', formatRupiahNumber(summary.totalAmount.rejected)],
        ['Voided', summary.voided || 0, 'Total Voided', formatRupiahNumber(summary.totalAmount.voided)],
        []
    ];

    const csvLines = [
        ...summaryLines.map(line => line.map(escapeCsv).join(',')),
        headers.join(','),
        ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(','))
    ];

    return {
        fileName: getExportFileName({period: query.period, format: 'csv'}),
        contentType: 'text/csv; charset=utf-8',
        buffer: Buffer.from('\uFEFF' + csvLines.join('\n'), 'utf-8')
    };
};
// excel export
// helper styling
const styleCell = (cell, opts = {}) => {
    if(opts.bold !== undefined || opts.color || opts.size) {
        cell.font = {
            bold: opts.bold ?? false,
            color: opts.color ? { argb: opts.color } : undefined,
            size: opts.size ?? 11,
            name: 'Calibri'
        };
    }
    if (opts.fill) {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: opts.fill }
        };
    }
    if (opts.align || opts.wrapText) {
        cell.alignment = {
            vertical: 'middle',
            horizontal: opts.align || 'left',
            wrapText: opts.wrapText || false
        };
    }

    if (opts.border) {
        const side = {style: 'thin', color:{arb: 'FFB0BEC6'}};
        cell.border = {
            top: side,
            left: side,
            bottom: side,
            right: side
        }
    }
};

const STATUS_STYLE = {
    approved: { fill: 'FFC8E6C9', color: 'FF256029', },
    pending: { fill: 'FFFFF9C4', color: 'FF827717' },
    rejected: { fill: 'FFFFCDD2', color: 'FFB71C1C' },
    voided: { fill: 'FFEADCF8', color: 'FF5E35B1' }
};

const generateExportExcel = async (query = {}) => {
    const history = await kasReportService.getKasHistory(query);
    const rows = history.transactions.map(mapTransactionForExport);
    const {summary, filters} = history;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'DKM Masjid Nurul Ilmi Telaga Bestari';
    wb.created = new Date();

    const ws = wb.addWorksheet('Ringkasan Transaksi', {
        pageSetup: {paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1},
        views: [{state: 'frozen', ySplit: 12}]
    });

    // columns
    ws.columns = [
        { key: 'A', width: 18 },  // Tanggal
        { key: 'B', width: 20 },  // Jenis
        { key: 'C', width: 26 },  // Nama/Donatur
        { key: 'D', width: 24 },  // Program/Kategori
        { key: 'E', width: 18 },  // Metode
        { key: 'F', width: 18 },  // Jumlah
        { key: 'G', width: 12 },  // Kode Unik
        { key: 'H', width: 14 },  // Status
        { key: 'I', width: 30 },  // Keterangan
        { key: 'J', width: 16 },  // Bukti Transfer
    ];

    // header
    ws.mergeCells('A1:J1');
    const titleCell = ws.getCell('A1');
    titleCell.value = 'Laporan Riwayat Tranaksi Kas Masjid';
    ws.getRow(1).height = 28;
    styleCell(titleCell, {
        bold: true,
        size: 14,
        color: 'FFFFFFFF',
        fill: 'FF1F497D',
        align: 'center'
    });

    // Periode
    ws.mergeCells('A3:J3');
    const periodeCell = ws.getCell('A3');
    periodeCell.value = `Periode: ${filters.startDate} | ${filters.endDate}`;
    ws.getRow(3).height = 20;
    styleCell(periodeCell, {
        bold: false,
        size: 11,
        color: 'FF1F497D',
        align: 'center'
    });

    // Separator
    ws.getRow(4).height = 5;

    // summary
    ws.mergeCells('A5:J5');
    const summaryHeaderCell = ws.getCell('A5');
    summaryHeaderCell.value = 'Ringkasan';
    ws.getRow(5).height = 20;
    styleCell(summaryHeaderCell, {
        bold: true,
        size: 12,
        color: 'FFFFFFFF',
        fill: 'FF1F497D',
        align: 'center'
    });

    const summaryRows = [
        ['Total Transaksi', summary.total, null, null],
        ['Approved', summary.approved, 'Total Approved', formatRupiahCompact(summary.totalAmount.approved)],
        ['Pending', summary.pending, 'Total Pending', formatRupiahCompact(summary.totalAmount.pending)],
        ['Rejected', summary.rejected, 'Total Rejected', formatRupiahCompact(summary.totalAmount.rejected)],
        ['Voided', summary.voided || 0, 'Total Voided', formatRupiahCompact(summary.totalAmount.voided)]
    ];

    const SUM_VAL_COLOR = {
        Approved: 'FF375623',
        Pending: 'FF827717',
        Rejected: 'FFB71C1C',
        Voided: 'FF5E35B1'
    };

    let rowIdx = 6;
    for (const [labelL, valL, labelR, valR] of summaryRows ) {
        ws.getRow(rowIdx).height = 20;

        ws.mergeCells(`A${rowIdx}:B${rowIdx}`);
        const lbl = ws.getCell(`A${rowIdx}`);
        lbl.value = labelL;
        styleCell(lbl, {
            fill: 'FFF2F2F2',
            color: 'FF555555',
            size: 11,
            border: true
        });

        ws.mergeCells(`C${rowIdx}:E${rowIdx}`);
        const val = ws.getCell(`C${rowIdx}`);
        val.value = valL;
        styleCell(val, {
            fill: 'FFFFFFFF',
            color: SUM_VAL_COLOR[labelL] ?? 'FF1F1F1F',
            border: true,
            size: 11,
            align: 'center'
        });

        if (labelR) {
            ws.mergeCells(`F${rowIdx}:J${rowIdx}`);
            const val2 = ws.getCell(`F${rowIdx}`);
            val2.value = valR;
            styleCell(val2, {
                fill: 'FFFFFFFF',
                color: SUM_VAL_COLOR[labelR.replace('Total ', '')] ?? 'FF1F1F1F',
                size: 11,
                border: true,
                align: 'center'
            })
        } else {
            ws.mergeCells(`F${rowIdx}:J${rowIdx}`);
        }

        rowIdx++;
    }

    // spacer
    ws.getRow(rowIdx).height = 6;
    rowIdx++;

    // label detail tx
    ws.mergeCells(`A${rowIdx}:J${rowIdx}`);
    const detailHeaderCell = ws.getCell(`A${rowIdx}`);
    detailHeaderCell.value = 'Detail Transaksi';
    ws.getRow(rowIdx).height = 22;
    styleCell(detailHeaderCell, {
        bold: true,
        size: 12,
        color: 'FFFFFFFF',
        fill: 'FF1F497D',
        align: 'center'
    });
    rowIdx++;

    // header kolom tabel
    const headers = [
        'Tanggal', 'Jenis', 'Nama/Donatur', 'Program/Kategori',
        'Metode', 'Jumlah', 'Kode Unik', 'Status', 'Keterangan',
        'Bukti Transfer'
    ];

    const headerRow = ws.getRow(rowIdx);
    headerRow.height = 22;
    headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        styleCell(cell, {
            bold: true,
            size: 11,
            color: 'FFFFFFFF',
            fill: 'FF4473C4',
            align: 'center',
            border: true
        });
    });
    rowIdx++

    // Rows data    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const dataRows = ws.getRow(rowIdx);
        dataRows.height = 16;

        const isEven = i % 2 === 0;
        const baseFill = isEven ? 'FFFFFFFF' : 'FFDCE6F1';

        const values = [
            row['Tanggal'], row['Jenis'], row['Nama/Donatur'], 
            row['Program/Kategori'], row['Metode'], row['Jumlah'],
            row['Kode Unik'], row['Status'], row['Keterangan'], row['Bukti Transfer']
        ];
        
        values.forEach((val, ci) => {
            const cell = dataRows.getCell(ci + 1);
            cell.value = val;

            const isStatusCol = ci === 7;
            const isJumlahCol = ci === 5;

            const statusKey = String(val).toLowerCase();
            const statusStyle = isStatusCol && STATUS_STYLE[statusKey];

            styleCell(cell, {
                fill: statusStyle ? statusStyle.fill : baseFill,
                color: statusStyle ? statusStyle.color : 'FF1F1F1F',
                bold: isStatusCol,
                size: 11,
                border: true,
                align: isJumlahCol ? 'right' : isStatusCol ? 'center' : 'left'
            });

            if (isJumlahCol && typeof val === 'number') {
                cell.value = val;
                cell.numFmt  = '"Rp "#,##0';
            }
        });

        rowIdx++;
    }

    // auto filter di header
    ws.autoFilter = {
        from: {row: rowIdx - rows.length -1, column: 1},
        to: {row: rowIdx - 1, column: 10}
    };

    const buffer = await wb.xlsx.writeBuffer();

    return {
        fileName: getExportFileName({period: query.period, format: 'excel'}),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer
    };
};

const generateKasHistoryExport = async (query = {}) => {
    if (query.format === 'excel') {
        return generateExportExcel(query);
    }
    return generateExportCsv(query);
};

module.exports = {
    generateKasHistoryExport
}

