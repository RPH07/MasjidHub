const kasManual = require('../KasManualModels');
const kasBukuBesar = require('../KasBukuBesarModels');
const sequelize = require('../../config/db');

exports.createKasManual = async(req, res) => {
    const tx = await sequelize.transaction();
    try {
        const {tanggal, keterangan, jumlah, jenis, kategori_pemasukan, nama_pemberi} = req.body;
        
        // Menyimpan data ke tabel KasManual
        const kasManual = await kasManual.create({
            tanggal, keterangan, jenis, jumlah, 
            kategori: kategori || 'operasional',
            kategori_pemasukan, nama_pemberi
        }, {transaction: tx});

        // otomatis catat ke buku besar
        await KasBukuBesar.create ({
            tanggal, deskripsi: keterangan, jenis, jumlah,
            kategori: kategori || 'operasional', source_table: 'kas_manual',
        }, {transaction: tx});

        await tx.commit();
        res.status(201).json({
            msg: "Data Kas manual berhasil ditambahkan",
            data: kasManual
        });
    } catch (error) {
        await tx.rollback();
        res.status(500).json({
            success: false,
            msg: "Gagal menambahkan data kas manual",
            error: error.message
        });
    }
};

exports.updateKasManual = async(req, res) => {
    const tx = await sequilize.transaction();
    try {
        const{id} = req.params;
        const {tanggal, keterangan, jumlah, jenis, kategori_pemasukan, nama_pemberi} = req.body;
        
        const kasManual = await kasManual.findByPk(id);
        if(!kasManual) return res.status(404).json({success: false, msg: 'Data Kas tidak ditemukan'});

        await kasManual.update({
            tanggal, keterangan, jumlah, jenis, kategori_pemasukan, nama_pemberi
        }, {
            transaction: tx
        });

        await KasBukuBesar.update({
            tanggal, deskripsi: keterangan, jenis, jumlah, kategori,
        }, {
            where: {source_table: 'kas_manual', source_id: id},
            transaction: tx
        });

        await tx.commit();
        res.status(200).json({
            success: true,
            msg: 'Data kas Manual berhasil diupdate'
        })
    } catch (error) {
        await tx.rollback();
        res.status(500).json({
            success: false,
            msg: "Gagal mengupdate data kas manual",
            error: error.message
        });
    }

}

exports.deleteKasManual = async(req, res) => {
    const tx = await sequelize.transaction();
    try {
        const{id} = req.params;
        const kasManual = await kasManual.findByPk(id);
        if(!kasManual) return res.status(404).json({success: false, msg: 'Data Kas tidak ditemukan'});

        await KasBukuBesar.destroy({
            where: {source_table: 'kas_manual', source_id: id},
            transaction: tx
        });

        await kasManual.destroy({
            transaction: tx
        });

        await tx.commit();
        res.status(200).json({
            success: true,
            msg: 'Data kas Manual berhasil dihapus'
        })
    } catch (error) {
        await tx.rollback();
        res.status(500).json({
            success: false,
            msg: "Gagal menghapus data kas manual",
            error: error.message
        });
    }
}