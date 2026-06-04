const XLSX = require('xlsx');
const kasReportService = require('./kasReportService');
const { format } = require('sequelize/lib/utils');

const formatRupiahNumber = (value) => Number(value || 0);

const formatDate = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    });
};

const getExportFilName = ({period = 'bulan-ini', format = 'csv' } = {}) => {
    const now = new Date();
    const dateStamp = now.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }.replace(/\//g, '-'));

    const extension = format === 'excel' ? 'xlsx' : 'csv';

    return `laporan-kas-${period}-${dateStamp}.${extension}`;
};

const mapTransactionForExport = (trx) => ({
    Tanggal: formatDate(trx.created_at),
    Jenis: trx.type_label || trx.type || '-',
    'Nama/Donatur': trx.nama_pemberi || 'Hamba Allah',
    'Program/Kategori': tx.program_donasi || trx.kategori || '-',
    Metode: trx.metode_pembayaran || '-',
    Jumlah: formatRupiahNumber(trx.jumlah),
    'Kode Unik': trx.kode_unik ? `+${trx.kode_unik}` : '-',
    Status: trx.status || '-',
    Keterangan: trx.reject_reason || trx.keterangan || '-',
    'Bukti Transfer': trx.bukti_transfer ? 'Ada' : 'Tidak Ada'
});

const generateExportCsv = async (query = {}) => {
    const history = await kasReportService.getKasReport(query);
    const rows = history.map(mapTransactionForExport);

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

    const csvLines = [
        headers.join(','),
        ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(','))
    ];

    return {
        fileName: getExportFileName({period: query.period, format: 'csv'}),
        contentType: 'text/csv; charset=utf-8',
        buffer: Buffer.from('\uFEFF' + csvLines.join('\n'), 'utf-8')
    };
};

const generateExportExcel = async (query = {}) => {
    // todo: create excel file
    
}






