const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
} = require("../controller/messageController");

// Upload destination setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.post("/", createMessage);
router.get("/", getMessages);
router.get("/between", getMessagesBetweenUsers);
router.get("/recent/:username", getRecentUsers);

// New route to upload files
router.post("/file", upload.single("file"), async (req, res) => {
  const { sender, receiver } = req.body;
  const filePath = `/uploads/${req.file.filename}`;

  const message = await require("../models/message").create({
    sender,
    receiver,
    content: filePath,
    isFile: true,
  });

  res.status(201).json(message);
});

module.exports = router;
