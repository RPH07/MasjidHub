const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const KasManual = sequelize.define('KasManual', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal: {
        type: DataTypes.DATE,
        allowNull: false
    },
    keterangan: {
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
        defaultValue: 'operasional'
    },
    kategori_pemasukan: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nama_pemberi: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'voided'),
        defaultValue: 'approved'
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
    },
    reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'kas_manual',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = KasManual;
