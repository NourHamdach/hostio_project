const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");
const User = require("../User");
const Post = require("../Post");

class PostLike extends Model {}

PostLike.init(
  {
    likeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userId",
      },
      onDelete: "CASCADE",
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "postId",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "PostLike",
    tableName: "PostLikes",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "postId"], // ✅ Ensure one like per user per post
      },
    ],
  }
);


module.exports = PostLike;
