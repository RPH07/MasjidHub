const { DataTypes } = require('sequelize');
const sequelize = require('./../config/db');
const user = require('./UserModels');
const BarangPengadaan = require('./BarangPengadaanModels');

const DonasiPengadaan = sequelize.define('DonasiPengadaan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    barang_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nama_donatur: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nominal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    nominal_asli: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    metode_pembayaran: {
        type: DataTypes.ENUM('transfer_bank', 'qris', 'tunai', 'cash'),
        allowNull: false
    },
    bukti_transfer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'voided'),
        defaultValue: 'pending'
    },
    reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    validated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    validated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    kontak_donatur: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    catatan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    kode_unik: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_transfer: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }
}, {
    tableName: 'donasi_pengadaan',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

DonasiPengadaan.belongsTo(BarangPengadaan, {
    foreignKey: 'barang_id',
    as: 'barang'
});

BarangPengadaan.hasMany(DonasiPengadaan, {
    foreignKey: 'barang_id',
    as: 'donasi'
});

DonasiPengadaan.belongsTo(user, {
    foreignKey: 'user_id',
    as: 'user'
});


module.exports = DonasiPengadaan;
