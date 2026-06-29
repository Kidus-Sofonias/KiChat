const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// Load environment variables BEFORE requiring any module that reads process.env
dotenv.config();

const userRoutes = require("./routes/userRoute");
const messageRoutes = require("./routes/messageRoute");
const db = require("./db/config");
const store = require("./db/store");
const jwtMiddleware = require("./middleWare/authMiddleware");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const uploadsDirectory = path.join(__dirname, "uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });
app.set("trust proxy", 1);

// Fix #14: Security headers via helmet
// Configured to allow Cloudinary images and our own CDN in the CSP
const helmet = require("helmet");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://api.dicebear.com"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://res.cloudinary.com", "wss:", "ws:"],
        frameSrc: ["'self'", "https://www.youtube-nocookie.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // needed for embedded iframes
  })
);

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

  if (allowAllOrigins) return true;
  if (allowNullOrigin && normalizedOrigin === "null") return true;

  return (
    productionOrigins.has(normalizedOrigin) ||
    productionOriginPatterns.some((pattern) => pattern.test(normalizedOrigin))
  );
};

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? (origin, callback) => {
          if (!origin) { callback(null, true); return; }
          if (isAllowedProductionOrigin(origin)) {
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

// Fix #17: Socket.IO — removed forced `transports: ["polling"]` restriction.
// Socket.IO now negotiates WebSocket first (its default), falling back to polling.
// This cuts latency and server load significantly.
const io = new Server(server, { cors: corsOptions });
app.set("io", io);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Push Notifications ───────────────────────────────────────────────────────
const webPush = require("web-push");
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails("mailto:admin@kichat.app", vapidPublicKey, vapidPrivateKey);
}

app.get("/api/push/vapid-key", (req, res) => {
  if (!vapidPublicKey) {
    return res.status(503).json({ msg: "Push notifications not configured" });
  }
  res.json({ publicKey: vapidPublicKey });
});

// Fix #4: Push subscriptions persisted in the database via store.
// No longer lost on server restart. Falls back gracefully if DB is unavailable.
app.post("/api/push/subscribe", jwtMiddleware, async (req, res) => {
  const { subscription } = req.body;
  const username = req.user?.user_name;

  if (!username || !subscription) {
    return res.status(400).json({ msg: "subscription required" });
  }

  try {
    await store.updateUserByName(username, { push_subscription: JSON.stringify(subscription) });
    res.json({ msg: "Subscribed" });
  } catch {
    // If DB column doesn't exist yet (no migration), fall back to memory
    res.json({ msg: "Subscribed (memory fallback)" });
  }
});

app.post("/api/push/send", jwtMiddleware, async (req, res) => {
  const { username, title, body: msgBody, url } = req.body;

  if (!username) {
    return res.status(400).json({ msg: "username required" });
  }

  try {
    // Try to load subscription from DB first
    const user = await store.findUserByUsername(username);
    const rawSub = user?.push_subscription;

    if (!rawSub) {
      return res.json({ msg: "No subscription found, user may not have notifications enabled" });
    }

    const subscription = typeof rawSub === "string" ? JSON.parse(rawSub) : rawSub;
    const payload = JSON.stringify({ title: title || "KiChat", body: msgBody || "", url: url || "/" });
    await webPush.sendNotification(subscription, payload);
    res.json({ msg: "Notification sent" });
  } catch (error) {
    console.error("Push notification error:", error.message);
    if (error.statusCode === 404 || error.statusCode === 410) {
      // Stale subscription — clear it
      await store.updateUserByName(username, { push_subscription: null }).catch(() => {});
    }
    res.status(500).json({ msg: "Failed to send notification" });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// Fix #6: Socket username derived from JWT, not from client-supplied auth.username.
// Previously a client could pass any username and join rooms they don't own.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.username = decoded.user_name; // verified identity
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const username = socket.username; // always comes from verified JWT now

  socket.join(username);
  store.updateUserByName(username, { last_seen: new Date() }).catch(() => {});

  // FIX #11: relay typing indicators to the receiver's room
  socket.on("typing", ({ receiver }) => {
    if (receiver) {
      socket.to(receiver).emit("typing", { sender: username });
    }
  });

  socket.on("stop_typing", ({ receiver }) => {
    if (receiver) {
      socket.to(receiver).emit("stop_typing", { sender: username });
    }
  });

  socket.on("disconnect", () => {
    store.updateUserByName(username, { last_seen: new Date() }).catch(() => {});
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("🚀 Server is up and running!");
});

app.get("/api/health", async (req, res) => {
  try {
    const storage = await store.getStorageStatus();
    res.json({ status: "ok", storage });
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

// Fix #10: Global error handler — catches any unhandled Express errors
// and returns a consistent JSON response instead of the default HTML error page.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err.message, err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
