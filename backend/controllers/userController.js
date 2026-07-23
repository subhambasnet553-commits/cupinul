const User = require("../models/User");
const Follow = require("../models/Follow");

exports.getPublicProfile = async (req, res) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(targetId).populate("partner", "firstName");
    if (!user) return res.status(404).json({ message: "User not found." });

    const followersCount = await Follow.countDocuments({ following: targetId });
    const isFollowedByMe = !!(await Follow.findOne({ follower: req.userId, following: targetId }));

    const isPremium = !!(user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date());
    const daysSinceJoined = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      profilePicture: user.profilePicture,
      partnerName: user.partner ? user.partner.firstName : null,
      relationshipStartDate: user.relationshipStartDate,
      pairedAt: user.pairedAt,
      followersCount,
      isFollowedByMe,
      isMe: targetId === req.userId,
      isPremium,
      isNew: daysSinceJoined <= 7,
    });
  } catch (err) {
    console.error("getPublicProfile error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.userId) return res.status(400).json({ message: "You can't follow yourself." });

    const existing = await Follow.findOne({ follower: req.userId, following: targetId });
    if (existing) {
      await Follow.findByIdAndDelete(existing._id);
    } else {
      await Follow.create({ follower: req.userId, following: targetId });
    }

    const followersCount = await Follow.countDocuments({ following: targetId });
    res.status(200).json({ following: !existing, followersCount });
  } catch (err) {
    console.error("toggleFollow error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json({ users: [] });

    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [{ firstName: { $regex: q, $options: "i" } }, { lastName: { $regex: q, $options: "i" } }],
    })
      .limit(20)
      .select("firstName lastName profilePicture");

    res.status(200).json({ users });
  } catch (err) {
    console.error("searchUsers error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};