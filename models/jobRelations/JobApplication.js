const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

// const Job = require("../Job");
// const JobSeeker = require("../Jobseeker");

class JobApplication extends Model {}

JobApplication.init(
  {
    applicationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobseekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "JobSeekers",
        key: "jobSeekerId",
      },
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Jobs",
        key: "jobId",
      },
    },
    status: {
      type: DataTypes.ENUM("Pending", "Viewed", "Hired", "Rejected"),
      allowNull: false,
      defaultValue: "Pending",
    },
    applicationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    cvDocument: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otherDocuments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "JobApplication",
    tableName: "JobApplications",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["jobseekerId", "jobId"],
      },
    ],
  }
);

// // Associations
// JobApplication.belongsTo(Job, { foreignKey: "jobId", as: "job" });
// Job.hasMany(JobApplication, { foreignKey: "jobId", as: "applications" });

// JobApplication.belongsTo(JobSeeker, { foreignKey: "jobseekerId", as: "jobseeker" });
// JobSeeker.hasMany(JobApplication, { foreignKey: "jobseekerId", as: "applications" });

module.exports = JobApplication;
