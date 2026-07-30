const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./UserModels');

const ZakatDistribusi = sequelize.define('ZakatDistribusi', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    jenis_zakat: {
        type: DataTypes.ENUM('maal', 'fitrah', 'profesi'),
        allowNull: false
    },
    kategori_mustahik: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama_penerima: {
        type: DataTypes.STRING,
        allowNull: true
    },
    label_penerima_publik: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nominal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    tanggal_distribusi: {
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
    tableName: 'zakat_distribusi',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

ZakatDistribusi.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
ZakatDistribusi.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

module.exports = ZakatDistribusi;
