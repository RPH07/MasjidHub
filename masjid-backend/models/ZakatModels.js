const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');
const User = require('./UserModels');

const Zakat = sequelize.define('Zakat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    no_telepon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jumlah_jiwa: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_harta: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    },
    gaji_kotor: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    jenis_zakat: {
        type: DataTypes.ENUM('maal', 'fitrah', 'profesi'),
        allowNull: false
    },
    metode_pembayaran: {
        type: DataTypes.STRING,
        defaultValue: 'transfer_bank'
    },
    kode_unik: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    total_bayar: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    nominal_asli: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
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
        type: DataTypes.STRING,
        allowNull: true
    },
    validated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    validated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true,
    tableName: 'zakat',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

Zakat.belongsTo(User, {foreignKey: 'user_id', as: 'user'});

module.exports = Zakat;
