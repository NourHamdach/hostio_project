const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class ContractType extends Model {}

ContractType.init(
  {
    contractTypeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "ContractType",
    tableName: "ContractTypes",
    timestamps: false,
  }
);

module.exports = ContractType;
