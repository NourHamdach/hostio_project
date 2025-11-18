// models/jobModels/MinimumSeniority.js
const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class MinimumSeniority extends Model {}

MinimumSeniority.init(
  {
    seniorityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    seniorityLevel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "MinimumSeniority",
    tableName: "MinimumSeniorities",
    timestamps: false,
  }
);

module.exports = MinimumSeniority;
