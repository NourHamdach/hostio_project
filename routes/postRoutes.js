const express = require("express");
const {
  createPost,
  editPost,
  deletePost,
  getPost,
  likePost,
  unlikePost,
  createComment,
  getPostComments,
} = require("../controllers/postController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, createPost);
router.put("/:postId", verifyToken, editPost);
router.delete("/:postId", verifyToken, deletePost);
router.get("/:postId", verifyToken, getPost);

router.post("/:postId/like", verifyToken, likePost);
router.delete("/:postId/unlike", verifyToken, unlikePost);

router.post("/:postId/comment", verifyToken, createComment);
router.get("/:postId/comments", verifyToken, getPostComments);

module.exports = router;
