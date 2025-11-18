const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class SavedJob extends Model {}

SavedJob.init(
  {
    savedJobId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobSeekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "JobSeekers",
        key: "jobSeekerId",
      },
      onDelete: "CASCADE",
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Jobs",
        key: "jobId",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "SavedJob",
    tableName: "SavedJobs",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["jobSeekerId", "jobId"], // ✅ Prevent duplicates
      },
    ],
  }
);

module.exports = SavedJob;
