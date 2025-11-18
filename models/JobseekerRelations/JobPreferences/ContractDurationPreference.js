const { Model, DataTypes } = require('sequelize');
const {sequelize} = require('../../../config/database/database');

class ContractDurationPreference extends Model {}

ContractDurationPreference.init({
  durationId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'ContractDurationPreferences',
  tableName: 'ContractDurationPreferences',
  timestamps: true,
});

module.exports = ContractDurationPreference;
