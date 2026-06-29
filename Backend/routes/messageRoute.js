const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs/promises");
const fssync = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const cloudinary = require("cloudinary").v2;

// Load .env FIRST so all process.env vars are available before anything reads them
require("dotenv").config();

const store = require("../db/store");

let ffmpegPath;
try {
  ffmpegPath = require("ffmpeg-static");
} catch {
  ffmpegPath = null;
}

// Cloudinary Configuration (optional – uses free tier)
// Checked lazily so dotenv has already populated process.env before this runs.
const hasCloudinaryConfig = () =>
  ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].every(
    (key) => Boolean(process.env[key])
  );

let cloudinaryConfigured = false;
const ensureCloudinaryConfigured = () => {
  if (cloudinaryConfigured) return;
  if (!hasCloudinaryConfig()) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  cloudinaryConfigured = true;
  console.log("[cloudinary] SDK configured with cloud:", process.env.CLOUDINARY_CLOUD_NAME);
};

// Allowed MIME types – add to this list whenever you want to support a new type
const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  // Audio
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text / code
  "text/plain",
  "text/csv",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
]);

const fileFilter = (_req, file, callback) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      Object.assign(new Error(`File type "${file.mimetype}" is not allowed`), {
        code: "UNSUPPORTED_FILE_TYPE",
      }),
      false
    );
  }
};

// Memory storage to handle file buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter,
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
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    // Strip extension from fileName for public_id; use a folder prefix to
    // avoid collisions with other assets in the same Cloudinary account.
    const baseName = fileName.replace(/\.[^/.]+$/, "");

    const uploadOptions = {
      public_id: `kichat/${baseName}`,
      // Don't force a format – let Cloudinary keep the original extension
    };

    if (isImage) {
      uploadOptions.resource_type = "image";
    } else if (isVideo || file.mimetype.startsWith("audio/")) {
      uploadOptions.resource_type = "video";
    } else {
      uploadOptions.resource_type = "raw";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("[cloudinary] Upload error:", error.message, error.http_code);
          reject(error);
        } else {
          console.log("[cloudinary] Uploaded:", result.secure_url);
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

// ─── Local uploads cleanup ───────────────────────────────────────────────────
// Deletes files in the local uploads directory that are older than MAX_AGE_MS.
// Only runs when Cloudinary is not configured.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const runUploadsCleanup = async () => {
  if (hasCloudinaryConfig()) return; // Cloudinary manages its own retention

  try {
    const files = await fs.readdir(uploadsDirectory);
    const now = Date.now();
    let removed = 0;

    await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(uploadsDirectory, fileName);
        try {
          const stats = await fs.stat(filePath);
          if (now - stats.mtimeMs > MAX_AGE_MS) {
            await fs.unlink(filePath);
            removed++;
          }
        } catch {
          // File may have already been removed – ignore
        }
      })
    );

    if (removed > 0) {
      console.log(`[uploads cleanup] Removed ${removed} expired file(s)`);
    }
  } catch (err) {
    console.warn("[uploads cleanup] Failed:", err.message);
  }
};

// Run once on startup, then every 24 hours
runUploadsCleanup();
setInterval(runUploadsCleanup, 24 * 60 * 60 * 1000);
// ─────────────────────────────────────────────────────────────────────────────

const {
  createMessage,
  deleteMessage,
  getMessages,
  getMessagesBetweenUsers,
  getRecentUsers,
  replyToMessage,
  addReaction,
  removeReaction,
  editMessage,
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
// FIX: edit message route was missing
router.put("/:messageId", editMessage);

// Multer error handler – catches file-type rejections and size-limit errors
const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === "UNSUPPORTED_FILE_TYPE") {
      return res.status(415).json({ error: err.message });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File is too large. Maximum size is 100 MB." });
    }
    return res.status(400).json({ error: err.message || "File upload error" });
  }
  next();
};

// File Upload Route
router.post("/file", upload.single("file"), handleUploadError, async (req, res) => {
  try {
    const { caption = "" } = req.body;
    const file = req.file;

    // Fix #13: Derive sender from the verified JWT — never trust the client body for identity
    const sender = req.user?.user_name;
    // receiver still comes from body (the client knows who they're sending to),
    // but we validate it's a non-empty string
    const receiver = req.body.receiver?.trim();

    if (!sender) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!receiver) {
      return res.status(400).json({ error: "receiver is required" });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Fix #5: Validate caption length to prevent oversized payloads
    if (caption.length > 2000) {
      return res.status(400).json({ error: "Caption must be 2000 characters or fewer" });
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
      } catch (error) {
        console.warn(
          `[file upload] Cloudinary upload failed, falling back to local storage: ${error.message}`
        );
        fileUrl = await uploadFileLocally(req, file, fileName);

        // Warn loudly: a local URL won't be reachable by other users
        // unless BACKEND_PUBLIC_URL is set to a publicly accessible address.
        if (!process.env.BACKEND_PUBLIC_URL) {
          console.warn(
            "[file upload] WARNING: BACKEND_PUBLIC_URL is not set. The file URL " +
            `"${fileUrl}" is local and will NOT be reachable by other users. ` +
            "Set BACKEND_PUBLIC_URL to your server's public address, or configure Cloudinary."
          );
        }
      }
    } else {
      console.log("[file upload] Cloudinary not configured, using local storage");
      fileUrl = await uploadFileLocally(req, file, fileName);

      if (!process.env.BACKEND_PUBLIC_URL) {
        console.warn(
          "[file upload] WARNING: BACKEND_PUBLIC_URL is not set. The file URL " +
          `"${fileUrl}" is local and will NOT be reachable by other users.`
        );
      }
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