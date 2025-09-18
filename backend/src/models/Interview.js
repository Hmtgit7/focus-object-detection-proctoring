const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Interview title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate is required"],
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Interviewer is required"],
    },
    scheduledAt: {
      type: Date,
      required: [true, "Interview schedule time is required"],
    },
    duration: {
      type: Number,
      required: [true, "Interview duration is required"],
      min: [5, "Minimum duration is 5 minutes"],
      max: [180, "Maximum duration is 180 minutes"],
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    videoRecording: {
      filename: String,
      path: String,
      size: Number,
      duration: Number,
    },
    settings: {
      enableFocusDetection: {
        type: Boolean,
        default: true,
      },
      enableObjectDetection: {
        type: Boolean,
        default: true,
      },
      enableAudioDetection: {
        type: Boolean,
        default: false,
      },
      focusThreshold: {
        type: Number,
        default: 5000, // 5 seconds
        min: 1000,
      },
      absenceThreshold: {
        type: Number,
        default: 10000, // 10 seconds
        min: 5000,
      },
    },
    integrityScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
interviewSchema.index({ candidate: 1, scheduledAt: -1 });
interviewSchema.index({ interviewer: 1, status: 1 });
interviewSchema.index({ scheduledAt: 1, status: 1 });

// Virtual for detection logs
interviewSchema.virtual("detectionLogs", {
  ref: "DetectionLog",
  localField: "_id",
  foreignField: "interview",
});

module.exports = mongoose.model("Interview", interviewSchema);
