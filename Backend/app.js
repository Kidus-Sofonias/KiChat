const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const webpush = require("web-push");
const jwt = require("jsonwebtoken");

const userRoutes = require("./routes/userRoute");
const messageRoutes = require("./routes/messageRoute");
const db = require("./db/config");
const jwtMiddleware = require("./middleWare/authMiddleware");

// Load environment variables
dotenv.config();

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Change this to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// JWT Middleware for Socket.io Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Server is up and running!");
});
app.use("/api/users", userRoutes);
app.use("/api/messages", jwtMiddleware, messageRoutes);
app.use("/uploads", express.static("uploads"));

// Push Notifications Setup
const publicVapidKey =
  process.env.VAPID_PUBLIC_KEY ||
  "BN9z5P4ghBqZsE7OzpeFHOAS5gMTAiE3a1PGipArRb9bGRaXnTZ2AgUKxf2yOGrwVMVX94LzMO5WxvzmpKB4PAA";
const privateVapidKey =
  process.env.VAPID_PRIVATE_KEY ||
  "VuxysoWpQQxOVN22TMAgR4TGTWFT8qu8YFMUrWsrPhs";

webpush.setVapidDetails(
  "mailto:you@example.com",
  publicVapidKey,
  privateVapidKey
);

let subscriptions = []; // In-memory; store in DB for production

app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;

  // 🔥 Check if subscription already exists
  const exists = subscriptions.some(
    (sub) => sub.endpoint === subscription.endpoint
  );

  if (!exists) {
    subscriptions.push(subscription);
  }

  res.status(201).json({});

  const payload = JSON.stringify({
    title: "Subscribed!",
    body: "You will receive notifications.",
  });

  webpush.sendNotification(subscription, payload).catch(console.error);
});

const sendPushToAll = (data) => {
  subscriptions.forEach((sub) => {
    webpush.sendNotification(sub, JSON.stringify(data)).catch(console.error);
  });
};

// Sync database
db.sync({ alter: true })
  .then(() => console.log("✅ All models synced with MySQL"))
  .catch((err) => console.error("❌ DB Sync Error:", err.message));

// Socket.io Events
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.user.user_name);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
    sendPushToAll({ title: `Message from ${data.sender}`, body: data.content });
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("stop_typing");
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.user.user_name);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
