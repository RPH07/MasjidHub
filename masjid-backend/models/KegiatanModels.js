const { DataTypes } = require('sequelize');
const sequellize = require('../config/db');
const KategoriKegiatan = require('./KategoriModels')

const Kegiatan = sequellize.define('Kegiatan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    judul: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lokasi: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tanggal: {
        type: DataTypes.DATE,
        allowNull: false
    },
    jam: {
        type: DataTypes.TIME,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    kategori_id: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: KategoriKegiatan,
            key: 'id'
        } 
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true,
    tableName: 'kegiatan',
    timestamps: false
});

KategoriKegiatan.hasMany(Kegiatan, { foreignKey: 'kategori_id' });
Kegiatan.belongsTo(KategoriKegiatan, { foreignKey: 'kategori_id', as: 'kategori' });

module.exports = Kegiatan;