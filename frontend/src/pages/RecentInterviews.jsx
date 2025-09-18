import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const RecentInterviews = ({ interviews = [] }) => {
  const { hasRole } = useAuth();

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "scheduled":
        return <Calendar className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIntegrityScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (interviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Interviews
        </h2>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent interviews found</p>
          {hasRole("interviewer") && (
            <Link
              to="/interviews/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Schedule Interview
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Interviews
          </h2>
          <Link
            to="/interviews"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {interviews.map((interview) => (
          <div
            key={interview._id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(interview.status)}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/interviews/${interview._id}`}
                      className="block font-medium text-gray-900 hover:text-primary-600 truncate"
                    >
                      {interview.title}
                    </Link>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>
                          {hasRole("interviewer")
                            ? interview.candidate?.name
                            : interview.interviewer?.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(interview.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{interview.duration} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-4">
                {/* Integrity Score */}
                {interview.status === "completed" && (
                  <div className="text-center">
                    <div
                      className={`text-lg font-semibold ${getIntegrityScoreColor(
                        interview.integrityScore
                      )}`}
                    >
                      {interview.integrityScore}%
                    </div>
                    <div className="text-xs text-gray-500">Integrity</div>
                  </div>
                )}

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    interview.status
                  )}`}
                >
                  {interview.status.replace("-", " ").toUpperCase()}
                </span>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/interviews/${interview._id}`}
                    className="text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <FileText className="h-5 w-5" />
                  </Link>

                  {interview.status === "completed" && (
                    <Link
                      to={`/reports/${interview._id}`}
                      className="text-gray-400 hover:text-gray-600"
                      title="View Report"
                    >
                      <FileText className="h-5 w-5" />
                    </Link>
                  )}

                  {interview.integrityScore < 70 && (
                    <AlertTriangle
                      className="h-5 w-5 text-yellow-500"
                      title="Low Integrity Score"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInterviews;
