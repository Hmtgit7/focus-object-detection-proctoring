const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Interview = require("../models/Interview");
const DetectionLog = require("../models/DetectionLog");

// Store active connections
const activeConnections = new Map();

// Initialize Socket.IO service
const initializeSocketService = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error("Authentication error: Invalid user"));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User ${socket.userId} connected via socket`);
    
    // Store connection
    activeConnections.set(socket.userId, socket);

    // Join interview room
    socket.on("join-interview", async (data) => {
      try {
        const { interviewId } = data;
        
        // Verify user has access to this interview
        const interview = await Interview.findById(interviewId);
        if (!interview) {
          socket.emit("error", { message: "Interview not found" });
          return;
        }

        // Check if user is participant or admin
        const isParticipant = interview.participants.some(p => p.userId.toString() === socket.userId);
        const isAdmin = socket.userRole === "admin" || socket.userRole === "interviewer";
        
        if (!isParticipant && !isAdmin) {
          socket.emit("error", { message: "Access denied to this interview" });
          return;
        }

        socket.join(`interview-${interviewId}`);
        socket.currentInterviewId = interviewId;
        
        socket.emit("joined-interview", { 
          interviewId, 
          message: "Successfully joined interview room" 
        });

        // Notify other participants
        socket.to(`interview-${interviewId}`).emit("participant-joined", {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Join interview error:", error);
        socket.emit("error", { message: "Failed to join interview" });
      }
    });

    // Handle detection data
    socket.on("detection-data", async (data) => {
      try {
        const { interviewId, detectionType, data: detectionData, timestamp } = data;
        
        if (!socket.currentInterviewId || socket.currentInterviewId !== interviewId) {
          socket.emit("error", { message: "Not in interview room" });
          return;
        }

        // Log detection data
        const detectionLog = new DetectionLog({
          interviewId,
          userId: socket.userId,
          detectionType,
          data: detectionData,
          timestamp: timestamp || new Date()
        });

        await detectionLog.save();

        // Broadcast to other participants (admins/interviewers)
        socket.to(`interview-${interviewId}`).emit("detection-update", {
          userId: socket.userId,
          detectionType,
          data: detectionData,
          timestamp: detectionLog.timestamp
        });

      } catch (error) {
        console.error("Detection data error:", error);
        socket.emit("error", { message: "Failed to process detection data" });
      }
    });

    // Handle interview events
    socket.on("interview-event", async (data) => {
      try {
        const { interviewId, eventType, eventData } = data;
        
        if (!socket.currentInterviewId || socket.currentInterviewId !== interviewId) {
          socket.emit("error", { message: "Not in interview room" });
          return;
        }

        // Update interview status
        if (eventType === "start") {
          await Interview.findByIdAndUpdate(interviewId, {
            status: "in-progress",
            startedAt: new Date()
          });
        } else if (eventType === "end") {
          await Interview.findByIdAndUpdate(interviewId, {
            status: "completed",
            endedAt: new Date()
          });
        }

        // Broadcast event to all participants
        io.to(`interview-${interviewId}`).emit("interview-event", {
          eventType,
          eventData,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Interview event error:", error);
        socket.emit("error", { message: "Failed to process interview event" });
      }
    });

    // Handle chat messages
    socket.on("chat-message", async (data) => {
      try {
        const { interviewId, message } = data;
        
        if (!socket.currentInterviewId || socket.currentInterviewId !== interviewId) {
          socket.emit("error", { message: "Not in interview room" });
          return;
        }

        // Broadcast message to all participants
        io.to(`interview-${interviewId}`).emit("chat-message", {
          userId: socket.userId,
          message,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error("Chat message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Notify other participants if in an interview
      if (socket.currentInterviewId) {
        socket.to(`interview-${socket.currentInterviewId}`).emit("participant-left", {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
};

// Get active connections count
const getActiveConnectionsCount = () => {
  return activeConnections.size;
};

// Send message to specific user
const sendToUser = (userId, event, data) => {
  const socket = activeConnections.get(userId);
  if (socket) {
    socket.emit(event, data);
    return true;
  }
  return false;
};

// Broadcast to interview room
const broadcastToInterview = (interviewId, event, data) => {
  const io = require("socket.io").io;
  if (io) {
    io.to(`interview-${interviewId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocketService,
  getActiveConnectionsCount,
  sendToUser,
  broadcastToInterview,
};
