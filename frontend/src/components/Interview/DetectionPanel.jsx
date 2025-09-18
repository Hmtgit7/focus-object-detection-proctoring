import React, { useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Users,
  Smartphone,
  BookOpen,
  Monitor,
  Volume2,
  TrendingDown,
  TrendingUp,
  Info,
} from "lucide-react";

const DetectionPanel = ({
  detectionResults = {},
  realTimeAlerts = [],
  showDetails = true,
  className = "",
}) => {
  const [expandedSections, setExpandedSections] = useState({
    focus: true,
    objects: true,
    alerts: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "focus_lost":
        return <EyeOff className="h-4 w-4" />;
      case "face_absent":
        return <Eye className="h-4 w-4" />;
      case "multiple_faces":
        return <Users className="h-4 w-4" />;
      case "phone_detected":
        return <Smartphone className="h-4 w-4" />;
      case "book_detected":
        return <BookOpen className="h-4 w-4" />;
      case "device_detected":
        return <Monitor className="h-4 w-4" />;
      case "audio_violation":
        return <Volume2 className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getFocusScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Detection Monitor
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Focus Analysis Section */}
        <div>
          <button
            onClick={() => toggleSection("focus")}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Focus Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-2xl font-bold ${getFocusScoreColor(
                  detectionResults.focus?.score || 100
                )}`}
              >
                {detectionResults.focus?.score || 100}%
              </span>
              {expandedSections.focus ? (
                <TrendingUp className="h-4 w-4 text-gray-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSections.focus && (
            <div className="mt-3 space-y-3 pl-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Faces Detected:</span>
                  <span
                    className={`ml-2 font-medium ${
                      detectionResults.focus?.faceCount === 1
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {detectionResults.focus?.faceCount || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Looking Away:</span>
                  <span
                    className={`ml-2 font-medium ${
                      detectionResults.focus?.isFocused
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {detectionResults.focus?.isFocused ? "No" : "Yes"}
                  </span>
                </div>
              </div>

              {/* Focus Score Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Focus Quality</span>
                  <span>{detectionResults.focus?.score || 100}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (detectionResults.focus?.score || 100) >= 80
                        ? "bg-green-500"
                        : (detectionResults.focus?.score || 100) >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${detectionResults.focus?.score || 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Object Detection Section */}
        <div>
          <button
            onClick={() => toggleSection("objects")}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Object Detection
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-lg font-bold ${
                  (detectionResults.objects?.violations?.length || 0) === 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {detectionResults.objects?.violations?.length || 0} Issues
              </span>
              {expandedSections.objects ? (
                <TrendingUp className="h-4 w-4 text-gray-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSections.objects && (
            <div className="mt-3 space-y-2 pl-4">
              {detectionResults.objects?.violations?.length > 0 ? (
                detectionResults.objects.violations.map((violation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200"
                  >
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(violation.type)}
                      <span className="text-sm font-medium text-red-800">
                        {violation.object || violation.type.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-xs text-red-600">
                      {Math.round(violation.confidence * 100)}% confidence
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    No violations detected
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Alerts Section */}
        <div>
          <button
            onClick={() => toggleSection("alerts")}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Recent Alerts</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {realTimeAlerts.length} alerts
              </span>
              {expandedSections.alerts ? (
                <TrendingUp className="h-4 w-4 text-gray-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </button>

          {expandedSections.alerts && (
            <div className="mt-3 space-y-2 pl-4 max-h-64 overflow-y-auto">
              {realTimeAlerts.length > 0 ? (
                realTimeAlerts.slice(0, 10).map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded border ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.type)}
                      <div>
                        <span className="text-sm font-medium">
                          {alert.type.replace("_", " ").toUpperCase()}
                        </span>
                        {alert.details && (
                          <p className="text-xs opacity-75">
                            {alert.details.duration &&
                              `Duration: ${alert.details.duration}ms`}
                            {alert.details.object &&
                              `Object: ${alert.details.object}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-75">
                        {formatTimestamp(alert.timestamp)}
                      </div>
                      <div className="text-xs font-medium">
                        {alert.severity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <Info className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    No recent alerts
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detection Status Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Last updated:{" "}
            {formatTimestamp(detectionResults.timestamp || Date.now())}
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live monitoring active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionPanel;
