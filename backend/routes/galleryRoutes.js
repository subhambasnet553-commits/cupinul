const express = require("express");
const router = express.Router();
const { uploadPhoto, listPhotos, deletePhoto } = require("../controllers/galleryController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/photos", requireAuth, uploadPhoto);
router.get("/photos", requireAuth, listPhotos);
router.delete("/photos/:id", requireAuth, deletePhoto);

module.exports = router;
