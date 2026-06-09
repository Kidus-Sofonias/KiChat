const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs/promises");
const fssync = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const store = require("../db/store");

let ffmpegPath;
try {
  ffmpegPath = require("ffmpeg-static");
} catch {
  ffmpegPath = null;
}

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

const convertToMp3 = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg not available"));
      return;
    }

    const tmpDir = os.tmpdir();
    const id = Date.now();
    const tmpInput = path.join(tmpDir, `kichat-in-${id}.webm`);
    const tmpOutput = path.join(tmpDir, `kichat-out-${id}.mp3`);

    console.log(`[ffmpeg] Input buffer size: ${inputBuffer.length} bytes`);

    fssync.writeFile(tmpInput, inputBuffer, (writeErr) => {
      if (writeErr) {
        reject(writeErr);
        return;
      }

      const ffmpeg = spawn(ffmpegPath, [
        "-y",
        "-f", "webm",
        "-vn",
        "-i", tmpInput,
        "-acodec", "libmp3lame",
        "-b:a", "128k",
        "-ar", "44100",
        "-ac", "1",
        tmpOutput,
      ]);

      let stderr = "";
      ffmpeg.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

      ffmpeg.on("close", (code) => {
        try { fssync.unlinkSync(tmpInput); } catch {}

        if (code !== 0) {
          try { fssync.unlinkSync(tmpOutput); } catch {}
          reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-300)}`));
          return;
        }

        fssync.readFile(tmpOutput, (readErr, mp3Buffer) => {
          try { fssync.unlinkSync(tmpOutput); } catch {}
          if (readErr) {
            reject(readErr);
          } else {
            resolve(mp3Buffer);
          }
        });
      });

      ffmpeg.on("error", (err) => {
        try { fssync.unlinkSync(tmpInput); } catch {}
        reject(err);
      });
    });
  });
};

const uploadFileToCloudinary = (file, fileName) => {
  return new Promise((resolve, reject) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    const uploadOptions = {
      public_id: fileName.replace(/\.[^/.]+$/, ""),
      format: fileName.split(".").pop() || undefined,
    };

    if (isImage) {
      uploadOptions.resource_type = "image";
    } else if (isVideo || file.mimetype.startsWith("audio/")) {
      // Audio and video go through Cloudinary's media pipeline
      uploadOptions.resource_type = "video";
    } else {
      uploadOptions.resource_type = "raw";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
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

    // Convert audio to mp3 before uploading to Cloudinary
    let uploadFile = file;
    let uploadFileName = fileName;
    const isAudio = file.mimetype.startsWith("audio/");

    if (isAudio && !file.mimetype.includes("mpeg")) {
      try {
        const mp3Buffer = await convertToMp3(file.buffer);
        uploadFile = { ...file, buffer: mp3Buffer, mimetype: "audio/mpeg" };
        uploadFileName = fileName.replace(/\.[^.]+$/, ".mp3");
        console.log("Converted audio to MP3");
      } catch (err) {
        console.warn("MP3 conversion failed, uploading original:", err.message);
      }
    }

    // Try Cloudinary first, fall back to local storage
    if (hasCloudinaryConfig()) {
      try {
        fileUrl = await uploadFileToCloudinary(uploadFile, uploadFileName);
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
      fileType: uploadFile.mimetype,
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