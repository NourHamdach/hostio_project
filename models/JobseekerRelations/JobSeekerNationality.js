const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class JobSeekerNationality extends Model {}

JobSeekerNationality.init(
  {
    jobSeekerNationalityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobSeekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nationalityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "JobSeekerNationality",
    tableName: "JobSeekerNationalities",
    timestamps: true,
  }
);

module.exports = JobSeekerNationality;
