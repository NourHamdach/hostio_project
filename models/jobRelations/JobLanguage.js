const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Job = require("../Job");

class JobLanguage extends Model {}

JobLanguage.init(
  {
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Job,
        key: "jobId",
      },
      onDelete: "CASCADE",
    },
    languageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "JobLanguage",
    timestamps: true,
  }
);

module.exports = JobLanguage;
