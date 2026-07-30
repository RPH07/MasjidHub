const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./UserModels');

const ZakatSetting = sequelize.define('ZakatSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tahun: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sumber: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'BAZNAS RI'
    },
    source_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fitrah_uang: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fitrah_beras_kg: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 2.5
    },
    fitrah_beras_liter: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 3.5
    },
    nisab_maal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    nisab_penghasilan_bulanan: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    nisab_penghasilan_tahunan: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    kadar_zakat: {
        type: DataTypes.DECIMAL(6, 5),
        allowNull: false,
        defaultValue: 0.025
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true,
    tableName: 'zakat_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
});

ZakatSetting.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
ZakatSetting.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

module.exports = ZakatSetting;
