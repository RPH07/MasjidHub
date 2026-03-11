const {dataTypes} = require('sequelize');
const sequelize = require('../config/db');

const KasManual = sequelize.define('KasManual', {
    id: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tangal: {
        type: dataTypes.DATE,
        allowNull: false
    },
    ketearangan: {
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
        defaultValue: 'operasional'
    },
    kategori_pemasukan: {
        type: dataTypes.STRING,
        allowNull: true
    },
    nama_pemberi: {
        type: dataTypes.STRING,
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
    updatedAt: 'updated_at'
});

module.exports = KasManual;