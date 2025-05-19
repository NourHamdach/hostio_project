const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

class Country extends Model {}

Country.init(
  {
    countryId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    countryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Country",
    timestamps: false,
  }
);

module.exports = Country;
