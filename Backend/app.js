const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const { Server } = require("socket.io");
const webpush = require("web-push");

const userRoutes = require("./routes/userRoute");
const messageRoutes = require("./routes/messageRoute");
const db = require("./db/config");
const User = require("./models/user");
const Message = require("./models/message");
const authMiddleware = require("./middleWare/authMiddleware");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Root route to show server is running
app.get("/", (req, res) => {
  res.send("🚀 Server is up and running!");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);

// Push Notifications Setup
const publicVapidKey = "BN9z5P4ghBqZsE7OzpeFHOAS5gMTAiE3a1PGipArRb9bGRaXnTZ2AgUKxf2yOGrwVMVX94LzMO5WxvzmpKB4PAA";
const privateVapidKey = "VuxysoWpQQxOVN22TMAgR4TGTWFT8qu8YFMUrWsrPhs";

webpush.setVapidDetails(
  "mailto:you@example.com",
  publicVapidKey,
  privateVapidKey
);

let subscriptions = []; // Store in DB for production

app.post("/api/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription); // Save subscription
  res.status(201).json({});

  const payload = JSON.stringify({
    title: "Subscribed!",
    body: "You will receive notifications.",
  });
  webpush.sendNotification(subscription, payload).catch(console.error);
});

// Example function to send push to all subscriptions
const sendPushToAll = (data) => {
  subscriptions.forEach((sub) => {
    webpush.sendNotification(sub, JSON.stringify(data)).catch(console.error);
  });
};

// Sync database and models
db.sync({ alter: true })
  .then(() => console.log("✅ All models synced with MySQL"))
  .catch((err) => console.error("❌ DB Sync Error:", err.message));

// Socket.io Events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

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
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
