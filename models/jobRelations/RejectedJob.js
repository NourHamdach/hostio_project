// models/RejectedJob.js
const { Model, DataTypes } = require('sequelize');
const {sequelize} = require('../../config/database/database');

class RejectedJob extends Model {}

RejectedJob.init({
  rejectedJobId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'RejectedJob',
  tableName: 'RejectedJobs',
  timestamps: true
});

module.exports = RejectedJob;
