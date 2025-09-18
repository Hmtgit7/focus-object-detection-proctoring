// Detection types and their configurations
const DETECTION_TYPES = {
  FOCUS_LOST: {
    type: "focus_lost",
    description: "User not looking at the screen",
    baseDeduction: 1,
    severityMultipliers: { low: 0.5, medium: 1, high: 2, critical: 3 },
  },
  FACE_ABSENT: {
    type: "face_absent",
    description: "No face detected in frame",
    baseDeduction: 2,
    severityMultipliers: { low: 1, medium: 2, high: 4, critical: 6 },
  },
  MULTIPLE_FACES: {
    type: "multiple_faces",
    description: "Multiple faces detected",
    baseDeduction: 4,
    severityMultipliers: { low: 2, medium: 4, high: 8, critical: 12 },
  },
  PHONE_DETECTED: {
    type: "phone_detected",
    description: "Mobile phone detected",
    baseDeduction: 6,
    severityMultipliers: { low: 3, medium: 6, high: 12, critical: 20 },
  },
  BOOK_DETECTED: {
    type: "book_detected",
    description: "Book or notes detected",
    baseDeduction: 4,
    severityMultipliers: { low: 2, medium: 4, high: 8, critical: 15 },
  },
  DEVICE_DETECTED: {
    type: "device_detected",
    description: "Electronic device detected",
    baseDeduction: 5,
    severityMultipliers: { low: 2, medium: 5, high: 10, critical: 18 },
  },
  DROWSINESS_DETECTED: {
    type: "drowsiness_detected",
    description: "Signs of drowsiness detected",
    baseDeduction: 2,
    severityMultipliers: { low: 1, medium: 2, high: 4, critical: 6 },
  },
  AUDIO_VIOLATION: {
    type: "audio_violation",
    description: "Background voices or unusual audio",
    baseDeduction: 3,
    severityMultipliers: { low: 1, medium: 3, high: 6, critical: 10 },
  },
};

// Detection severity levels
const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Interview statuses
const INTERVIEW_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// User roles
const USER_ROLES = {
  CANDIDATE: "candidate",
  INTERVIEWER: "interviewer",
  ADMIN: "admin",
};

// API response codes
const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Socket event names
const SOCKET_EVENTS = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  JOIN_INTERVIEW: "join_interview",
  LEAVE_INTERVIEW: "leave_interview",

  // Detection events
  DETECTION_EVENT: "detection_event",
  DETECTION_ALERT: "detection_alert",
  CRITICAL_ALERT: "critical_alert",

  // Interview events
  INTERVIEW_STARTED: "interview_started",
  INTERVIEW_ENDED: "interview_ended",
  VIDEO_STATUS_UPDATE: "video_status_update",

  // User events
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  INTERVIEWER_MESSAGE: "interviewer_message",
};

// File upload limits
const UPLOAD_LIMITS = {
  VIDEO: {
    MAX_SIZE: 500 * 1024 * 1024, // 500MB
    ALLOWED_TYPES: ["video/mp4", "video/webm", "video/ogg", "video/avi"],
  },
  AUDIO: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_TYPES: ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
  },
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },
};

// ML Model configurations
const ML_CONFIG = {
  FACE_DETECTION: {
    MIN_CONFIDENCE: 0.5,
    MAX_FACES: 5,
    FRAME_RATE: 30,
  },
  OBJECT_DETECTION: {
    MIN_CONFIDENCE: 0.6,
    MAX_OBJECTS: 20,
    FRAME_RATE: 10,
  },
  EMOTION_DETECTION: {
    MIN_CONFIDENCE: 0.7,
    EMOTIONS: ["happy", "sad", "angry", "surprised", "neutral", "drowsy"],
  },
};

// Time constants (in milliseconds)
const TIME_CONSTANTS = {
  FOCUS_THRESHOLD: 5000, // 5 seconds
  ABSENCE_THRESHOLD: 10000, // 10 seconds
  DETECTION_INTERVAL: 1000, // 1 second
  CLEANUP_INTERVAL: 3600000, // 1 hour
  SESSION_TIMEOUT: 1800000, // 30 minutes
  MAX_INTERVIEW_DURATION: 10800000, // 3 hours
};

// Error messages
const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: "This field is required",
    INVALID_EMAIL: "Please provide a valid email address",
    WEAK_PASSWORD:
      "Password must be at least 6 characters with uppercase, lowercase and number",
    INVALID_DATE: "Please provide a valid date",
    INVALID_DURATION: "Duration must be between 5 and 180 minutes",
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Session expired, please login again",
    ACCESS_DENIED: "Access denied",
    UNAUTHORIZED: "Authentication required",
  },
  INTERVIEW: {
    NOT_FOUND: "Interview not found",
    ALREADY_STARTED: "Interview has already started",
    NOT_SCHEDULED: "Interview is not scheduled",
    PERMISSION_DENIED: "You do not have permission to access this interview",
  },
  UPLOAD: {
    FILE_TOO_LARGE: "File size exceeds the limit",
    INVALID_FILE_TYPE: "Invalid file type",
    UPLOAD_FAILED: "File upload failed",
  },
  SYSTEM: {
    SERVER_ERROR: "Internal server error",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable",
    DATABASE_ERROR: "Database connection error",
  },
};

// Success messages
const SUCCESS_MESSAGES = {
  AUTH: {
    REGISTERED: "User registered successfully",
    LOGGED_IN: "Login successful",
    LOGGED_OUT: "Logout successful",
  },
  INTERVIEW: {
    CREATED: "Interview created successfully",
    STARTED: "Interview started successfully",
    COMPLETED: "Interview completed successfully",
    UPDATED: "Interview updated successfully",
  },
  UPLOAD: {
    VIDEO_UPLOADED: "Video uploaded successfully",
    AUDIO_UPLOADED: "Audio uploaded successfully",
  },
  REPORT: {
    GENERATED: "Report generated successfully",
    EXPORTED: "Data exported successfully",
  },
};

module.exports = {
  DETECTION_TYPES,
  SEVERITY_LEVELS,
  INTERVIEW_STATUS,
  USER_ROLES,
  RESPONSE_CODES,
  SOCKET_EVENTS,
  UPLOAD_LIMITS,
  ML_CONFIG,
  TIME_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
