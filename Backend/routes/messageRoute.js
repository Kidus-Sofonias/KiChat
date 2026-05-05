const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const store = require("../db/store");

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Add retry configuration
  maxAttempts: 3,
  retryMode: "standard",
});

// Memory storage to handle file buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const uploadsDirectory = path.join(__dirname, "..", "uploads");
const s3RequiredEnvVars = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
];

const hasS3Config = () =>
  s3RequiredEnvVars.every((key) => Boolean(process.env[key]));

const shouldUseS3Uploads = () =>
  process.env.NODE_ENV === "production" && hasS3Config();

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

const uploadFileToS3 = async (file, fileName) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

const {
  createMessage,
  deleteMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
  emitMessageToUsers,
} = require("../controller/messageController");

// Routes
router.post("/", createMessage);
router.delete("/:messageId", deleteMessage);
router.get("/", getMessages);
router.get("/between", getMessagesBetweenUsers);
router.get("/recent/:username", getRecentUsers);

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

    if (shouldUseS3Uploads()) {
      try {
        fileUrl = await uploadFileToS3(file, fileName);
      } catch (error) {
        console.warn(
          `S3 upload failed, falling back to local storage: ${error.message}`
        );
        fileUrl = await uploadFileLocally(req, file, fileName);
      }
    } else {
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
