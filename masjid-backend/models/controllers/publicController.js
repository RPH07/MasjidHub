const {Op} = require("sequelize");
const User = require("../UserModels");
const Kegiatan = require("../KegiatanModels");
const KasBukuBesar = require("../KasBukuBesarModels");
const DonasiPengadaan = require("../DonasiPengadaanModels");

const getPublicData = async(req, res) => {
    try {
        const totalJamaah = await User.count({
            where: {
                role: "jamaah",
                status: "active"
            },
        });

        const totalKegiatan = await Kegiatan.count();
        const totalZakat = await KasBukuBesar.sum('jumlah', {
            where: {
                jenis: "masuk",
                source_table: "zakat",
                deleted_at: null,
                void_status: {
                    [Op.ne]: "approved",
                },
            },
        });

        const totalDonasi = await DonasiPengadaan.sum("nominal", {
            where: {
                status: "approved",
                deleted_at: null,
            },
        });

        res.json({
            data: {
                totalJamaah: totalJamaah || 0,
                totalKegiatan: totalKegiatan || 0,
                totalZakat: totalZakat || 0,
                totalDonasi: totalDonasi || 0,
            },
        });
    } catch (error) {
        console.error("Gagal mengambil data publik:", error);
        res.status(500).json({message: 'terjadi kesalahan saat mengambil data publik'});
    }
};

module.exports ={
    getPublicData,
}