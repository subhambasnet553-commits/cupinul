const User = require("../models/User");
const Message = require("../models/Message");
const { decryptText } = require("../utils/encryption");
const { getRoomId } = require("../utils/chatRoom");

// GET /api/chat/history/:userId
exports.getHistory = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const roomId = getRoomId(req.userId, otherUserId);
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(200);

    const otherUser = await User.findById(otherUserId).select("firstName profilePicture");

    const decrypted = messages.map((m) => ({
      id: m._id,
      sender: m.sender.toString(),
      content: decryptText(m.encryptedContent, m.iv),
      createdAt: m.createdAt,
    }));

    res.status(200).json({ roomId, messages: decrypted, myId: req.userId, otherUser });
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// GET /api/chat/conversations
exports.listConversations = async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ sender: req.userId }, { recipient: req.userId }] })
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("sender", "firstName profilePicture")
      .populate("recipient", "firstName profilePicture");

    const seen = new Map();
    for (const m of messages) {
      if (!m.sender || !m.recipient) continue;
      const other = m.sender._id.equals(req.userId) ? m.recipient : m.sender;
      const key = other._id.toString();
      if (!seen.has(key)) {
        seen.set(key, {
          userId: key,
          firstName: other.firstName,
          profilePicture: other.profilePicture,
          lastMessage: decryptText(m.encryptedContent, m.iv),
          lastMessageAt: m.createdAt,
        });
      }
    }

    res.status(200).json({ conversations: Array.from(seen.values()) });
  } catch (err) {
    console.error("listConversations error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
