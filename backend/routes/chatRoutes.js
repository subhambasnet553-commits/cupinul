const express = require("express");
const router = express.Router();
const { getHistory } = require("../controllers/chatController");
const requireAuth = require("../middleware/authMiddleware");

router.get("/history", requireAuth, getHistory);

module.exports = router;
