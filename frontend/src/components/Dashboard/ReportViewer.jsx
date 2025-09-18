import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  FileText,
  Clock,
  User,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { reportAPI, handleAPIError } from "../../services/api";

const ReportViewer = ({ report, onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (report) {
      loadReportData();
    }
  }, [report]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getStats(report._id);
      setReportData(response.data);
      setError(null);
    } catch (error) {
      const errorData = handleAPIError(error);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await reportAPI.downloadPDF(report._id);
    } catch (error) {
      const errorData = handleAPIError(error);
      alert(errorData.message);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await reportAPI.downloadCSV(report._id);
    } catch (error) {
      const errorData = handleAPIError(error);
      alert(errorData.message);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 70) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Interview Report
            </h2>
            <p className="text-gray-600 mt-1">{report.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading report data...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interview Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Participant
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {reportData?.interview?.candidate?.name}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Duration
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {report.duration} minutes
                  </p>
                </div>

                <div
                  className={`rounded-lg p-4 border ${getScoreBgColor(
                    report.integrityScore
                  )}`}
                >
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Integrity Score
                    </span>
                  </div>
                  <p
                    className={`text-2xl font-bold mt-1 ${getScoreColor(
                      report.integrityScore
                    )}`}
                  >
                    {report.integrityScore}%
                  </p>
                </div>
              </div>

              {/* Statistics */}
              {reportData?.stats && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detection Summary
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.stats.totalViolations || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Violations</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.stats.focusAnalysis?.totalFocusLost || 0}
                      </p>
                      <p className="text-sm text-gray-600">Focus Lost Events</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {
                          Object.keys(reportData.stats.violationsByType || {})
                            .length
                        }
                      </p>
                      <p className="text-sm text-gray-600">Violation Types</p>
                    </div>

                    <div className="text-center">
                      <p
                        className={`text-2xl font-bold ${
                          (reportData.stats.focusAnalysis?.focusPercentage ||
                            100) >= 80
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.round(
                          reportData.stats.focusAnalysis?.focusPercentage || 100
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Focus Percentage</p>
                    </div>
                  </div>

                  {/* Violation Breakdown */}
                  {reportData.stats.violationsByType &&
                    Object.keys(reportData.stats.violationsByType).length >
                      0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Violations by Type
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(
                            reportData.stats.violationsByType
                          ).map(([type, count]) => (
                            <div
                              key={type}
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                            >
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {type.replace("_", " ")}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Timeline (if available) */}
              {reportData?.stats?.timeline &&
                reportData.stats.timeline.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Violations
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {reportData.stats.timeline
                        .slice(0, 10)
                        .map((event, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded"
                          >
                            <div className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {event.type.replace("_", " ")}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(event.confidence * 100)}% confidence
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
