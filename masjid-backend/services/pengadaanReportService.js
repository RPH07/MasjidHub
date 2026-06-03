const {jsPDF} = require('jspdf');
const BarangPengadaan = require('../models/BarangPengadaanModels');
const DonasiPengadaan = require('../models/DonasiPengadaanModels');

const formatRupiah = (value) => `Rp ${(value || 0).toLocaleString('id-ID')}`;

const formatDate = (date) => {
    if(!value) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const getProgramReportData = async(programId) => {
    const program = await BarangPengadaan.findByPk(programId);
    if (!program) {
        const error = new Error('Program pengadaan tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }
    

    const donation = await DonasiPengadaan.findAll({
        where: {
            barang_id: programId,
            status: 'approved',
            deleted_at: null
        },
        order: [['created_at', 'DESC']]
    });

    return {
        program,
        donation
    };
};


const generatePengadaanReport = async(programId) => {
    const {program, donation} = await getProgramReportData(programId);

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;


    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Laporan Program Pengadaan', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    const programName = program.nama_barang || 'Program Pengadaan';

    doc.setFontSize(12);
    doc.setTextColor(0, 100, 0);
    doc.text(programName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    doc.setDrawColor(20, 200, 200);
    doc.setFillColor(240, 250, 252);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 60, 3, 3, 'FD');
    currentY += 10;

    const leftCol = margin + 5;
    const rightCol = pageWidth / 2 + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal Mulai:', leftCol, currentY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(program.tanggal_mulai), leftCol, currentY + 28);

    doc.setFont('helvetica', 'bold');
    doc.text('Kategori:', leftCol, currentY + 42);
    doc.setFont('helvetica', 'normal');
    doc.text(program.kategori_barang || 'Lainnya', leftCol, currentY + 48);

    doc.setFont('helvetica', 'bold');
    doc.text('Target Dana:', rightCol, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 53, 69);
    doc.text(formatRupiah(program.target_dana), rightCol, currentY + 8);

    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal Selesai:', rightCol, currentY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(program.tanggal_selesai || program.tanggal_selesai), rightCol, currentY + 28);

    doc.setFont('helvetica', 'bold');
    doc.text('Dana Terkumpul:', rightCol, currentY + 42);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(25, 135, 84);
    doc.text(formatRupiah(program.dana_terkumpul), rightCol, currentY + 48);

    currentY += 75;

    doc.setTextColor(60, 60, 60);
    doc.setDrawColor(25, 135, 84);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 25, 3, 3, 'FD');

    currentY += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan:', margin + 10, currentY);

    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const targetDana = Number(program.target_dana || 0);
    const danaTerkumpul = Number(program.dana_terkumpul || 0);
    const percentage = targetDana > 0 ? ((danaTerkumpul / targetDana) * 100).toFixed(1) : '0.0';

    const summaryText = `Total ${donations.length} donatur telah mengumpulkan ${percentage}% dari target ${formatRupiah(danaTerkumpul)} dari ${formatRupiah(targetDana)}`;
    doc.text(doc.splitTextToSize(summaryText, pageWidth - margin * 2 - 20), margin + 10, currentY);

    currentY += 20;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`Daftar Donatur (${donations.length}) orang`, margin, currentY);
    currentY += 10;

    if (donation.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120, 120, 120);
        doc.text('Belum ada donasi untuk program ini', margin, currentY);
        currentY += 20;
    } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(25, 135, 84);
        doc.rect(margin, currentY, pageWidth - margin * 2, 10, 'F');

        doc.text('No', margin + 2, currentY + 7);
        doc.text('Nama Donatur', margin + 15, currentY + 7);
        doc.text('Nominal',  margin + 70, currentY + 5);
        doc.text('Kode Unik', margin + 105, currentY + 5);
        doc.text('Metode', margin + 130, currentY + 5);
        doc.text('Tanggal', margin + 160, currentY + 5);

        currentY += 18;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        donations.forEach((donation, index) => {
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }

            if (index % 2 == 0) {
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, currentY, pageWidth - margin * 2, 10, 'F');
            }

            doc.text(String(index + 1), margin + 2, currentY + 4);
            doc.text((donation.nama_donatur || 'Hamba Allah').substring(0, 20), margin + 15, currentY + 7);
            doc.text(formatRupiah(donation.nominal), margin + 70, currentY + 7);
            doc.text(donation.kode_unik ? `+${donation.kode_unik}` : '-', margin + 105, currentY + 7);
            doc.text((donation.metode || 'Tidak Diketahui').substring(0, 20).toUpperCase(), margin + 130, currentY + 7);
            doc.text(formatDate(donation.created_at), margin + 160, currentY + 4);

            currentY += 18;
        });
    }

    const footerY = Math.min(currentY + 20, 285);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text(`Laporan digenerate pada: ${formatDate(new Date())}`, margin, footerY);
    doc.text('MasjidHub - Solusi Digital untuk Masjid', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Halaman ${doc.internal.getCurrentPageInfo().pageNumber} dari ${doc.internal.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

    const pdfBuffer = doc.output('arraybuffer');

    return {
        filename: `Laporan-donasi-${programName.replace(/\s+/g, '-')} - ${Date.now()}.pdf`,
        buffer: Buffer.from(pdfBuffer)
    };
};

module.exports = {
    generatePengadaanReport
}






