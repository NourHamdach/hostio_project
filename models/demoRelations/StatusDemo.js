// ✅ models/StatusDemo.js
const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class StatusDemo extends Model {}

StatusDemo.init(
  {
    statusId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    statusName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "StatusDemo",
    tableName: "StatusDemos", // ✅ Specify the table name
    timestamps: true, // 🚨 This disables createdAt/updatedAt
  }
);

module.exports = StatusDemo;


