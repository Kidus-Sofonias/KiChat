const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv").config();

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Memory storage to handle file buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
} = require("../controller/messageController");

// Routes
router.post("/", createMessage);
router.get("/", getMessages);
router.get("/between", getMessagesBetweenUsers);
router.get("/recent/:username", getRecentUsers);

// ⏬ Compressed file upload route
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    const { sender, receiver, caption = "" } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    // Upload to S3
    const data = await s3.upload(params).promise();
    const fileUrl = data.Location;
    const messageContent = caption ? `${caption}\n${fileUrl}` : fileUrl;

    // Save to your database
    const Message = require("../models/message");
    const message = await Message.create({
      sender,
      receiver,
      content: messageContent,
      isFile: true,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("S3 upload failed:", err.message);
    res.status(500).json({ error: "Failed to upload file to S3" });
  }
});

module.exports = router;
