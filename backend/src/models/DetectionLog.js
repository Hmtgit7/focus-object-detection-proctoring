const mongoose = require("mongoose");

const detectionLogSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: [true, "Interview reference is required"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "focus_lost",
        "face_absent",
        "multiple_faces",
        "phone_detected",
        "book_detected",
        "device_detected",
        "drowsiness_detected",
        "audio_violation",
      ],
      required: [true, "Detection type is required"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: [true, "Severity level is required"],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: [true, "Confidence score is required"],
    },
    details: {
      duration: Number, // Duration of the event in milliseconds
      coordinates: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
      },
      objectClass: String, // For object detection
      faceCount: Number, // For multiple faces
      additionalData: mongoose.Schema.Types.Mixed,
    },
    action: {
      type: String,
      enum: ["logged", "warned", "flagged", "terminated"],
      default: "logged",
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
detectionLogSchema.index({ interview: 1, timestamp: -1 });
detectionLogSchema.index({ type: 1, severity: 1 });
detectionLogSchema.index({ timestamp: -1 });

// Calculate score deduction based on violation type and severity
detectionLogSchema.methods.calculateScoreDeduction = function () {
  const baseDeductions = {
    focus_lost: { low: 0.5, medium: 1, high: 2, critical: 3 },
    face_absent: { low: 1, medium: 2, high: 4, critical: 6 },
    multiple_faces: { low: 2, medium: 4, high: 8, critical: 12 },
    phone_detected: { low: 3, medium: 6, high: 12, critical: 20 },
    book_detected: { low: 2, medium: 4, high: 8, critical: 15 },
    device_detected: { low: 2, medium: 5, high: 10, critical: 18 },
    drowsiness_detected: { low: 1, medium: 2, high: 4, critical: 6 },
    audio_violation: { low: 1, medium: 3, high: 6, critical: 10 },
  };

  return baseDeductions[this.type]?.[this.severity] || 1;
};

module.exports = mongoose.model("DetectionLog", detectionLogSchema);
