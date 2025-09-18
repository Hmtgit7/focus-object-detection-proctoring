const express = require("express");
const { param } = require("express-validator");
const {
  generatePDFReport,
  exportCSVReport,
  getReportStats,
  getUserReports,
} = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const reportIdValidation = [
  param("interviewId")
    .isMongoId()
    .withMessage("Please provide a valid interview ID"),
];

// Routes
router.route("/").get(protect, getUserReports);

router
  .route("/:interviewId/pdf")
  .get(protect, reportIdValidation, generatePDFReport);

router
  .route("/:interviewId/csv")
  .get(protect, reportIdValidation, exportCSVReport);

router
  .route("/:interviewId/stats")
  .get(protect, reportIdValidation, getReportStats);

module.exports = router;
