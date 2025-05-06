const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const {
  createMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
} = require("../controller/messageController");

const storage = multer.memoryStorage(); // Handle file in memory
const upload = multer({ storage });

// Routes
router.post("/", createMessage);
router.get("/", getMessages);
router.get("/between", getMessagesBetweenUsers);
router.get("/recent/:username", getRecentUsers);

// ⏬ Compressed file upload route
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    const { sender, receiver, caption = "" } = req.body;
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const outputPath = path.join("uploads", filename);

    await sharp(req.file.buffer)
      .resize({ width: 1000 })
      .jpeg({ quality: 70 })
      .toFile(outputPath);

    const content = caption
      ? `${caption}\n${"/uploads/" + filename}`
      : `/uploads/${filename}`;

    const message = await require("../models/message").create({
      sender,
      receiver,
      content,
      isFile: true,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("File upload failed:", err.message);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

module.exports = router;
