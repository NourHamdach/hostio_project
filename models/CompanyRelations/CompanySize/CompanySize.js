const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database/database");

class CompanySize extends Model {}

CompanySize.init(
  {
    sizeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sizeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CompanySize",
    tableName: "CompanySizes",
    timestamps: false,
  }
);

module.exports = CompanySize;
