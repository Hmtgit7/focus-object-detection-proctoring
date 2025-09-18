import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    const serverUrl =
      process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: true, // Force new connection
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Setup default event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      this.isConnected = true;
      this.emit("connection_status", { connected: true });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      console.log("🔍 Disconnect stack trace:", new Error().stack);
      this.isConnected = false;
      this.emit("connection_status", { connected: false, reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      this.emit("connection_error", { error: error.message });
    });

    this.socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      this.emit("socket_error", { error });
    });

    // Interview-related events
    this.socket.on("joined_interview", (data) => {
      console.log("🎥 Joined interview room:", data);
      this.emit("interview_joined", data);
    });

    this.socket.on("user_joined", (data) => {
      console.log("👤 User joined interview:", data);
      this.emit("user_joined", data);
    });

    this.socket.on("user_left", (data) => {
      console.log("👤 User left interview:", data);
      this.emit("user_left", data);
    });

    this.socket.on("interview_started", (data) => {
      console.log("🚀 Interview started:", data);
      this.emit("interview_started", data);
    });

    this.socket.on("interview_ended", (data) => {
      console.log("🏁 Interview ended:", data);
      this.emit("interview_ended", data);
    });

    // Detection events
    this.socket.on("detection_alert", (data) => {
      console.log("⚠️ Detection alert:", data);
      this.emit("detection_alert", data);
    });

    this.socket.on("critical_alert", (data) => {
      console.log("🚨 Critical alert:", data);
      this.emit("critical_alert", data);
    });

    // Video status events
    this.socket.on("video_status_update", (data) => {
      console.log("📹 Video status update:", data);
      this.emit("video_status_update", data);
    });

    // Interviewer messages
    this.socket.on("interviewer_message", (data) => {
      console.log("💬 Interviewer message:", data);
      this.emit("interviewer_message", data);
    });
  }

  // Join interview room
  joinInterview(interviewId) {
    if (this.socket && this.isConnected) {
      console.log("🎯 Joining interview room:", interviewId);
      this.socket.emit("join_interview", { interviewId });
    }
  }

  // Leave interview room
  leaveInterview(interviewId) {
    if (this.socket && this.isConnected) {
      console.log("🚪 Leaving interview room:", interviewId);
      this.socket.emit("leave_interview", { interviewId });
    }
  }

  // Emit detection event
  emitDetectionEvent(detectionData) {
    if (this.socket && this.isConnected) {
      console.log("📡 Emitting detection event:", detectionData);
      this.socket.emit("detection_event", detectionData);
    }
  }

  // Emit video status
  emitVideoStatus(statusData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("video_status", statusData);
    }
  }

  // Emit interviewer action
  emitInterviewerAction(actionData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("interviewer_action", actionData);
    }
  }

  // Generic event emitter
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.listeners.has(event)) {
      this.listeners.delete(event);
    }

    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket");
      console.log("🔍 Disconnect call stack:", new Error().stack);
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
