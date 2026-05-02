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
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]
  .flatMap((value) => (value ? value.split(",") : []))
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const productionOrigins = new Set(configuredProductionOrigins);
const isAllowedProductionOrigin = (origin = "") => {
  const normalizedOrigin = origin.trim().replace(/\/+$/, "");

  return (
    productionOrigins.has(normalizedOrigin) ||
    /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(normalizedOrigin)
  );
};

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? (origin, callback) => {
          if (!origin || isAllowedProductionOrigin(origin)) {
            callback(null, true);
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

io.on("connection", (socket) => {
  const username = socket.handshake.auth?.username;

  if (username) {
    socket.join(username);
  }

  socket.on("join", (room) => {
    if (room) {
      socket.join(room);
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
