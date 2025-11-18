const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class JobSeekerLanguage extends Model {}

JobSeekerLanguage.init(
  {
    jobSeekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "JobSeekers",
        key: "jobSeekerId",
      },
      onDelete: "CASCADE",
    },
    languageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Languages",
        key: "languageId",
      },
      onDelete: "CASCADE",
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    modelName: "JobSeekerLanguage",
    tableName: "JobSeekerLanguages",
    timestamps: false,
  }
);

module.exports = JobSeekerLanguage;

