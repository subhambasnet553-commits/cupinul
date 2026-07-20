const express = require("express");
const router = express.Router();
const { getHistory, listConversations } = require("../controllers/chatController");
const requireAuth = require("../middleware/authMiddleware");

router.get("/conversations", requireAuth, listConversations);
router.get("/history/:userId", requireAuth, getHistory);

module.exports = router;