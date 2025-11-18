// const User = require("./User");
// const Post = require("./Post");
// const PostLike = require("./postRelations/PostLike");
// const PostComment = require("./postRelations/PostComment"); 
// const City=require("./CompanyRelations/CompanyLocations/City")
// const Country=require("./CompanyRelations/CompanyLocations/Country")

// // ✅ A user can have multiple posts
// User.hasMany(Post, { foreignKey: "userId", as: "posts" });
// Post.belongsTo(User, { foreignKey: "userId", as: "user" });

// // ✅ A user can like multiple posts
// User.hasMany(PostLike, { foreignKey: "userId", as: "postLikes" });
// PostLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// // ✅ A user can comment on multiple posts
// User.hasMany(PostComment, { foreignKey: "userId", as: "postComments" });
// PostComment.belongsTo(User, { foreignKey: "userId", as: "user" });

// module.exports = {
//   User,
//   Post,
//   PostLike,
//   PostComment,
// };
