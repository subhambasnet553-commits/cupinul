const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, getStatus } = require("../controllers/paymentController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/create-order", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyPayment);
router.get("/status", requireAuth, getStatus);

module.exports = router;