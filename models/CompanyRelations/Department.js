const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");


class Department extends Model {}

Department.init(
  {
    departmentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    departmentName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Department",
    timestamps: false,
  }
);

module.exports = Department;
