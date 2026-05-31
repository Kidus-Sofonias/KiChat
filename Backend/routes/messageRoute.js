const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const store = require("../db/store");

// Cloudinary Configuration (optional – uses free tier)
const hasCloudinaryConfig = () =>
  ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every(
    (key) => Boolean(process.env[key])
  );

if (hasCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Memory storage to handle file buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const uploadsDirectory = path.join(__dirname, "..", "uploads");

const sanitizeFileName = (fileName = "attachment") =>
  fileName.replace(/[^\w.-]+/g, "-");

const buildLocalFileUrl = (req, fileName) => {
  const baseUrl =
    process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;

  return `${baseUrl}/uploads/${fileName}`;
};

const uploadFileLocally = async (req, file, fileName) => {
  await fs.mkdir(uploadsDirectory, { recursive: true });

  const filePath = path.join(uploadsDirectory, fileName);
  await fs.writeFile(filePath, file.buffer);

  return buildLocalFileUrl(req, fileName);
};

const uploadFileToCloudinary = (file, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: file.mimetype.startsWith("video/") ? "video" : 
                       file.mimetype.startsWith("audio/") ? "video" : "image",
        public_id: fileName.replace(/\.[^/.]+$/, ""),
        format: file.originalname.split(".").pop(),
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

const {
  createMessage,
  deleteMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
  replyToMessage,
  addReaction,
  removeReaction,
  emitMessageToUsers,
} = require("../controller/messageController");

// Routes
router.post("/", createMessage);
router.delete("/:messageId", deleteMessage);
router.get("/", getMessages);
router.get("/between", getMessagesBetweenUsers);
router.get("/recent/:username", getRecentUsers);
router.post("/reply", replyToMessage);
router.post("/:messageId/reaction/add", addReaction);
router.post("/:messageId/reaction/remove", removeReaction);

// File Upload Route
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    const { sender, receiver, caption = "" } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;
    let fileUrl;

    // Try Cloudinary first (free tier), fall back to local storage
    if (hasCloudinaryConfig()) {
      try {
        fileUrl = await uploadFileToCloudinary(file, fileName);
        console.log("Uploaded to Cloudinary:", fileUrl);
      } catch (error) {
        console.warn(
          `Cloudinary upload failed, falling back to local storage: ${error.message}`
        );
        fileUrl = await uploadFileLocally(req, file, fileName);
      }
    } else {
      console.log("Cloudinary not configured, using local storage");
      fileUrl = await uploadFileLocally(req, file, fileName);
    }
    
    // Create message in database
    const message = await store.createMessage({
      sender,
      receiver,
      content: caption ? `${caption}\nfile:${fileUrl}` : `file:${fileUrl}`,
      isFile: true,
      fileType: file.mimetype,
      fileUrl,
      caption,
    });

    emitMessageToUsers(req.app, message);
    res.status(201).json(message);
  } catch (err) {
    console.error("File upload failed:", err);
    res.status(500).json({ 
      error: "File upload failed",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});


module.exports = router;