import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Eye,
  Users,
  Smartphone,
  BookOpen,
  X,
} from "lucide-react";

const AlertsPanel = ({ alerts = [], currentScore = 100, className = "" }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const getAlertIcon = (type) => {
    switch (type) {
      case "focus_lost":
        return <Eye className="h-4 w-4" />;
      case "face_absent":
        return <Eye className="h-4 w-4" />;
      case "multiple_faces":
        return <Users className="h-4 w-4" />;
      case "phone_detected":
        return <Smartphone className="h-4 w-4" />;
      case "book_detected":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "border-l-blue-400 bg-blue-50 text-blue-800";
      case "medium":
        return "border-l-yellow-400 bg-yellow-50 text-yellow-800";
      case "high":
        return "border-l-orange-400 bg-orange-50 text-orange-800";
      case "critical":
        return "border-l-red-400 bg-red-50 text-red-800";
      default:
        return "border-l-gray-400 bg-gray-50 text-gray-800";
    }
  };

  const dismissAlert = (alertIndex) => {
    setDismissedAlerts((prev) => new Set([...prev, alertIndex]));
  };

  const visibleAlerts = alerts.filter(
    (_, index) => !dismissedAlerts.has(index)
  );

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Interview Monitor
          </h3>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                currentScore >= 90
                  ? "text-green-600"
                  : currentScore >= 70
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {currentScore}%
            </div>
            <div className="text-xs text-gray-500">Integrity Score</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">All clear - no violations detected</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {visibleAlerts.map((alert, index) => (
              <div
                key={index}
                className={`border-l-4 p-3 rounded-r-lg ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="font-medium">
                        {alert.type.replace("_", " ").toUpperCase()}
                      </h4>
                      <p className="text-sm opacity-75">
                        {alert.message || getAlertDescription(alert.type)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs opacity-60">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>
                          {Math.round(alert.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => dismissAlert(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getAlertDescription = (type) => {
  switch (type) {
    case "focus_lost":
      return "Candidate not looking at the screen";
    case "face_absent":
      return "No face detected in video frame";
    case "multiple_faces":
      return "Multiple people detected";
    case "phone_detected":
      return "Mobile device detected";
    case "book_detected":
      return "Books or notes detected";
    default:
      return "Suspicious activity detected";
  }
};

export default AlertsPanel;
