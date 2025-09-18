const reportService = require("../services/reportService");
const Interview = require("../models/Interview");
const DetectionLog = require("../models/DetectionLog");
const { validationResult } = require("express-validator");

// @desc    Generate and download PDF report
// @route   GET /api/reports/:interviewId/pdf
// @access  Private
const generatePDFReport = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Check if interview exists and user has access
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check access permissions
    if (
      interview.candidate.toString() !== req.user.id &&
      interview.interviewer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this interview report",
      });
    }

    const { pdfBuffer, reportData } =
      await reportService.generateProctoringReport(interviewId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportData.filename}"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Generate PDF report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating PDF report",
    });
  }
};

// @desc    Export report data as CSV
// @route   GET /api/reports/:interviewId/csv
// @access  Private
const exportCSVReport = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check access permissions
    if (
      interview.candidate.toString() !== req.user.id &&
      interview.interviewer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this interview report",
      });
    }

    const csvData = await reportService.exportToCSV(interviewId);

    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="interview-${interviewId}-data.csv"`,
    });

    res.send(csvData);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting CSV report",
    });
  }
};

// @desc    Get report statistics
// @route   GET /api/reports/:interviewId/stats
// @access  Private
const getReportStats = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId)
      .populate("candidate", "name email")
      .populate("interviewer", "name email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check access permissions
    if (
      interview.candidate._id.toString() !== req.user.id &&
      interview.interviewer._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this interview report",
      });
    }

    const detectionLogs = await DetectionLog.find({
      interview: interviewId,
    }).sort({ timestamp: 1 });

    const stats = reportService.calculateInterviewStats(
      detectionLogs,
      interview
    );

    res.json({
      success: true,
      interview: {
        id: interview._id,
        title: interview.title,
        candidate: interview.candidate,
        interviewer: interview.interviewer,
        scheduledAt: interview.scheduledAt,
        duration: interview.duration,
        status: interview.status,
        integrityScore: interview.integrityScore,
      },
      stats,
    });
  } catch (error) {
    console.error("Get report stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching report statistics",
    });
  }
};

// @desc    Get all reports for user
// @route   GET /api/reports
// @access  Private
const getUserReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter based on user role
    if (req.user.role === "candidate") {
      query.candidate = req.user.id;
    } else if (req.user.role === "interviewer") {
      query.interviewer = req.user.id;
    }

    // Only completed interviews have reports
    query.status = "completed";

    const interviews = await Interview.find(query)
      .populate("candidate", "name email")
      .populate("interviewer", "name email")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get detection counts for each interview
    const reportsData = await Promise.all(
      interviews.map(async (interview) => {
        const detectionCount = await DetectionLog.countDocuments({
          interview: interview._id,
        });

        return {
          ...interview.toObject(),
          detectionCount,
        };
      })
    );

    const total = await Interview.countDocuments(query);

    res.json({
      success: true,
      reports: reportsData,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get user reports error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
    });
  }
};

module.exports = {
  generatePDFReport,
  exportCSVReport,
  getReportStats,
  getUserReports,
};
