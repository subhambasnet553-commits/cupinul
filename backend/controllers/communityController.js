const Post = require("../models/Post");
const Comment = require("../models/Comment");

function formatAuthor(user) {
  return { id: user._id, firstName: user.firstName, profilePicture: user.profilePicture };
}

exports.createPost = async (req, res) => {
  try {
    const { content, imageData } = req.body;
    if ((!content || !content.trim()) && !imageData) return res.status(400).json({ message: "Write something or add a photo first." });

    const post = await Post.create({ author: req.userId, content: (content || "").trim(), imageData: imageData || "" });
    await post.populate("author", "firstName profilePicture");

    res.status(201).json({ post: { id: post._id, content: post.content, imageData: post.imageData, createdAt: post.createdAt, author: formatAuthor(post.author), likesCount: 0, likedByMe: false, commentsCount: 0 } });
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.listPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50).populate("author", "firstName profilePicture");
    const commentCounts = await Comment.aggregate([{ $group: { _id: "$post", count: { $sum: 1 } } }]);
    const countMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));

    res.status(200).json({
      posts: posts.map((p) => ({
        id: p._id,
        content: p.content,
        imageData: p.imageData,
        createdAt: p.createdAt,
        author: formatAuthor(p.author),
        likesCount: p.likes.length,
        likedByMe: p.likes.some((id) => id.equals(req.userId)),
        commentsCount: countMap.get(p._id.toString()) || 0,
      })),
    });
  } catch (err) {
    console.error("listPosts error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const alreadyLiked = post.likes.some((id) => id.equals(req.userId));
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(req.userId));
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    res.status(200).json({ likesCount: post.likes.length, likedByMe: !alreadyLiked });
  } catch (err) {
    console.error("toggleLike error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!post.author.equals(req.userId)) return res.status(403).json({ message: "You can only delete your own posts." });

    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted." });
  } catch (err) {
    console.error("deletePost error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 }).populate("author", "firstName profilePicture");
    res.status(200).json({
      comments: comments.map((c) => ({ id: c._id, content: c.content, createdAt: c.createdAt, author: formatAuthor(c.author) })),
    });
  } catch (err) {
    console.error("listComments error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Write a comment first." });

    const comment = await Comment.create({ post: req.params.id, author: req.userId, content: content.trim() });
    await comment.populate("author", "firstName profilePicture");

    res.status(201).json({ comment: { id: comment._id, content: comment.content, createdAt: comment.createdAt, author: formatAuthor(comment.author) } });
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found." });
    if (!comment.author.equals(req.userId)) return res.status(403).json({ message: "You can only delete your own comments." });

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Comment deleted." });
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
exports.checkUnread = async (req, res) => {
  try {
    const User = require("../models/User");
    const me = await User.findById(req.userId);
    const latestPost = await Post.findOne().sort({ createdAt: -1 });

    const hasNew = latestPost && (!me.lastCommunityVisit || latestPost.createdAt > me.lastCommunityVisit);
    res.status(200).json({ hasNew: !!hasNew });
  } catch (err) {
    res.status(500).json({ hasNew: false });
  }
};

exports.markVisited = async (req, res) => {
  try {
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.userId, { lastCommunityVisit: new Date() });
    res.status(200).json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ message: "error" });
  }
};