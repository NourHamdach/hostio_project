const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database/database");

class CompanyLocations extends Model {}

CompanyLocations.init(
  {
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Companies",
        key: "companyId",
      },
      onDelete: "CASCADE",
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Cities",
        key: "cityId",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "CompanyLocations",
    timestamps: false,
  }
);

module.exports = CompanyLocations;
