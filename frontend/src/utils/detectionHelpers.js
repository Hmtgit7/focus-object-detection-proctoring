// Detection threshold constants
export const DETECTION_THRESHOLDS = {
  FOCUS_LOST: 5000, // 5 seconds
  FACE_ABSENT: 10000, // 10 seconds
  MULTIPLE_FACES: 2000, // 2 seconds
  OBJECT_DETECTED: 3000, // 3 seconds
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
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

// Calculate detection severity based on confidence and duration
export const calculateSeverity = (type, confidence, duration) => {
  let severity = SEVERITY_LEVELS.LOW;

  // Base severity on confidence
  if (confidence >= 0.9) {
    severity = SEVERITY_LEVELS.HIGH;
  } else if (confidence >= 0.7) {
    severity = SEVERITY_LEVELS.MEDIUM;
  }

  // Adjust based on duration for time-based detections
  if (
    type === DETECTION_TYPES.FOCUS_LOST ||
    type === DETECTION_TYPES.FACE_ABSENT
  ) {
    if (duration > DETECTION_THRESHOLDS[type.toUpperCase()] * 2) {
      severity = SEVERITY_LEVELS.CRITICAL;
    } else if (duration > DETECTION_THRESHOLDS[type.toUpperCase()]) {
      severity =
        severity === SEVERITY_LEVELS.LOW
          ? SEVERITY_LEVELS.MEDIUM
          : SEVERITY_LEVELS.HIGH;
    }
  }

  // Critical violations
  if (
    type === DETECTION_TYPES.MULTIPLE_FACES ||
    type === DETECTION_TYPES.PHONE_DETECTED
  ) {
    severity =
      confidence >= 0.8 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH;
  }

  return severity;
};

// Calculate integrity score deduction
export const calculateScoreDeduction = (type, severity) => {
  const baseDeductions = {
    [DETECTION_TYPES.FOCUS_LOST]: {
      [SEVERITY_LEVELS.LOW]: 0.5,
      [SEVERITY_LEVELS.MEDIUM]: 1,
      [SEVERITY_LEVELS.HIGH]: 2,
      [SEVERITY_LEVELS.CRITICAL]: 3,
    },
    [DETECTION_TYPES.FACE_ABSENT]: {
      [SEVERITY_LEVELS.LOW]: 1,
      [SEVERITY_LEVELS.MEDIUM]: 2,
      [SEVERITY_LEVELS.HIGH]: 4,
      [SEVERITY_LEVELS.CRITICAL]: 6,
    },
    [DETECTION_TYPES.MULTIPLE_FACES]: {
      [SEVERITY_LEVELS.LOW]: 2,
      [SEVERITY_LEVELS.MEDIUM]: 4,
      [SEVERITY_LEVELS.HIGH]: 8,
      [SEVERITY_LEVELS.CRITICAL]: 12,
    },
    [DETECTION_TYPES.PHONE_DETECTED]: {
      [SEVERITY_LEVELS.LOW]: 3,
      [SEVERITY_LEVELS.MEDIUM]: 6,
      [SEVERITY_LEVELS.HIGH]: 12,
      [SEVERITY_LEVELS.CRITICAL]: 20,
    },
    [DETECTION_TYPES.BOOK_DETECTED]: {
      [SEVERITY_LEVELS.LOW]: 2,
      [SEVERITY_LEVELS.MEDIUM]: 4,
      [SEVERITY_LEVELS.HIGH]: 8,
      [SEVERITY_LEVELS.CRITICAL]: 15,
    },
    [DETECTION_TYPES.DEVICE_DETECTED]: {
      [SEVERITY_LEVELS.LOW]: 2,
      [SEVERITY_LEVELS.MEDIUM]: 5,
      [SEVERITY_LEVELS.HIGH]: 10,
      [SEVERITY_LEVELS.CRITICAL]: 18,
    },
    [DETECTION_TYPES.DROWSINESS_DETECTED]: {
      [SEVERITY_LEVELS.LOW]: 1,
      [SEVERITY_LEVELS.MEDIUM]: 2,
      [SEVERITY_LEVELS.HIGH]: 4,
      [SEVERITY_LEVELS.CRITICAL]: 6,
    },
    [DETECTION_TYPES.AUDIO_VIOLATION]: {
      [SEVERITY_LEVELS.LOW]: 1,
      [SEVERITY_LEVELS.MEDIUM]: 3,
      [SEVERITY_LEVELS.HIGH]: 6,
      [SEVERITY_LEVELS.CRITICAL]: 10,
    },
  };

  return baseDeductions[type]?.[severity] || 1;
};

// Format detection message for display
export const formatDetectionMessage = (type, details = {}) => {
  const messages = {
    [DETECTION_TYPES.FOCUS_LOST]: `Focus lost for ${Math.round(
      (details.duration || 0) / 1000
    )}s`,
    [DETECTION_TYPES.FACE_ABSENT]: `No face detected for ${Math.round(
      (details.duration || 0) / 1000
    )}s`,
    [DETECTION_TYPES.MULTIPLE_FACES]: `${
      details.faceCount || 2
    } faces detected`,
    [DETECTION_TYPES.PHONE_DETECTED]: `Mobile phone detected (${Math.round(
      (details.confidence || 0) * 100
    )}% confidence)`,
    [DETECTION_TYPES.BOOK_DETECTED]: `Books/notes detected (${Math.round(
      (details.confidence || 0) * 100
    )}% confidence)`,
    [DETECTION_TYPES.DEVICE_DETECTED]: `Electronic device detected (${Math.round(
      (details.confidence || 0) * 100
    )}% confidence)`,
    [DETECTION_TYPES.DROWSINESS_DETECTED]: `Signs of drowsiness detected`,
    [DETECTION_TYPES.AUDIO_VIOLATION]: `Background audio detected`,
  };

  return messages[type] || "Suspicious activity detected";
};

// Get detection icon name
export const getDetectionIcon = (type) => {
  const icons = {
    [DETECTION_TYPES.FOCUS_LOST]: "eye-off",
    [DETECTION_TYPES.FACE_ABSENT]: "user-x",
    [DETECTION_TYPES.MULTIPLE_FACES]: "users",
    [DETECTION_TYPES.PHONE_DETECTED]: "smartphone",
    [DETECTION_TYPES.BOOK_DETECTED]: "book-open",
    [DETECTION_TYPES.DEVICE_DETECTED]: "monitor",
    [DETECTION_TYPES.DROWSINESS_DETECTED]: "moon",
    [DETECTION_TYPES.AUDIO_VIOLATION]: "volume-2",
  };

  return icons[type] || "alert-triangle";
};

// Debounce function for detection events
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for high-frequency events
export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Validate detection data
export const validateDetectionData = (data) => {
  const required = ["type", "confidence", "timestamp"];
  const missing = required.filter((field) => !(field in data));

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (!Object.values(DETECTION_TYPES).includes(data.type)) {
    throw new Error(`Invalid detection type: ${data.type}`);
  }

  if (data.confidence < 0 || data.confidence > 1) {
    throw new Error("Confidence must be between 0 and 1");
  }

  return true;
};

// Calculate detection statistics
export const calculateDetectionStats = (detectionLogs) => {
  const stats = {
    total: detectionLogs.length,
    byType: {},
    bySeverity: {},
    avgConfidence: 0,
    timespan: 0,
  };

  if (detectionLogs.length === 0) return stats;

  // Calculate by type and severity
  detectionLogs.forEach((log) => {
    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
  });

  // Average confidence
  stats.avgConfidence =
    detectionLogs.reduce((sum, log) => sum + log.confidence, 0) /
    detectionLogs.length;

  // Timespan
  const timestamps = detectionLogs.map((log) =>
    new Date(log.timestamp).getTime()
  );
  stats.timespan = Math.max(...timestamps) - Math.min(...timestamps);

  return stats;
};
