const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

class City extends Model {}

City.init(
  {
    cityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Countries",
        key: "countryId",
      },
    },
  },
  {
    sequelize,
    modelName: "City",
    timestamps: false,
  }
);

module.exports = City;
