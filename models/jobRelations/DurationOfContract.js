// models/jobModels/ContractDuration.js
const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class ContractDuration extends Model {}

ContractDuration.init(
  {
    durationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    durationType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ContractDuration",
    tableName: "ContractDurations",
    timestamps: false,
  }
);

module.exports = ContractDuration;
