// const Post = require("./Post");
// const PostLike = require("./PostLike");
// const PostComment = require("./PostComment");
// const User = require("./User");

// // ✅ Post belongs to a user
// Post.belongsTo(User, { foreignKey: "userId", as: "user" });
// User.hasMany(Post, { foreignKey: "userId", as: "posts" });

// // ✅ Post can have multiple likes
// Post.hasMany(PostLike, { foreignKey: "postId", as: "postLikes" });
// PostLike.belongsTo(Post, { foreignKey: "postId", as: "post" });

// // ✅ A user can like multiple posts
// User.hasMany(PostLike, { foreignKey: "userId", as: "postLikes" });
// PostLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// // ✅ Post can have multiple comments
// Post.hasMany(PostComment, { foreignKey: "postId", as: "postComments" });
// PostComment.belongsTo(Post, { foreignKey: "postId", as: "post" });

// // ✅ A user can comment on multiple posts
// User.hasMany(PostComment, { foreignKey: "userId", as: "postComments" });
// PostComment.belongsTo(User, { foreignKey: "userId", as: "user" });

// module.exports = {
//   Post,
//   PostLike,
//   PostComment,
//   User
// };
