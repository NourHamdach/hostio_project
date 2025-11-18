const { Model, DataTypes } = require('sequelize');
const {sequelize} = require('../../../config/database/database');

class JobPreference extends Model {}

JobPreference.init({
  jobPreferenceId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  jobSeekerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  availableFrom: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  isAvailableNow: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  getSuggestedJobEmails: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'JobPreference',
  tableName: 'JobPreferences',
  timestamps: true,
});

module.exports = JobPreference;
