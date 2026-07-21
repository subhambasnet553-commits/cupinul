const express = require("express");
const router = express.Router();
const { createItem, listItems, toggleItem, deleteItem } = require("../controllers/bucketController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/items", requireAuth, createItem);
router.get("/items", requireAuth, listItems);
router.put("/items/:id/toggle", requireAuth, toggleItem);
router.delete("/items/:id", requireAuth, deleteItem);

module.exports = router;