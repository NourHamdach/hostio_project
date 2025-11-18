'use strict';
const { Model, DataTypes } = require('sequelize');
const {sequelize} = require('../../config/database/database');

class CompanyKeyFact extends Model {}

CompanyKeyFact.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'CompanyKeyFact',
  tableName: 'CompanyKeyFacts',
});

module.exports = CompanyKeyFact;
