const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const KasBukuBesar = sequelize.define('KasBukuBesar', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal: {
        type: DataTypes.DATE,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    jenis: {
        type: DataTypes.ENUM('masuk', 'keluar'),
        allowNull: false
    },
    jumlah: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    kategori: {
        type: DataTypes.STRING,
        allowNull: false
    },
    source_table: {
        type: DataTypes.STRING,
        allowNull: true
    },
    source_id:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    kode_unik: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    metode_input: {
        type: DataTypes.ENUM('online', 'manual'),
        defaultValue: 'manual'
    },
    metode_pembayaran: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bukti_transfer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nama_pemberi: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'kas_buku_besar',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});


module.exports = KasBukuBesar;
