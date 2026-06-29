const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// importing user controllers
const {
  register,
  login,
  checkUser,
  getAllUsers,
  getUserStatus,
  updateLastSeen,
} = require("../controller/userController");
const authMiddleware = require("../middleWare/authMiddleware");

// Fix #2: Rate limiting on auth endpoints
// 10 attempts per 15 minutes per IP — blocks brute-force without locking out real users
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many attempts from this IP, please try again in 15 minutes." },
});

// Stricter limiter for registration to prevent spam account creation
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many accounts created from this IP, please try again in an hour." },
});

router.post("/register", registerLimiter, register);
router.post("/login", authLimiter, login);
router.get("/check", authMiddleware, checkUser);
router.get("/all", authMiddleware, getAllUsers);

// Fix #19: Lightweight per-user status endpoint — replaces polling /all every 15s
router.get("/:username/status", authMiddleware, getUserStatus);

router.post("/last-seen", authMiddleware, updateLastSeen);

module.exports = router;
