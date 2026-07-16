const Notification = require("../models/Notification");

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.userId, read: false });
    res.status(200).json({
      notifications: notifications.map((n) => ({ id: n._id, type: n.type, text: n.text, read: n.read, createdAt: n.createdAt })),
      unreadCount,
    });
  } catch (err) {
    console.error("listNotifications error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
    res.status(200).json({ message: "Marked as read." });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};