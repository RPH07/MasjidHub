const BarangPengadaan = require('../models/BarangPengadaanModels');

const toNumber = (value, defaultValue = 0) => {
    if (value === undefined || value === null) return defaultValue;

    const parsed = Number(value);
    if(Number.isNaN(parsed)) {
        const error = new Error(`Nilai nominal harus berupa angka`);
        error.status = 400;
        throw error;
    }
    return parsed;
};

const calculateProgramFunding = ({target_dana, dana_awal_kas = 0, dana_donasi = 0}) => {
    const targetDana = toNumber(target_dana);
    const danaAwalKas = toNumber(dana_awal_kas);
    const danaDonasi = toNumber(dana_donasi);

    const danaTerkumpul = danaAwalKas + danaDonasi;
    const statusPengadaan = danaTerkumpul >= targetDana ? 'terpenuhi' : 'belum_terpenuhi';

    return {
        dana_awal_kas: danaAwalKas,
        dana_donasi: danaDonasi,
        dana_terkumpul: danaTerkumpul,
        status_pengadaan: statusPengadaan
    };
};

const createBarangPengadaan = async (data) => {
    const funding = calculateProgramFunding({
        target_dana: data.target_dana,
        dana_awal_kas: data.dana_awal_kas,
        dana_donasi: 0
    });

    return BarangPengadaan.create({
        nama_barang: data.nama_barang,
        deskripsi: data.deskripsi || null,
        target_dana: toNumber(data.target_dana),
        ...funding,
        total_donatur: 0,
        status: data.status || 'draft',
        kategori_barang: data.kategori_barang,
        deadline: data.deadline || null,
        foto_barang: data.foto_barang || null
    });
};

const updateProgramPengadaan = async(id, payload) => {
    const program = await BarangPengadaan.findByPk(id);

    if (!program) {
        const error = new Error(`Barang Pengadaan dengan ID ${id} tidak ditemukan`);
        error.status = 404;
        throw error;
    }

    const targetDana = payload.target_dana !== undefined 
        ? toNumber(payload.target_dana) 
        : Number(program.target_dana);

    const danaAwalKas = payload.dana_awal_kas !== undefined
        ? toNumber(payload.dana_awal_kas)
        : Number(program.dana_awal_kas || 0);
    
    const danaDonasi = Number(program.dana_donasi || 0);

    const funding = calculateProgramFunding({
        target_dana: targetDana,
        dana_awal_kas: danaAwalKas,
        dana_donasi: danaDonasi
    });

    await program.update({
        nama_barang: payload.nama_barang ?? program.nama_barang,
        deskripsi: payload.deskripsi ?? program.deskripsi,
        target_dana: targetDana,
        ...funding,
        status: payload.status ?? program.status,
        kategori_barang: payload.kategori_barang ?? program.kategori_barang,
        deadline: payload.deadline ?? program.deadline,
        foto_barang: payload.foto_barang ?? program.foto_barang
    });

    return program;
};

module.exports = {
    updateProgramPengadaan,
    createBarangPengadaan,
    calculateProgramFunding
};