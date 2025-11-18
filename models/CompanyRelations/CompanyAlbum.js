const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class CompanyAlbum extends Model {}

CompanyAlbum.init(
  {
    albumId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Companies",
        key: "companyId",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CompanyAlbum",
    tableName: "CompanyAlbums",
    timestamps: true,
  }
);

module.exports = CompanyAlbum;
