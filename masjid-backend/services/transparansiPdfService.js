const { jsPDF } = require('jspdf');
const transparansiService = require('./transparansiService');

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    });
};

const safeFileName = (value) => String(value || 'laporan')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

const addFooter = (doc, margin) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const footerY = 285;
    doc.setDrawColor(210, 210, 210);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text(`Digenerate: ${formatDate(new Date())}`, margin, footerY);
    doc.text('MasjidHub - Transparansi Dana Umat', pageWidth - margin, footerY, { align: 'right' });
};

const ensureSpace = (doc, currentY, margin, needed = 18) => {
    if (currentY + needed <= 275) return currentY;
    addFooter(doc, margin);
    doc.addPage();
    return margin;
};

const drawSummaryBox = (doc, title, rows, currentY, margin) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setDrawColor(25, 135, 84);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 12 + rows.length * 8, 3, 3, 'FD');
    currentY += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(title, margin + 8, currentY);
    currentY += 8;
    doc.setFontSize(9);

    rows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(label, margin + 8, currentY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(String(value), pageWidth - margin - 8, currentY, { align: 'right' });
        currentY += 8;
    });

    return currentY + 8;
};

const generateZakatTransparencyPdf = async () => {
    const { summary, distributions } = await transparansiService.getZakatTransparency({ status: 'approved' });
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = margin;

    doc.setFontSize(17);
    doc.setTextColor(30, 30, 30);
    doc.text('Laporan Transparansi Zakat', pageWidth / 2, currentY, { align: 'center' });
    currentY += 12;

    currentY = drawSummaryBox(doc, 'Ringkasan Amanah Zakat', [
        ['Total Zakat Terkumpul', formatRupiah(summary.totalTerkumpul)],
        ['Total Tersalurkan', formatRupiah(summary.totalTersalurkan)],
        ['Sisa Amanah', formatRupiah(summary.sisaAmanah)]
    ], currentY, margin);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Breakdown Per Jenis Zakat', margin, currentY);
    currentY += 8;
    doc.setFontSize(9);
    ['fitrah', 'maal', 'profesi'].forEach((jenis) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${jenis.toUpperCase()} terkumpul`, margin, currentY);
        doc.text(formatRupiah(summary.collectedByJenis[jenis]), pageWidth / 2 - 5, currentY, { align: 'right' });
        doc.text('tersalurkan', pageWidth / 2 + 5, currentY);
        doc.text(formatRupiah(summary.distributedByJenis[jenis]), pageWidth - margin, currentY, { align: 'right' });
        currentY += 7;
    });

    currentY += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Daftar Penyaluran Approved (${distributions.length})`, margin, currentY);
    currentY += 8;

    doc.setFontSize(8.5);
    distributions.forEach((item, index) => {
        currentY = ensureSpace(doc, currentY, margin, 20);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${item.label_penerima_publik}`, margin, currentY);
        doc.text(formatRupiah(item.nominal), pageWidth - margin, currentY, { align: 'right' });
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`${formatDate(item.tanggal_distribusi)} | ${item.jenis_zakat} | ${item.kategori_mustahik}`, margin, currentY);
        currentY += 5;
        const lines = doc.splitTextToSize(item.deskripsi || '-', pageWidth - margin * 2);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 4 + 5;
        doc.setTextColor(30, 30, 30);
    });

    addFooter(doc, margin);
    return {
        fileName: `laporan-transparansi-zakat-${Date.now()}.pdf`,
        buffer: Buffer.from(doc.output('arraybuffer'))
    };
};

const generateProgramTransparencyPdf = async (programId) => {
    const { program, summary, realisasi } = await transparansiService.getProgramTransparency(programId, { status: 'approved' });
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = margin;

    doc.setFontSize(17);
    doc.setTextColor(30, 30, 30);
    doc.text('Laporan Transparansi Program', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
    doc.setFontSize(11);
    doc.setTextColor(25, 135, 84);
    doc.text(String(program.nama_barang || 'Program Pengadaan').toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 12;

    currentY = drawSummaryBox(doc, 'Ringkasan Realisasi Program', [
        ['Target Dana', formatRupiah(summary.targetDana)],
        ['Dana Terkumpul', formatRupiah(summary.danaTerkumpul)],
        ['Dana Direalisasikan', formatRupiah(summary.totalRealisasi)],
        ['Sisa Dana Program', formatRupiah(summary.sisaDana)]
    ], currentY, margin);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`Daftar Realisasi Approved (${realisasi.length})`, margin, currentY);
    currentY += 8;

    doc.setFontSize(8.5);
    realisasi.forEach((item, index) => {
        currentY = ensureSpace(doc, currentY, margin, 20);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${item.penerima_vendor}`, margin, currentY);
        doc.text(formatRupiah(item.nominal), pageWidth - margin, currentY, { align: 'right' });
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(formatDate(item.tanggal_realisasi), margin, currentY);
        currentY += 5;
        const lines = doc.splitTextToSize(item.deskripsi || '-', pageWidth - margin * 2);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 4 + 5;
        doc.setTextColor(30, 30, 30);
    });

    addFooter(doc, margin);
    return {
        fileName: `laporan-transparansi-${safeFileName(program.nama_barang)}-${Date.now()}.pdf`,
        buffer: Buffer.from(doc.output('arraybuffer'))
    };
};

module.exports = {
    generateZakatTransparencyPdf,
    generateProgramTransparencyPdf
};
