const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../config/database/database");


class Languages extends Model {}

Languages.init(
  {
    languageId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    languageName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Languages",
    timestamps: false,
  }
);

module.exports = Languages;
