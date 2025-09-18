const { body, param, query } = require("express-validator");

// User validation rules
const validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("role")
    .optional()
    .isIn(["candidate", "interviewer", "admin"])
    .withMessage("Role must be candidate, interviewer, or admin"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Interview validation rules
const validateInterviewCreation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("candidateEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid candidate email"),

  body("scheduledAt")
    .isISO8601()
    .withMessage("Please provide a valid date and time")
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error("Interview must be scheduled for a future date");
      }
      return true;
    }),

  body("duration")
    .isInt({ min: 5, max: 180 })
    .withMessage("Duration must be between 5 and 180 minutes"),

  body("settings.focusThreshold")
    .optional()
    .isInt({ min: 1000, max: 30000 })
    .withMessage("Focus threshold must be between 1000ms and 30000ms"),

  body("settings.absenceThreshold")
    .optional()
    .isInt({ min: 5000, max: 60000 })
    .withMessage("Absence threshold must be between 5000ms and 60000ms"),
];

const validateInterviewUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("scheduledAt")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date and time"),

  body("duration")
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage("Duration must be between 5 and 180 minutes"),

  body("status")
    .optional()
    .isIn(["scheduled", "in-progress", "completed", "cancelled"])
    .withMessage("Invalid status"),

  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
];

// Detection log validation
const validateDetectionLog = [
  body("type")
    .isIn([
      "focus_lost",
      "face_absent",
      "multiple_faces",
      "phone_detected",
      "book_detected",
      "device_detected",
      "drowsiness_detected",
      "audio_violation",
    ])
    .withMessage("Invalid detection type"),

  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid severity level"),

  body("confidence")
    .isFloat({ min: 0, max: 1 })
    .withMessage("Confidence must be between 0 and 1"),

  body("timestamp")
    .optional()
    .isISO8601()
    .withMessage("Invalid timestamp format"),
];

// Parameter validation
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Please provide a valid ${paramName}`),
];

// Query validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "scheduledAt", "title", "status"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

const validateInterviewFilters = [
  query("status")
    .optional()
    .isIn(["scheduled", "in-progress", "completed", "cancelled"])
    .withMessage("Invalid status filter"),

  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateFrom"),

  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateTo"),
];

// File validation
const validateFileUpload = (fileType) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const allowedTypes = {
      video: ["video/mp4", "video/webm", "video/ogg", "video/avi"],
      audio: ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    };

    const maxSizes = {
      video: 500 * 1024 * 1024, // 500MB
      audio: 100 * 1024 * 1024, // 100MB
      image: 10 * 1024 * 1024, // 10MB
    };

    if (!allowedTypes[fileType].includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes[
          fileType
        ].join(", ")}`,
      });
    }

    if (req.file.size > maxSizes[fileType]) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${
          maxSizes[fileType] / (1024 * 1024)
        }MB`,
      });
    }

    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateInterviewCreation,
  validateInterviewUpdate,
  validateDetectionLog,
  validateMongoId,
  validatePagination,
  validateInterviewFilters,
  validateFileUpload,
};
