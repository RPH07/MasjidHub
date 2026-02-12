const KategoriKegiatan = require('../KategoriModels');

// Ambil semua kategori buat ditampilin di dropdown Frontend
exports.getKategori = async (req, res) => {
    try {
        const response = await KategoriKegiatan.findAll();
        res.json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

// Admin/DKM bisa nambah kategori baru kalau belum ada di list
exports.createKategori = async (req, res) => {
    const { nama_kategori } = req.body;
    try {
        await KategoriKegiatan.create({
            nama_kategori: nama_kategori
        });
        res.status(201).json({ msg: "Kategori Berhasil Dibuat" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}