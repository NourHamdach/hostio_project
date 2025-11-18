const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../config/database/database");

class Job extends Model {}

Job.init(
  {
    jobId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberOfPositions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    durationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ContractDurations",
        key: "durationId",
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    latestStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payRange: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    generalRequirements: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hospitalityExperienceRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    restrictToSameDepartmentExperience: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    minimumSeniorityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "MinimumSeniorities",
        key: "seniorityId",
      },
    },
    accommodation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    otherBenefits: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applicationMethod: {
      type: DataTypes.ENUM("on hostio", "external url"),
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "StatusJobs",
        key: "statusId",
      },
    },
    availability: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Job",
    tableName: "Jobs",
    timestamps: true,
  }
);

module.exports = Job;
