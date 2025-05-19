const { Model, DataTypes } = require("sequelize");
const sequelize = require('../../../config/database');

class JobPreferenceLocation extends Model {}

JobPreferenceLocation.init(
  {
    jobPreferenceId: {
      type: DataTypes.INTEGER,
      references: { model: "JobPreferences", key: "jobPreferenceId" },
    },
    countryId: {
      type: DataTypes.INTEGER,
      references: { model: "Countries", key: "countryId" },
    },
    cityId: {
      type: DataTypes.INTEGER,
      references: { model: "Cities", key: "cityId" },
    },
  },
  {
    sequelize,
    modelName: "JobPreferenceLocations",
    tableName: "JobPreferenceLocation", // ✅ ADD THIS
    timestamps: false,
  }
);

module.exports = JobPreferenceLocation;
