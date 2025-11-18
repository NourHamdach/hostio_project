const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database/database");

class JobSeekerSkills extends Model {}

JobSeekerSkills.init(
  {
    jobSeekerSkillId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobSeekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    skillName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "JobSeekerSkills",
    tableName: "JobSeekerSkills",
    timestamps: true,
  }
);

module.exports = JobSeekerSkills;
