const { DataTypes } = require('sequelize');
const sequelize = require('./../config/db');

const BarangPengadaan = sequelize.define('BarangPengadaan', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_barang:{
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    target_dana: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    dana_terkumpul: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    total_donatur: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status_pengadaan: {
        type: DataTypes.ENUM('belum_terpenuhi', 'terpenuhi'),
        defaultValue: 'belum_terpenuhi'
    },
    foto_barang: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'aktif', 'selesai'),
        defaultValue: 'draft'
    },
    kategori_barang: {
        type: DataTypes.ENUM(
            'furniture',
            'elektronik',
            'konstruksi',
            'peralatan',
            'renovasi',
            'pembangunan',
            'lainnya'
        ),
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    tanggal_Selesai: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dana_awal_kas: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    dana_donasi: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    }
}, {
    tableName: 'barang_pengadaan',
    timestamps: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BarangPengadaan;