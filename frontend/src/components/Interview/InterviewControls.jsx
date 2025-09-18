import React, { useState } from "react";
import {
  Play,
  Square,
  Pause,
  Settings,
  Download,
  FileText,
  AlertTriangle,
  Clock,
  Users,
} from "lucide-react";

const InterviewControls = ({
  interview,
  isStarted,
  onStart,
  onPause,
  onEnd,
  canControl = false,
  status = "waiting",
}) => {
  console.log("🎮 InterviewControls props:", { 
    isStarted, 
    canControl, 
    status, 
    interviewId: interview?._id,
    interviewStatus: interview?.status,
    shouldShowStartButton: canControl && !isStarted,
    hasRoleInterviewer: canControl
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (onPause) onPause(!isPaused);
  };

  const handleEnd = () => {
    if (window.confirm("Are you sure you want to end this interview?")) {
      if (onEnd) onEnd();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "in-progress":
        return "text-green-600";
      case "paused":
        return "text-yellow-600";
      case "completed":
        return "text-gray-600";
      default:
        return "text-blue-600";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "in-progress":
        return isPaused ? "Paused" : "Recording";
      case "completed":
        return "Completed";
      case "waiting":
        return "Ready to Start";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Status & Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                status === "in-progress"
                  ? "bg-red-500 animate-pulse"
                  : status === "completed"
                  ? "bg-gray-400"
                  : "bg-blue-500"
              }`}
            ></div>
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Interview Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{interview.duration} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>1-on-1</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Recording Controls (for interviewers) */}
          {canControl && (
            <div className="flex items-center space-x-2">
              {!isStarted ? (
                <button
                  onClick={onStart}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Interview</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePause}
                    className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Pause className="h-4 w-4" />
                    <span>{isPaused ? "Resume" : "Pause"}</span>
                  </button>

                  <button
                    onClick={handleEnd}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="h-4 w-4" />
                    <span>End</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Download Recording (if completed) */}
          {status === "completed" && interview.videoRecording && (
            <button
              onClick={() =>
                window.open(`/api/interviews/${interview._id}/download-video`)
              }
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          )}

          {/* View Report (if completed) */}
          {status === "completed" && (
            <button
              onClick={() => window.open(`/reports/${interview._id}`, "_blank")}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>View Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Detection Settings</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Focus Threshold
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  value={interview.settings?.focusThreshold || 5000}
                  className="flex-1"
                  disabled={isStarted}
                />
                <span className="text-xs text-gray-600">
                  {(interview.settings?.focusThreshold || 5000) / 1000}s
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Absence Threshold
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="5000"
                  max="30000"
                  value={interview.settings?.absenceThreshold || 10000}
                  className="flex-1"
                  disabled={isStarted}
                />
                <span className="text-xs text-gray-600">
                  {(interview.settings?.absenceThreshold || 10000) / 1000}s
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={interview.settings?.enableFocusDetection ?? true}
                disabled={isStarted}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Focus Detection</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={interview.settings?.enableObjectDetection ?? true}
                disabled={isStarted}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Object Detection</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={interview.settings?.enableAudioDetection ?? false}
                disabled={isStarted}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Audio Detection</span>
            </label>
          </div>

          {isStarted && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Settings cannot be changed during an active interview
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interview Guidelines (for candidates) */}
      {!canControl && !isStarted && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">
            Interview Guidelines
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
              <span>Maintain eye contact with the camera</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
              <span>Ensure your face is clearly visible</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
              <span>Keep mobile phones and notes out of view</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
              <span>Stay in a quiet, well-lit environment</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewControls;
