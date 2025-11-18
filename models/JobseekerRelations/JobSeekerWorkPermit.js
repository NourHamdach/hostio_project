const { Model, DataTypes } = require('sequelize');
const {sequelize} = require('../../config/database/database');

class JobSeekerWorkPermit extends Model {}

JobSeekerWorkPermit.init(
  {
    jobSeekerWorkPermitId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobSeekerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'JobSeekerWorkPermit',
    tableName: 'JobSeekerWorkPermits',
    timestamps: true,
  }
);

module.exports = JobSeekerWorkPermit;
