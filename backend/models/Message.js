const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Deterministic room id shared by exactly one couple: their two user IDs, sorted and joined.
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    encryptedContent: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
