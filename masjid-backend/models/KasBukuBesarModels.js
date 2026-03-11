const {dataTypes} = require('sequelize');
const sequelize = require('../config/db');

const KasBukuBesar = sequelize.define('KasBukuBesar', {
    id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tangal: {
        type: dataTypes.DATE,
        allowNull: false
    },
    deskripsi: {
        type: dataTypes.TEXT,
        allowNull: false
    },
    jenis: {
        type: dataTypes.ENUM('masuk', 'keluar'),
        allowNull: false
    },
    jumlah: {
        type: dataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    kategori: {
        type: dataTypes.STRING,
        allowNull: false
    },
    source_tabel: {
        type: dataTypes.STRING,
        allowNull: true
    },
    source_id:{
        type: dataTypes.INTEGER,
        allowNull: true
    },
    kode_unik: {
        type: dataTypes.INTEGER,
        allowNull: true
    },
    deleted_at: {
        type: dataTypes.DATE,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});


module.exports = KasBukuBesar;