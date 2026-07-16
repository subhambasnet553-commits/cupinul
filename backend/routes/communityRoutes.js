const express = require("express");
const router = express.Router();
const {
  createPost, listPosts, toggleLike, deletePost, listComments, addComment, deleteComment,
} = require("../controllers/communityController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/posts", requireAuth, createPost);
router.get("/posts", requireAuth, listPosts);
router.post("/posts/:id/like", requireAuth, toggleLike);
router.delete("/posts/:id", requireAuth, deletePost);
router.get("/posts/:id/comments", requireAuth, listComments);
router.post("/posts/:id/comments", requireAuth, addComment);
router.delete("/comments/:id", requireAuth, deleteComment);

module.exports = router;