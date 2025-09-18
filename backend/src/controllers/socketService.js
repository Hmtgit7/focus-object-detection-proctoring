const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Interview = require("../models/Interview");
const DetectionLog = require("../models/DetectionLog");

let io;

// Initialize Socket.IO service
const initializeSocketService = (socketIO) => {
  io = socketIO;

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join interview room
    socket.on("join_interview", async (data) => {
      try {
        const { interviewId } = data;
        const interview = await Interview.findById(interviewId);

        if (!interview) {
          socket.emit("error", { message: "Interview not found" });
          return;
        }

        // Check if user has access to this interview
        if (
          interview.candidate.toString() !== socket.userId &&
          interview.interviewer.toString() !== socket.userId
        ) {
          socket.emit("error", { message: "Access denied to this interview" });
          return;
        }

        socket.join(`interview_${interviewId}`);
        socket.currentInterview = interviewId;

        socket.emit("joined_interview", {
          interviewId,
          message: "Successfully joined interview room",
        });

        // Notify others in the room
        socket.to(`interview_${interviewId}`).emit("user_joined", {
          userId: socket.userId,
          userRole: socket.userRole,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Join interview error:", error);
        socket.emit("error", { message: "Failed to join interview" });
      }
    });

    // Handle detection events
    socket.on("detection_event", async (data) => {
      try {
        const { interviewId, type, confidence, details, timestamp } = data;

        // Validate detection type
        const validTypes = [
          "focus_lost",
          "face_absent",
          "multiple_faces",
          "phone_detected",
          "book_detected",
          "device_detected",
          "drowsiness_detected",
          "audio_violation",
        ];

        if (!validTypes.includes(type)) {
          socket.emit("error", { message: "Invalid detection type" });
          return;
        }

        // Determine severity based on type and confidence
        let severity = "low";
        if (confidence > 0.8) severity = "high";
        else if (confidence > 0.6) severity = "medium";

        // Create detection log
        const detectionLog = await DetectionLog.create({
          interview: interviewId,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          type,
          severity,
          confidence,
          details,
          action: severity === "high" ? "flagged" : "logged",
        });

        // Calculate score deduction
        const scoreDeduction = detectionLog.calculateScoreDeduction();

        // Update interview integrity score
        const interview = await Interview.findById(interviewId);
        if (interview) {
          interview.integrityScore = Math.max(
            0,
            interview.integrityScore - scoreDeduction
          );
          await interview.save();
        }

        // Emit to interview room
        io.to(`interview_${interviewId}`).emit("detection_alert", {
          id: detectionLog._id,
          type,
          severity,
          confidence,
          details,
          timestamp: detectionLog.timestamp,
          scoreDeduction,
          currentScore: interview?.integrityScore,
        });

        // Send immediate alert for high severity events
        if (severity === "high" || severity === "critical") {
          io.to(`interview_${interviewId}`).emit("critical_alert", {
            message: `Critical violation detected: ${type}`,
            type,
            severity,
            timestamp: detectionLog.timestamp,
          });
        }
      } catch (error) {
        console.error("Detection event error:", error);
        socket.emit("error", { message: "Failed to process detection event" });
      }
    });

    // Handle real-time video status updates
    socket.on("video_status", (data) => {
      const { interviewId, status, timestamp } = data;

      socket.to(`interview_${interviewId}`).emit("video_status_update", {
        userId: socket.userId,
        status, // recording, paused, stopped
        timestamp: timestamp || new Date(),
      });
    });

    // Handle interviewer actions
    socket.on("interviewer_action", async (data) => {
      try {
        if (socket.userRole !== "interviewer") {
          socket.emit("error", { message: "Unauthorized action" });
          return;
        }

        const { interviewId, action, message } = data;

        io.to(`interview_${interviewId}`).emit("interviewer_message", {
          action,
          message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Interviewer action error:", error);
        socket.emit("error", { message: "Failed to process action" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId}`);

      if (socket.currentInterview) {
        socket.to(`interview_${socket.currentInterview}`).emit("user_left", {
          userId: socket.userId,
          userRole: socket.userRole,
          timestamp: new Date(),
        });
      }
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Emit event to specific interview room
const emitToInterview = (interviewId, event, data) => {
  if (io) {
    io.to(`interview_${interviewId}`).emit(event, data);
  }
};

// Emit event to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    const userSockets = Array.from(io.sockets.sockets.values()).filter(
      (socket) => socket.userId === userId
    );

    userSockets.forEach((socket) => {
      socket.emit(event, data);
    });
  }
};

module.exports = {
  initializeSocketService,
  getIO,
  emitToInterview,
  emitToUser,
};
