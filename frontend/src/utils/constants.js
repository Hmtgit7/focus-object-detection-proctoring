// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    LOGOUT: "/api/auth/logout",
  },
  INTERVIEWS: {
    BASE: "/api/interviews",
    CREATE: "/api/interviews",
    GET_ALL: "/api/interviews",
    GET_BY_ID: (id) => `/api/interviews/${id}`,
    UPDATE: (id) => `/api/interviews/${id}`,
    DELETE: (id) => `/api/interviews/${id}`,
    START: (id) => `/api/interviews/${id}/start`,
    END: (id) => `/api/interviews/${id}/end`,
    UPLOAD_VIDEO: (id) => `/api/interviews/${id}/upload-video`,
  },
  REPORTS: {
    BASE: "/api/reports",
    GET_ALL: "/api/reports",
    GET_STATS: (id) => `/api/reports/${id}/stats`,
    DOWNLOAD_PDF: (id) => `/api/reports/${id}/pdf`,
    DOWNLOAD_CSV: (id) => `/api/reports/${id}/csv`,
  },
};

// Socket events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECTION_ERROR: "connect_error",

  // Interview room
  JOIN_INTERVIEW: "join_interview",
  LEAVE_INTERVIEW: "leave_interview",
  JOINED_INTERVIEW: "joined_interview",

  // User events
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",

  // Interview control
  INTERVIEW_STARTED: "interview_started",
  INTERVIEW_ENDED: "interview_ended",
  INTERVIEW_PAUSED: "interview_paused",

  // Detection events
  DETECTION_EVENT: "detection_event",
  DETECTION_ALERT: "detection_alert",
  CRITICAL_ALERT: "critical_alert",

  // Video events
  VIDEO_STATUS: "video_status",
  VIDEO_STATUS_UPDATE: "video_status_update",

  // Communication
  INTERVIEWER_ACTION: "interviewer_action",
  INTERVIEWER_MESSAGE: "interviewer_message",
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "user",
  INTERVIEW_SETTINGS: "interviewSettings",
  DETECTION_PREFERENCES: "detectionPreferences",
  VIDEO_QUALITY: "videoQuality",
};

// Application routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  INTERVIEWS: "/interviews",
  INTERVIEW_CREATE: "/interviews/create",
  INTERVIEW_DETAIL: "/interviews/:id",
  INTERVIEW_EDIT: "/interviews/:id/edit",
  REPORTS: "/reports",
  REPORT_DETAIL: "/reports/:id",
  SETTINGS: "/settings",
};

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  INTERVIEWER: "interviewer",
  CANDIDATE: "candidate",
};

// Interview statuses
export const INTERVIEW_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Detection types
export const DETECTION_TYPES = {
  FOCUS_LOST: "focus_lost",
  FACE_ABSENT: "face_absent",
  MULTIPLE_FACES: "multiple_faces",
  PHONE_DETECTED: "phone_detected",
  BOOK_DETECTED: "book_detected",
  DEVICE_DETECTED: "device_detected",
  DROWSINESS_DETECTED: "drowsiness_detected",
  AUDIO_VIOLATION: "audio_violation",
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Application configuration
export const APP_CONFIG = {
  NAME: "ProctorAI",
  VERSION: "1.0.0",
  AUTHOR: "ProctorAI Team",
  DESCRIPTION: "AI-powered video proctoring system",

  // Limits
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  MAX_RECORDING_TIME: 3 * 60 * 60 * 1000, // 3 hours
  MAX_INTERVIEW_DURATION: 180, // 180 minutes

  // Detection settings
  DEFAULT_FOCUS_THRESHOLD: 5000, // 5 seconds
  DEFAULT_ABSENCE_THRESHOLD: 10000, // 10 seconds
  DEFAULT_CONFIDENCE_THRESHOLD: 0.6,
  DETECTION_INTERVAL: 1000, // 1 second

  // Video settings
  DEFAULT_VIDEO_QUALITY: "HD",
  SUPPORTED_VIDEO_FORMATS: ["mp4", "webm", "avi"],
  SUPPORTED_AUDIO_FORMATS: ["mp3", "wav", "ogg", "m4a"],

  // UI settings
  ITEMS_PER_PAGE: 10,
  TOAST_DURATION: 4000,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_ERROR:
      "Network connection error. Please check your internet connection.",
    TIMEOUT: "Request timeout. Please try again.",
    SERVER_ERROR: "Server error. Please try again later.",
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password.",
    TOKEN_EXPIRED: "Your session has expired. Please log in again.",
    ACCESS_DENIED:
      "Access denied. You do not have permission to perform this action.",
    REGISTRATION_FAILED: "Registration failed. Please try again.",
  },
  MEDIA: {
    CAMERA_DENIED:
      "Camera access denied. Please allow camera access and try again.",
    MICROPHONE_DENIED:
      "Microphone access denied. Please allow microphone access and try again.",
    DEVICE_NOT_FOUND:
      "Camera or microphone not found. Please connect a device and try again.",
    DEVICE_IN_USE:
      "Camera or microphone is already in use by another application.",
    RECORDING_FAILED: "Recording failed. Please try again.",
    UNSUPPORTED_BROWSER:
      "Your browser does not support video recording. Please use Chrome, Firefox, or Edge.",
  },
  INTERVIEW: {
    NOT_FOUND: "Interview not found.",
    NOT_AUTHORIZED: "You are not authorized to access this interview.",
    ALREADY_STARTED: "Interview has already started.",
    NOT_STARTED: "Interview has not started yet.",
    CREATION_FAILED: "Failed to create interview. Please try again.",
  },
  VALIDATION: {
    REQUIRED_FIELD: "This field is required.",
    INVALID_EMAIL: "Please enter a valid email address.",
    WEAK_PASSWORD:
      "Password must be at least 6 characters with uppercase, lowercase, and number.",
    INVALID_DATE: "Please enter a valid date.",
    FILE_TOO_LARGE: "File size exceeds the maximum limit.",
    INVALID_FILE_TYPE: "Invalid file type.",
  },
};

// Success messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: "Login successful!",
    LOGOUT: "Logged out successfully.",
    REGISTRATION: "Account created successfully!",
  },
  INTERVIEW: {
    CREATED: "Interview scheduled successfully!",
    UPDATED: "Interview updated successfully!",
    STARTED: "Interview started successfully!",
    ENDED: "Interview completed successfully!",
    DELETED: "Interview deleted successfully!",
  },
  UPLOAD: {
    VIDEO: "Video uploaded successfully!",
    REPORT: "Report generated successfully!",
  },
  SETTINGS: {
    SAVED: "Settings saved successfully!",
  },
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Theme configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
  },
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_BETA_FEATURES: false,
  ENABLE_SCREEN_SHARING: false,
  ENABLE_CHAT: false,
};

// Browser support
export const BROWSER_SUPPORT = {
  CHROME: { min: 70, recommended: 90 },
  FIREFOX: { min: 65, recommended: 85 },
  SAFARI: { min: 12, recommended: 14 },
  EDGE: { min: 79, recommended: 90 },
};

// External service URLs
export const EXTERNAL_URLS = {
  MEDIAPIPE_MODELS: "https://storage.googleapis.com/mediapipe-models",
  TENSORFLOW_MODELS: "https://storage.googleapis.com/tfjs-models",
  CDN_BASE: "https://cdn.jsdelivr.net",
};
