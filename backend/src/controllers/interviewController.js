const Interview = require("../models/Interview");
const User = require("../models/User");
const DetectionLog = require("../models/DetectionLog");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs").promises;

// @desc    Create new interview
// @route   POST /api/interviews
// @access  Private (Interviewer)
const createInterview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { title, candidateEmail, scheduledAt, duration, settings, category } = req.body;

    // Find candidate by email
    const candidate = await User.findOne({
      email: candidateEmail.toLowerCase(),
      role: "candidate",
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found with this email",
      });
    }

    // Create interview
    const interview = await Interview.create({
      title,
      candidate: candidate._id,
      interviewer: req.user.id,
      scheduledAt: new Date(scheduledAt),
      duration,
      category: category || 'frontend-js',
      settings: {
        ...settings,
        enableFocusDetection: settings?.enableFocusDetection ?? true,
        enableObjectDetection: settings?.enableObjectDetection ?? true,
        enableAudioDetection: settings?.enableAudioDetection ?? false,
        focusThreshold: settings?.focusThreshold ?? 5000,
        absenceThreshold: settings?.absenceThreshold ?? 10000,
      },
    });

    await interview.populate([
      { path: "candidate", select: "name email" },
      { path: "interviewer", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating interview",
    });
  }
};

// @desc    Get user interviews
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter based on user role
    if (req.user.role === "candidate") {
      query.candidate = req.user.id;
    } else if (req.user.role === "interviewer") {
      query.interviewer = req.user.id;
    }

    // Filter by status if provided
    if (
      status &&
      ["scheduled", "in-progress", "completed", "cancelled"].includes(status)
    ) {
      query.status = status;
    }

    const interviews = await Interview.find(query)
      .populate("candidate", "name email")
      .populate("interviewer", "name email")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Interview.countDocuments(query);

    res.json({
      success: true,
      interviews,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching interviews",
    });
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Private
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidate", "name email")
      .populate("interviewer", "name email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check if user has access to this interview
    console.log("🔍 Access check:", {
      candidateId: interview.candidate._id.toString(),
      interviewerId: interview.interviewer._id.toString(),
      userId: req.user.id,
      userRole: req.user.role
    });

    if (
      interview.candidate._id.toString() !== req.user.id &&
      interview.interviewer._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this interview",
      });
    }

    // Check if interview is completed and prevent re-opening
    if (interview.status === 'completed') {
      return res.status(403).json({
        success: false,
        message: "Interview has already been completed",
        interview: {
          ...interview.toObject(),
          accessDenied: true,
          reason: "completed"
        }
      });
    }

    // Check if interview is scheduled for future (only for candidates)
    const now = new Date();
    const scheduledTime = new Date(interview.scheduledAt);
    const endTime = new Date(scheduledTime.getTime() + interview.duration * 60000);

    if (req.user.role === 'candidate' && interview.status === 'scheduled') {
      if (now < scheduledTime) {
        return res.status(403).json({
          success: false,
          message: "Interview has not started yet. Please wait until the scheduled time.",
          interview: {
            ...interview.toObject(),
            accessDenied: true,
            reason: "not_started",
            scheduledAt: interview.scheduledAt,
            currentTime: now
          }
        });
      }
      
      if (now > endTime) {
        return res.status(403).json({
          success: false,
          message: "Interview time has expired. The interview window has closed.",
          interview: {
            ...interview.toObject(),
            accessDenied: true,
            reason: "expired",
            scheduledAt: interview.scheduledAt,
            endTime: endTime,
            currentTime: now
          }
        });
      }
    }

    // Get detection logs for this interview
    const detectionLogs = await DetectionLog.find({ interview: interview._id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      interview,
      detectionLogs,
    });
  } catch (error) {
    console.error("Get interview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching interview",
    });
  }
};

// @desc    Start interview (update status)
// @route   PUT /api/interviews/:id/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check access permissions - allow candidate to start their own interview
    if (
      interview.interviewer.toString() !== req.user.id &&
      interview.candidate.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only interviewer or candidate can start the interview",
      });
    }

    // Update interview status
    interview.status = "in-progress";
    interview.startedAt = new Date();
    await interview.save();

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.to(`interview-${interview._id}`).emit("interview_started", {
        interviewId: interview._id,
        message: "Interview has started",
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: "Interview started successfully",
      interview,
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error starting interview",
    });
  }
};

// @desc    End interview (update status)
// @route   PUT /api/interviews/:id/end
// @access  Private
const endInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check access permissions - allow candidate to end their own interview
    if (
      interview.interviewer.toString() !== req.user.id &&
      interview.candidate.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only interviewer or candidate can end the interview",
      });
    }

    // Update interview status
    interview.status = "completed";
    interview.endedAt = new Date();
    await interview.save();

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.to(`interview-${interview._id}`).emit("interview_ended", {
        interviewId: interview._id,
        message: "Interview has ended",
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: "Interview ended successfully",
      interview,
    });
  } catch (error) {
    console.error("End interview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error ending interview",
    });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check access permissions - only interviewer, admin, or candidate can delete
    if (
      interview.interviewer.toString() !== req.user.id &&
      interview.candidate.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only interviewer, candidate, or admin can delete the interview",
      });
    }

    // Prevent deletion of interviews that are in progress
    if (interview.status === 'in-progress') {
      return res.status(403).json({
        success: false,
        message: "Cannot delete interview that is currently in progress",
      });
    }

    // Delete associated detection logs
    await DetectionLog.deleteMany({ interview: interview._id });

    // Delete video file if it exists
    if (interview.videoRecording && interview.videoRecording.path) {
      try {
        await fs.unlink(interview.videoRecording.path);
      } catch (fileError) {
        console.warn("Warning: Could not delete video file:", fileError.message);
      }
    }

    // Delete the interview
    await Interview.findByIdAndDelete(req.params.id);

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      io.to(`interview-${interview._id}`).emit("interview_deleted", {
        interviewId: interview._id,
        message: "Interview has been deleted",
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Delete interview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting interview",
    });
  }
};

// @desc    Upload video recording
// @route   POST /api/interviews/:id/upload-video
// @access  Private
const uploadVideo = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    // Update interview with video information
    interview.videoRecording = {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      duration: req.body.duration || 0,
    };

    await interview.save();

    res.json({
      success: true,
      message: "Video uploaded successfully",
      videoInfo: interview.videoRecording,
    });
  } catch (error) {
    console.error("Upload video error:", error);
    res.status(500).json({
      success: false,
      message: "Server error uploading video",
    });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterview,
  startInterview,
  endInterview,
  deleteInterview,
  uploadVideo,
};
