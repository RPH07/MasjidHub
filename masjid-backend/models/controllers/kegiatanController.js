const KategoriKegiatan = require('../KategoriModels');
const Kegiatan = require('../KegiatanModels');
const User = require('../UserModels');

// get all kegaiatan untuk public
exports.getKegiatan = async(req, res) => {
    try {
        const response = await Kegiatan.findAll({
            include: [{
                model: KategoriKegiatan,
                as: 'kategori',
                attributes: ['nama_kategori']
            }],
            order: [['tanggal', 'DESC']]
        });
        res.json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

// create kegaiatan khusus admin/dkm
exports.createKegiatan = async(req, res) => {
    console.log("File yang diterima:", req.file);
    console.log("Body yang diterima:", req.body);
    // cari apakah kegiaan ada gambar atau tidak
    if(!req.file) return res.status(400).json({msg: 'Harap upload gambar kegiatan!', debug_body: req.body});
    

    const {judul, deskripsi, tanggal, lokasi, jam, kategori_id} = req.body;
    const imgUrl = req.file.path;

    try {
        await Kegiatan.create({
            judul: judul,
            kategori_id: kategori_id,
            deskripsi: deskripsi,
            lokasi: lokasi,
            tanggal: tanggal,
            jam: jam,
            image_url: imgUrl,
            user_id: req.userId
        });
        res.status(201).json({msg: 'Kegiatan berhasil Ditambahkan.'});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
    
}

// delete kegiatan khsusu aadmin/dkm
exports.deleteKegiatan = async(req, res) => {
    const kegiatan = await Kegiatan.findOne({
        where: {
            id: req.params.id
        }
    });
    if(!kegiatan) return res.status(404).json({msg: 'Kegiatan tidak ditemukan!'});

    try {
        // todo: hapus gambar dari cdn/storage

        // hapus kegiatan dari database
        await Kegiatan.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({msg: 'Kegiatan berhasil dihapus.'});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}