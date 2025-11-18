const { Model, DataTypes } = require("sequelize");
const {sequelize} = require('../../../config/database/database');

class JobPreferenceContractDurations extends Model {}

JobPreferenceContractDurations.init(
  {
    jobPreferenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "JobPreferences",
        key: "jobPreferenceId"
      },
      onDelete: "CASCADE"
    },
    durationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ContractDurationPreferences",
        key: "durationId"
      },
      onDelete: "CASCADE"
    }
  },
  {
    sequelize,
    modelName: "JobPreferenceContractDurations",     // ✅ this MUST match file name
    tableName: "JobPreferenceContractDuration",     // ✅ this MUST match your migration
    timestamps: false,
  }
);

module.exports = JobPreferenceContractDurations;
