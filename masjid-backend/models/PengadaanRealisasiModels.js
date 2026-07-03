const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const BarangPengadaan = require('./BarangPengadaanModels');
const User = require('./UserModels');

const PengadaanRealisasi = sequelize.define('PengadaanRealisasi', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    barang_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    penerima_vendor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nominal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    tanggal_realisasi: {
        type: DataTypes.DATE,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    bukti_foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'approved', 'rejected'),
        defaultValue: 'draft'
    },
    reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ledger_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejected_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rejected_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'pengadaan_realisasi',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

PengadaanRealisasi.belongsTo(BarangPengadaan, { foreignKey: 'barang_id', as: 'program' });
BarangPengadaan.hasMany(PengadaanRealisasi, { foreignKey: 'barang_id', as: 'realisasi' });
PengadaanRealisasi.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
PengadaanRealisasi.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

module.exports = PengadaanRealisasi;
