const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class JobseekerExperience extends Model {}

JobseekerExperience.init(
  {
    workId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobseekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "JobseekerExperience",
    tableName: "JobseekerExperience",
    timestamps: true,
  }
);

module.exports = JobseekerExperience;
