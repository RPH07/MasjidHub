const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const BankMasjid = sequelize.define('bank_masjid', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_bank: {
        type: DataTypes.STRING,
        allowNull: false
    },
    no_rekening: {
        type: DataTypes.STRING,
        allowNull: false
    },
    atas_nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jenis: {
        type: DataTypes.ENUM('bank', 'ewallet', 'qris'),
        deefaultValue: 'bank'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'bank_masjid'
});

module.exports = BankMasjid;