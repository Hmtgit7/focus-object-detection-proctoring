import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { reportAPI, handleAPIError } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Common/Loading";
import ReportViewer from "../components/Dashboard/ReportViewer";

const Reports = () => {
  const { hasRole } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    minScore: "",
    maxScore: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReports();
  }, [pagination.page, filters]);

  const loadReports = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        ),
      };

      const response = await reportAPI.getAll(params);
      setReports(response.data.reports);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
      setError(null);
    } catch (error) {
      const errorData = handleAPIError(error);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDownloadPDF = async (interviewId, fileName) => {
    try {
      const response = await reportAPI.downloadPDF(interviewId);

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `interview-report-${interviewId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorData = handleAPIError(error);
      alert(errorData.message);
    }
  };

  const handleDownloadCSV = async (interviewId, fileName) => {
    try {
      const response = await reportAPI.downloadCSV(interviewId);

      // Create blob and download
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `interview-data-${interviewId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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

  const getScoreIcon = (score) => {
    if (score >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
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

  if (loading && reports.length === 0) {
    return <Loading fullScreen text="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Interview Reports
          </h1>
          <p className="text-gray-600 mt-1">
            View and download detailed interview analysis reports
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Interview title or participant"
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Integrity Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => handleFilterChange("minScore", e.target.value)}
                placeholder="0-100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                setFilters({
                  search: "",
                  dateFrom: "",
                  dateTo: "",
                  status: "",
                  minScore: "",
                  maxScore: "",
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {reports.length === 0 && !loading ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-600">
            {Object.values(filters).some(Boolean)
              ? "Try adjusting your filters to see more results."
              : "Complete some interviews to generate reports."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integrity Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Violations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.duration} minutes
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {hasRole("interviewer")
                            ? report.candidate?.name
                            : report.interviewer?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(report.scheduledAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getScoreIcon(report.integrityScore)}
                        <span
                          className={`text-sm font-medium ${getScoreColor(
                            report.integrityScore
                          )}`}
                        >
                          {report.integrityScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {report.detectionCount || 0} detected
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() =>
                          handleDownloadPDF(
                            report._id,
                            `${report.title}-report.pdf`
                          )
                        }
                        className="text-green-600 hover:text-green-900 inline-flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() =>
                          handleDownloadCSV(
                            report._id,
                            `${report.title}-data.csv`
                          )
                        }
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>CSV</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
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
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page }))
                          }
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

      {/* Report Viewer Modal */}
      {selectedReport && (
        <ReportViewer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default Reports;
