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
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/file", upload.single("file"), async (req, res) => {
  try {
    const { sender, receiver, caption = "" } = req.body;

    // Convert buffer to data URI
    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "kichat_uploads",
    });

    const imageUrl = result.secure_url;
    const content = caption ? `${caption}\n${imageUrl}` : imageUrl;

    const message = await require("../models/message").create({
      sender,
      receiver,
      content,
      isFile: true,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    res.status(500).json({ error: "Failed to upload image" });
  }
});


module.exports = router;
