const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

class Skills extends Model {}

Skills.init(
  {
    skillsId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    skillsName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Skills",
    timestamps: false, 
  }
);

module.exports = Skills;
