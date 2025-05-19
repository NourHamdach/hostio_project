const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class JobExternalLink extends Model {}

JobExternalLink.init(
  {
    linkId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "JobExternalLink",
    timestamps: true,
  }
);

module.exports = JobExternalLink;
