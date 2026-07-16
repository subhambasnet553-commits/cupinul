const { getMyCode, pairWithCode, setStartDate } = require("../controllers/pairController");
const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");

router.get("/my-code", requireAuth, getMyCode);
router.post("/connect", requireAuth, pairWithCode);
router.put("/start-date", requireAuth, setStartDate);
module.exports = router;
