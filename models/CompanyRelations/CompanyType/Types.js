const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database/database"); 

class Type extends Model {}

Type.init(
  {
    typeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    typeName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Type",
    tableName: "Types",
    timestamps: false,
  }
);


module.exports = Type;
