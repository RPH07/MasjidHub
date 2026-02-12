const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const KategoriKegiatan = sequelize.define(
  "kategori_kegiatan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_kategori: { type: DataTypes.STRING, allowNull: false },
  },
  {
    freezeTableName: true,
    tableName: "kategori_kegiatan",
    timestamps: false,
  },
);

module.exports = KategoriKegiatan;
