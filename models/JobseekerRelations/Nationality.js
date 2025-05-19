const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Nationality extends Model {}

Nationality.init(
  {
    nationalityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nationalityName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Nationality",
    timestamps: true,
  }
);

module.exports = Nationality;
