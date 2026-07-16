require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");
const { encryptText } = require("./utils/encryption");
const { getRoomId } = require("./utils/chatRoom");

const authRoutes = require("./routes/authRoutes");
const pairRoutes = require("./routes/pairRoutes");
const diaryRoutes = require("./routes/diaryRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const profileRoutes = require("./routes/profileRoutes");
const quizRoutes = require("./routes/quizRoutes");
const chatRoutes = require("./routes/chatRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const communityRoutes = require("./routes/communityRoutes");
const app = express();
const notificationRoutes = require("./routes/notificationRoutes");
// Connect to MongoDB
connectDB();
// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // raised so base64 profile pictures and gallery photos don't get rejected

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/pair", pairRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);
// Serve the frontend (register.html, structure.html, style.css, script.js, etc.)
app.use(express.static(path.join(__dirname, "../frontend")));

// Basic health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ---------- Real-time chat (Socket.io) ----------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Require a valid JWT before letting a socket connect
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Not authorized"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Not authorized"));
  }
});

io.on("connection", async (socket) => {
  try {
    const me = await User.findById(socket.userId);
    if (!me?.partner) return; // not paired — nothing to chat about yet

    const roomId = getRoomId(socket.userId, me.partner);
    socket.roomId = roomId;
    socket.join(roomId);
  } catch (err) {
    console.error("socket connection error:", err);
  }

  socket.on("send_message", async (data) => {
    try {
      if (!socket.roomId || !data?.content?.trim()) return;

      const { encrypted, iv } = encryptText(data.content.trim());
      const message = await Message.create({
        sender: socket.userId,
        roomId: socket.roomId,
        encryptedContent: encrypted,
        iv,
      });
          const Notification = require("./models/Notification");
      await Notification.create({
        user: me.partner,
        type: "message",
        text: `New message from your partner`,
      });
      // Plaintext only ever travels over this authenticated, encrypted-in-transit
      // (HTTPS/WSS) connection — it's never stored in plaintext in the database.
      io.to(socket.roomId).emit("receive_message", {
        id: message._id,
        sender: socket.userId,
        content: data.content.trim(),
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("send_message error:", err);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
