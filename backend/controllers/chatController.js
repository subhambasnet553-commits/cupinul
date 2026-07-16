const User = require("../models/User");
const Message = require("../models/Message");
const { decryptText } = require("../utils/encryption");
const { getRoomId } = require("../utils/chatRoom");

// GET /api/chat/history
exports.getHistory = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.partner) {
      return res.status(400).json({ message: "You need to pair with someone first." });
    }

    const roomId = getRoomId(req.userId, me.partner);
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(200);

    const decrypted = messages.map((m) => ({
      id: m._id,
      sender: m.sender.toString(),
      content: decryptText(m.encryptedContent, m.iv),
      createdAt: m.createdAt,
    }));

    res.status(200).json({ roomId, messages: decrypted, myId: req.userId });
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
