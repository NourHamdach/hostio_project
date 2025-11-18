const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../config/database/database");
const User = require("./User");

class JobSeeker extends Model {}

JobSeeker.init(
  {
    jobSeekerId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "userId",
      },
      onDelete: "CASCADE",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },},
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resume: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    professionalHeadline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    hasDrivingLicense: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    aboutMe: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isLookingForJob: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indicates if the job seeker is actively looking for a job",
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
      defaultValue: 'other',
    },
    
  },
  {
    sequelize,
    modelName: "JobSeeker",
    tableName: "JobSeekers", // ✅ Prevent {sequelize} from pluralizing automatically
    timestamps: true,
  }
);

module.exports = JobSeeker;
