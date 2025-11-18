const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");

class StatusJob extends Model {}

StatusJob.init(
  {
    statusId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    statusName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "StatusJob",
    tableName: "StatusJobs", // explicitly define the table name
    timestamps: false,
  }
);

module.exports = StatusJob;
