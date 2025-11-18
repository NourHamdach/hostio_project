const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database/database");

class JobseekerEducation extends Model {}

JobseekerEducation.init(
  {
    jobseekerEducationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobseekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    schoolName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "JobseekerEducation",
    tableName: "JobseekerEducations",
    timestamps: true,
  }
);

module.exports = JobseekerEducation;
