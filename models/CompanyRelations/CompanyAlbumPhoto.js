const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class CompanyAlbumPhoto extends Model {}

CompanyAlbumPhoto.init(
  {
    photoId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    albumId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "CompanyAlbums",
        key: "albumId",
      },
      onDelete: "CASCADE",
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CompanyAlbumPhoto",
    tableName: "CompanyAlbumPhotos",
    timestamps: true,
  }
);

module.exports = CompanyAlbumPhoto;
