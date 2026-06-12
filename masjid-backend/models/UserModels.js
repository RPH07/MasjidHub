const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'jamaah', 'dkm'),
        defaultValue: 'jamaah'
    },
    jabatan: {
        type: DataTypes.ENUM('ketua_dkm', 'bendahara', 'sekretaris', 'anggota_dkm'),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'deletion_requested', 'inactive'),
        defaultValue: 'active'
    }
}, {
    freezeTableName: true,
    timestamps: false,
    tableName: 'users',

});

module.exports = User;
