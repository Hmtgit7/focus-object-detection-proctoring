const express = require("express");
const { body, param } = require("express-validator");
const multer = require("multer");
const path = require("path");
const {
  createInterview,
  getInterviews,
  getInterview,
  startInterview,
  endInterview,
  uploadVideo,
} = require("../controllers/interviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `interview-${req.params.id}-${uniqueSuffix}${path.extname(
        file.originalname
      )}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Accept video files only
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: fileFilter,
});

// Validation middleware
const createInterviewValidation = [
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
    .withMessage("Please provide a valid date and time"),
  body("duration")
    .isInt({ min: 5, max: 180 })
    .withMessage("Duration must be between 5 and 180 minutes"),
  body("settings.focusThreshold")
    .optional()
    .isInt({ min: 1000 })
    .withMessage("Focus threshold must be at least 1000ms"),
  body("settings.absenceThreshold")
    .optional()
    .isInt({ min: 5000 })
    .withMessage("Absence threshold must be at least 5000ms"),
];

const interviewIdValidation = [
  param("id").isMongoId().withMessage("Please provide a valid interview ID"),
];

// Routes
router
  .route("/")
  .post(
    protect,
    authorize("interviewer", "admin"),
    createInterviewValidation,
    createInterview
  )
  .get(protect, getInterviews);

router.route("/:id").get(protect, interviewIdValidation, getInterview);

router
  .route("/:id/start")
  .put(
    protect,
    authorize("interviewer", "admin"),
    interviewIdValidation,
    startInterview
  );

router
  .route("/:id/end")
  .put(
    protect,
    authorize("interviewer", "admin"),
    interviewIdValidation,
    endInterview
  );

router
  .route("/:id/upload-video")
  .post(protect, interviewIdValidation, upload.single("video"), uploadVideo);

module.exports = router;
