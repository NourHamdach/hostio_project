require("dotenv").config();
const { Sequelize } = require("sequelize");

// Initialize Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Username
  process.env.DB_PASS, // Password
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres", // Use 'mysql', 'sqlite', etc., if needed
    logging: false, // Disable SQL query logging
  }
);

const User = require("./User");
const Post = require("./Post");
const PostLike = require("./postRelations/PostLike");
const PostComment = require("./postRelations/PostComment");
const Company = require("./Company");



// ✅ Define Associations AFTER initializing models
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(PostLike, { foreignKey: "userId", as: "postLikes" });
PostLike.belongsTo(User, { foreignKey: "userId", as: "user" });

Post.hasMany(PostLike, { foreignKey: "postId", as: "postLikes" });
PostLike.belongsTo(Post, { foreignKey: "postId", as: "post" });

User.hasMany(PostComment, { foreignKey: "userId", as: "postComments" });
PostComment.belongsTo(User, { foreignKey: "userId", as: "user" });

Post.hasMany(PostComment, { foreignKey: "postId", as: "postComments" });
PostComment.belongsTo(Post, { foreignKey: "postId", as: "post" });

module.exports = {
  sequelize,
  User,
  Post,
  PostLike,
  PostComment,
  Company,
};

