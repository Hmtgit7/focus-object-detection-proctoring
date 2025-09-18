import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  FileText,
} from "lucide-react";
import { useInterview } from "../../contexts/InterviewContext";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../Common/Loading";

const InterviewList = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const {
    interviews,
    loading,
    error,
    fetchInterviews,
    deleteInterview,
    pagination,
    setPagination,
    filters,
    setFilters,
  } = useInterview();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setFilters({ ...filters, search: term });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setFilters({ ...filters, status });
  };

  const handleDelete = async (interviewId) => {
    if (window.confirm("Are you sure you want to delete this interview?")) {
      const result = await deleteInterview(interviewId);
      if (result.success) {
        fetchInterviews(); // Refresh list
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: "bg-blue-100 text-blue-800",
      "in-progress": "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          badges[status] || badges.scheduled
        }`}
      >
        {status.replace("-", " ").toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canStartInterview = (interview) => {
    const now = new Date();
    const scheduled = new Date(interview.scheduledAt);
    const timeDiff = scheduled - now;
    return timeDiff <= 30 * 60 * 1000 && timeDiff >= -15 * 60 * 1000; // 30 min before to 15 min after
  };

  if (loading && interviews.length === 0) {
    return <Loading fullScreen text="Loading interviews..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600 mt-1">
            Manage your interview sessions and view results
          </p>
        </div>

        {hasRole("interviewer") && (
          <Link
            to="/interviews/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No interviews found
          </h3>
          <p className="text-gray-600 mb-6">
            {hasRole("interviewer")
              ? "Get started by scheduling your first interview."
              : "You don't have any interviews scheduled yet."}
          </p>
          {hasRole("interviewer") && (
            <Link
              to="/interviews/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {interviews.map((interview) => (
              <li key={interview._id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/interviews/${interview._id}`}
                          className="text-lg font-medium text-primary-600 hover:text-primary-500 truncate"
                        >
                          {interview.title}
                        </Link>
                        {getStatusBadge(interview.status)}
                      </div>

                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-6">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>
                            {hasRole("interviewer")
                              ? interview.candidate?.name
                              : interview.interviewer?.name}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>{formatDate(interview.scheduledAt)}</span>
                        </div>

                        <div className="flex items-center">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>{interview.duration} min</span>
                        </div>

                        {interview.status === "completed" && (
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              Score:{" "}
                              <span
                                className={`${
                                  interview.integrityScore >= 90
                                    ? "text-green-600"
                                    : interview.integrityScore >= 70
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {interview.integrityScore}%
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {/* Join/Start Button */}
                      {interview.status === "scheduled" &&
                        canStartInterview(interview) && (
                          <Link
                            to={`/interviews/${interview._id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {hasRole("interviewer") ? "Start" : "Join"}
                          </Link>
                        )}

                      {/* View Button */}
                      <Link
                        to={`/interviews/${interview._id}`}
                        className="text-gray-400 hover:text-gray-500"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* Edit Button (Interviewer only) */}
                      {hasRole("interviewer") &&
                        interview.status === "scheduled" && (
                          <Link
                            to={`/interviews/${interview._id}/edit`}
                            className="text-gray-400 hover:text-gray-500"
                            title="Edit Interview"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}

                      {/* Report Button */}
                      {interview.status === "completed" && (
                        <Link
                          to={`/reports/${interview._id}`}
                          className="text-gray-400 hover:text-gray-500"
                          title="View Report"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                      )}

                      {/* Delete Button (Interviewer only) */}
                      {hasRole("interviewer") && (
                        <button
                          onClick={() => handleDelete(interview._id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete Interview"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </p>
                  </div>

                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from(
                        { length: pagination.pages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setPagination({ ...pagination, page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewList;
