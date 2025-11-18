const { Model, DataTypes } = require("sequelize");
const {sequelize} = require('../../../config/database/database');

class JobPreferenceContractType extends Model {}

JobPreferenceContractType.init(
  {
    jobPreferenceId: {
      type: DataTypes.INTEGER,
      references: { model: "JobPreferences", key: "jobPreferenceId" },
    },
    contractTypeId: {
      type: DataTypes.INTEGER,
      references: { model: "ContractTypes", key: "contractTypeId" },
    },
  },
  {
    sequelize,
    modelName: "JobPreferenceContractTypes",
    tableName: "JobPreferenceContractType", // ✅ ADD THIS
    timestamps: false,
  }
);

module.exports = JobPreferenceContractType;
