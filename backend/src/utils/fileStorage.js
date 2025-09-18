const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const dirs = [
    "uploads",
    "uploads/videos",
    "uploads/audio",
    "uploads/images",
    "uploads/reports",
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
};

// Generate secure filename
const generateSecureFilename = (originalname, prefix = "") => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext);

  return `${prefix}${baseName}-${timestamp}-${random}${ext}`;
};

// Video upload configuration
const videoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDirs();
    cb(null, "uploads/videos/");
  },
  filename: (req, file, cb) => {
    const filename = generateSecureFilename(file.originalname, "video-");
    cb(null, filename);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
      "video/wmv",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only video files are allowed."), false);
    }
  },
});

// Audio upload configuration
const audioStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDirs();
    cb(null, "uploads/audio/");
  },
  filename: (req, file, cb) => {
    const filename = generateSecureFilename(file.originalname, "audio-");
    cb(null, filename);
  },
});

const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/aac",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."), false);
    }
  },
});

// File cleanup utilities
const cleanupOldFiles = async (directory, maxAgeHours = 24) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        console.log(`🗑️ Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error("File cleanup error:", error);
  }
};

// Get file info
const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      exists: true,
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
};

// Schedule periodic cleanup
const scheduleCleanup = () => {
  // Clean up temporary files every hour
  setInterval(async () => {
    await cleanupOldFiles("uploads/temp", 1);
  }, 60 * 60 * 1000);

  // Clean up old recordings every 7 days
  setInterval(async () => {
    await cleanupOldFiles("uploads/videos", 7 * 24);
    await cleanupOldFiles("uploads/audio", 7 * 24);
  }, 24 * 60 * 60 * 1000);
};

module.exports = {
  ensureUploadDirs,
  generateSecureFilename,
  videoUpload,
  audioUpload,
  cleanupOldFiles,
  getFileInfo,
  scheduleCleanup,
};
