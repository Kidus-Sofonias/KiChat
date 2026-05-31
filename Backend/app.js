const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const userRoutes = require("./routes/userRoute");
const messageRoutes = require("./routes/messageRoute");
const db = require("./db/config");
const store = require("./db/store");
const jwtMiddleware = require("./middleWare/authMiddleware");

// Load environment variables
dotenv.config();

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const uploadsDirectory = path.join(__dirname, "uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });
app.set("trust proxy", 1);

// CORS Configuration
const configuredProductionOrigins = [
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGINS,
  "https://kichat.netlify.app",
  "https://kichat.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]
  .flatMap((value) => (value ? value.split(",") : []))
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const productionOrigins = new Set(configuredProductionOrigins);
const productionOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.onrender\.com$/i,
  /^https?:\/\/localhost(?::\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i,
];

const isAllowedProductionOrigin = (origin = "") => {
  const normalizedOrigin = origin.trim().replace(/\/+$/, "");
  const allowNullOrigin = process.env.ALLOW_NULL_ORIGIN === "true";
  const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === "true";

  if (allowAllOrigins) {
    return true;
  }

  if (allowNullOrigin && normalizedOrigin === "null") {
    return true;
  }

  return (
    productionOrigins.has(normalizedOrigin) ||
    productionOriginPatterns.some((pattern) => pattern.test(normalizedOrigin))
  );
};

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? (origin, callback) => {
          if (!origin) {
            callback(null, true);
            return;
          }

          if (isAllowedProductionOrigin(origin)) {
            // Reflect the exact allowed origin string. This is especially
            // important for `Origin: null` requests from local file clients.
            callback(null, origin);
          } else {
            callback(null, false);
          }
        }
      : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use("/uploads", express.static(uploadsDirectory));

const io = new Server(server, { cors: corsOptions });
app.set("io", io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure web-push VAPID keys
const webPush = require("web-push");
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    "mailto:admin@kichat.app",
    vapidPublicKey,
    vapidPrivateKey
  );
}

app.get("/api/push/vapid-key", (req, res) => {
  if (!vapidPublicKey) {
    return res.status(503).json({ msg: "Push notifications not configured" });
  }
  res.json({ publicKey: vapidPublicKey });
});

// In-memory store for push subscriptions
const pushSubscriptions = new Map();

app.post("/api/push/subscribe", (req, res) => {
  const { username, subscription } = req.body;
  if (!username || !subscription) {
    return res.status(400).json({ msg: "username and subscription required" });
  }
  pushSubscriptions.set(username, subscription);
  res.json({ msg: "Subscribed" });
});

app.post("/api/push/send", async (req, res) => {
  const { username, title, body: msgBody, url } = req.body;
  if (!username) {
    return res.status(400).json({ msg: "username required" });
  }
  const subscription = pushSubscriptions.get(username);
  if (!subscription) {
    return res.json({ msg: "No subscription found, user may not have notifications enabled" });
  }

  try {
    const webPush = require("web-push");
    const payload = JSON.stringify({ title: title || "KiChat", body: msgBody || "", url: url || "/" });
    await webPush.sendNotification(subscription, payload);
    res.json({ msg: "Notification sent" });
  } catch (error) {
    console.error("Push notification error:", error.message);
    // Remove stale subscription
    if (error.statusCode === 404 || error.statusCode === 410) {
      pushSubscriptions.delete(username);
    }
    res.status(500).json({ msg: "Failed to send notification" });
  }
});

io.on("connection", (socket) => {
  const username = socket.handshake.auth?.username;

  if (username) {
    socket.join(username);
    
    // Update last seen timestamp for active user by username
    store.updateUserByName(username, { last_seen: new Date() });
  }

  socket.on("join", (room) => {
    if (room) {
      socket.join(room);
    }
  });

  socket.on("disconnect", () => {
    if (username) {
      store.updateUserByName(username, { last_seen: new Date() });
    }
  });
});

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Server is up and running!");
});
app.get("/api/health", async (req, res) => {
  try {
    const storage = await store.getStorageStatus();

    res.json({
      status: "ok",
      storage,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      storage: {
        configured: db.isConfigured,
        databaseDialect: db.databaseDialect,
        databaseLabel: db.databaseLabel,
      },
    });
  }
});
app.use("/api/users", userRoutes);
app.use("/api/messages", jwtMiddleware, messageRoutes);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
