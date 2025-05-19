const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Post extends Model {}

Post.init(
  {
    postId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // ✅ Reference table name directly
        key: "userId",
      },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Post",
    timestamps: true,
  }
);

module.exports = Post;
