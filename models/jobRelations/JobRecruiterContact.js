const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class JobRecruiterContact extends Model {}

JobRecruiterContact.init(
  {
    jobRecruiterContactId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Jobs",
        key: "jobId",
      },
      onDelete: "CASCADE",
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    modelName: "JobRecruiterContacts",
    tableName: "JobRecruiterContacts",
    timestamps: false,
  }
);

module.exports = JobRecruiterContact;
