const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../../config/database/database");
const User = require("../User");
const Post = require("../Post");

class PostComment extends Model {}

PostComment.init(
  {
    commentId: {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PostComment",
    tableName: "PostComments",
    hooks: {
      beforeCreate: (comment, options) => {
        comment.createdAt = new Date();
      },
      beforeUpdate: (comment, options) => {
        comment.updatedAt = new Date();
      },
    },
    timestamps: true,
  }
);


module.exports = PostComment;
