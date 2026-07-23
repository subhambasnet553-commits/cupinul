const User = require("../models/User");
const BucketItem = require("../models/BucketItem");

exports.createItem = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Write something first." });

    const me = await User.findById(req.userId);
    if (!me.isPremium) {
      return res.status(403).json({ message: "Unlock Bucket List with Premium to use this.", requiresPremium: true });
    }
    if (!me.partner) return res.status(400).json({ message: "You need to pair with someone first." });

    const item = await BucketItem.create({ owner: me._id, partner: me.partner, text: text.trim() });
    res.status(201).json({ item: { id: item._id, text: item.text, completed: false } });
  } catch (err) {
    console.error("createItem error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.listItems = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me.isPremium) {
      return res.status(403).json({ message: "Unlock Bucket List with Premium to use this.", requiresPremium: true });
    }
    if (!me.partner) return res.status(400).json({ message: "You need to pair with someone first." });

    const items = await BucketItem.find({
      $or: [
        { owner: me._id, partner: me.partner },
        { owner: me.partner, partner: me._id },
      ],
    }).sort({ createdAt: 1 });

    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({
      items: items.map((i) => ({ id: i._id, text: i.text, completed: i.completed })),
      total,
      completed,
      percent,
    });
  } catch (err) {
    console.error("listItems error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.toggleItem = async (req, res) => {
  try {
    const item = await BucketItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });

    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date() : null;
    await item.save();

    res.status(200).json({ completed: item.completed });
  } catch (err) {
    console.error("toggleItem error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await BucketItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found." });
    if (!item.owner.equals(req.userId)) return res.status(403).json({ message: "You can only delete items you added." });

    await BucketItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Removed." });
  } catch (err) {
    console.error("deleteItem error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};