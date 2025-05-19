const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class JobDepartment extends Model {}

JobDepartment.init(
  {
    jobId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Jobs",
        key: "jobId",
      },
      onDelete: "CASCADE",
    },
    departmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Departments",
        key: "departmentId",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "JobDepartment",
    timestamps: false,
  }
);

module.exports = JobDepartment;
