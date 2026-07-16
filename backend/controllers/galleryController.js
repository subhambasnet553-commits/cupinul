const User = require("../models/User");
const GalleryPhoto = require("../models/GalleryPhoto");

// POST /api/gallery/photos  { imageData, eventName, date }
exports.uploadPhoto = async (req, res) => {
  try {
    const { imageData, eventName, date } = req.body;
    if (!imageData || !eventName || !date) {
      return res.status(400).json({ message: "Photo, title, and date are all required." });
    }

    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You need to pair with someone first." });
    }

    const photo = await GalleryPhoto.create({
      owner: me._id,
      partner: me.partner,
      imageData,
      eventName: eventName.trim(),
      date,
    });
    const Notification = require("../models/Notification");
    await Notification.create({
      user: me.partner,
      type: "gallery",
      text: `${me.firstName} added a new photo to your gallery`,
    });

    res.status(201).json({ message: "Added to your gallery.", photo: { id: photo._id } });
  } catch (err) {
    console.error("uploadPhoto error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/gallery/photos
exports.listPhotos = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You need to pair with someone first." });
    }

    const photos = await GalleryPhoto.find({
      $or: [
        { owner: me._id, partner: me.partner },
        { owner: me.partner, partner: me._id },
      ],
    }).sort({ date: -1 });

    res.status(200).json({
      photos: photos.map((p) => ({
        id: p._id,
        imageData: p.imageData,
        eventName: p.eventName,
        date: p.date,
        addedByMe: p.owner.equals(me._id),
      })),
    });
  } catch (err) {
    console.error("listPhotos error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// DELETE /api/gallery/photos/:id
exports.deletePhoto = async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found." });

    if (!photo.owner.equals(req.userId)) {
      return res.status(403).json({ message: "You can only delete photos you added." });
    }

    await GalleryPhoto.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Photo deleted." });
  } catch (err) {
    console.error("deletePhoto error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
