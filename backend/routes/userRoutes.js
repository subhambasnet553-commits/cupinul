const express = require("express");
const router = express.Router();
const { getPublicProfile, toggleFollow, searchUsers } = require("../controllers/userController");
const requireAuth = require("../middleware/authMiddleware");

router.get("/search", requireAuth, searchUsers);
router.get("/:id/profile", requireAuth, getPublicProfile);
router.post("/:id/follow", requireAuth, toggleFollow);

module.exports = router;