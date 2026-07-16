const mongoose = require("mongoose");

const galleryPhotoSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageData: {
      type: String, // base64 data URL — same simple approach as profile pictures
      required: true,
    },
    eventName: {
      type: String,
      required: [true, "Give this photo a title"],
      maxlength: 100,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryPhoto", galleryPhotoSchema);
