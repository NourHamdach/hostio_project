const { Post, PostLike, PostComment, User } = require("../models");
const { Op } = require("sequelize");

exports.createPost = async (req, res) => {
    try {
      const { userId } = req.user;
      const { content, imageUrl } = req.body;
  
      if (!content && !imageUrl) {
        return res.status(400).json({ message: "Content or image is required" });
      }
  
      const post = await Post.create({
        userId,
        content,
        imageUrl,
      });
  
      res.status(201).json({
        message: "Post created successfully",
        post,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post", error });
    }
  };
  exports.editPost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { content, imageUrl } = req.body;
      const { userId } = req.user;
  
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      if (post.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to edit this post" });
      }
  
      await post.update({
        content,
        imageUrl,
      });
  
      res.status(200).json({
        message: "Post updated successfully",
        post,
      });
    } catch (error) {
      console.error("Error editing post:", error);
      res.status(500).json({ message: "Failed to edit post", error });
    }
  };
  exports.deletePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;
  
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      if (post.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this post" });
      }
  
      await post.destroy();
  
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post", error });
    }
  };
  const { Post, PostLike, PostComment, User } = require("../models");

  exports.getPost = async (req, res) => {
    try {
      const { postId } = req.params;
  
      // ✅ Fetch post with COUNT of likes and comments (optimized with JOIN)
      const post = await Post.findByPk(postId, {
        include: [
          {
            model: PostLike,
            as: "postLikes",
            attributes: [],
          },
          {
            model: PostComment,
            as: "postComments",
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [
              // ✅ Count likes
              PostLike.sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "PostLikes" 
                WHERE "PostLikes"."postId" = "Post"."postId"
              )`),
              "likesCount",
            ],
            [
              // ✅ Count comments
              PostComment.sequelize.literal(`(
                SELECT COUNT(*) 
                FROM "PostComments" 
                WHERE "PostComments"."postId" = "Post"."postId"
              )`),
              "commentsCount",
            ],
          ],
        },
      });
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // ✅ Structure response for React.js
      const response = {
        postId: post.postId,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        user: post.userId,
        likesCount: post.getDataValue("likesCount"),
        commentsCount: post.getDataValue("commentsCount"),
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post details", error });
    }
  };
  exports.getPostLikes = async (req, res) => {
    try {
      const { postId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
  
      const likes = await PostLike.findAll({
        where: { postId },
        include: {
          model: User,
          attributes: ["userId", "username"],
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
  
      res.status(200).json(likes);
    } catch (error) {
      console.error("Error fetching post likes:", error);
      res.status(500).json({ message: "Failed to fetch likes", error });
    }
  };
  exports.getPostComments = async (req, res) => {
    try {
      const { postId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
  
      const comments = await PostComment.findAll({
        where: { postId },
        include: {
          model: User,
          attributes: ["userId", "username"],
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]], // ✅ Newest comments first
      });
  
      res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching post comments:", error);
      res.status(500).json({ message: "Failed to fetch comments", error });
    }
  };
  exports.likePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;
  
      const existingLike = await PostLike.findOne({ where: { postId, userId } });
  
      if (existingLike) {
        return res.status(400).json({ message: "You already liked this post" });
      }
  
      await PostLike.create({ postId, userId });
  
      res.status(201).json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post", error });
    }
  };
  exports.unlikePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;
  
      const like = await PostLike.findOne({ where: { postId, userId } });
      if (!like) {
        return res.status(404).json({ message: "Like not found" });
      }
  
      await like.destroy();
  
      res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post", error });
    }
  };
  exports.createComment = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;
      const { content } = req.body;
  
      if (!content) {
        return res.status(400).json({ message: "Comment cannot be empty" });
      }
  
      const comment = await PostComment.create({
        postId,
        userId,
        content,
      });
  
      res.status(201).json({
        message: "Comment added successfully",
        comment,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment", error });
    }
  };
      