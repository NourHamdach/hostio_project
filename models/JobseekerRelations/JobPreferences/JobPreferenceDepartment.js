const { Model, DataTypes } = require("sequelize");
const sequelize = require('../../../config/database');

class JobPreferenceDepartment extends Model {}

JobPreferenceDepartment.init(
  {
    jobPreferenceId: {
      type: DataTypes.INTEGER,
      references: { model: "JobPreferences", key: "jobPreferenceId" },
    },
    departmentId: {
      type: DataTypes.INTEGER,
      references: { model: "Departments", key: "departmentId" },
    },
  },
  {
    sequelize,
    modelName: "JobPreferenceDepartments",
    tableName: "JobPreferenceDepartment", // ✅ ADD THIS
    timestamps: false,
  }
);

module.exports = JobPreferenceDepartment;
