const express = require("express");
const router = express.Router();
const { listNotifications, markAllRead } = require("../controllers/notificationController");
const requireAuth = require("../middleware/authMiddleware");

router.get("/", requireAuth, listNotifications);
router.post("/mark-read", requireAuth, markAllRead);

module.exports = router;