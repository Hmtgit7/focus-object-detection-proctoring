import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, Play, Edit } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const UpcomingInterviews = ({ interviews = [] }) => {
  const { hasRole } = useAuth();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getTimeUntil = (dateString) => {
    const now = new Date();
    const interview = new Date(dateString);
    const diffMs = interview - now;

    if (diffMs < 0) return "Past due";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 1) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d`;
    }
  };

  const isStartingSoon = (dateString) => {
    const now = new Date();
    const interview = new Date(dateString);
    const diffMs = interview - now;
    return diffMs > 0 && diffMs <= 30 * 60 * 1000; // 30 minutes
  };

  if (interviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Interviews
        </h2>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No upcoming interviews</p>
          {hasRole("interviewer") && (
            <Link
              to="/interviews/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
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
        <h2 className="text-lg font-semibold text-gray-900">
          Upcoming Interviews
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {interviews.map((interview) => (
          <div key={interview._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/interviews/${interview._id}`}
                  className="block font-medium text-gray-900 hover:text-primary-600 truncate mb-2"
                >
                  {interview.title}
                </Link>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>
                      {hasRole("interviewer")
                        ? interview.candidate?.name
                        : interview.interviewer?.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(interview.scheduledAt)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{interview.duration} minutes</span>
                  </div>
                </div>

                {/* Time until interview */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isStartingSoon(interview.scheduledAt)
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {isStartingSoon(interview.scheduledAt) && "🔥 "}
                    Starts in {getTimeUntil(interview.scheduledAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                {isStartingSoon(interview.scheduledAt) && (
                  <Link
                    to={`/interviews/${interview._id}/join`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Join Now
                  </Link>
                )}

                {hasRole("interviewer") && (
                  <Link
                    to={`/interviews/${interview._id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-200">
        <Link
          to="/interviews"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all interviews →
        </Link>
      </div>
    </div>
  );
};

export default UpcomingInterviews;
