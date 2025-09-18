import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { reportAPI } from '../../services/api';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';

const ReportDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getById(id);
      setReport(response.data.report);
    } catch (err) {
      setError('Failed to fetch report details');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await reportAPI.download(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download report');
      console.error('Error downloading report:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchReport}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Report not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested report could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Interview Report</h1>
        <p className="mt-2 text-gray-600">Detailed analysis of interview session</p>
      </div>

      {/* Report Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{report.interview?.title}</h2>
            <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(report.createdAt)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(report.duration)}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {report.participantCount} participants
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Violations</p>
              <p className="text-2xl font-semibold text-gray-900">{report.totalViolations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Eye Tracking Score</p>
              <p className="text-2xl font-semibold text-gray-900">{report.eyeTrackingScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Focus Score</p>
              <p className="text-2xl font-semibold text-gray-900">{report.focusScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Score</p>
              <p className="text-2xl font-semibold text-gray-900">{report.overallScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Violations Timeline */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Violations Timeline</h3>
        {report.violations && report.violations.length > 0 ? (
          <div className="space-y-4">
            {report.violations.map((violation, index) => (
              <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{violation.type}</p>
                    <p className="text-sm text-gray-500">{violation.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.severity)}`}>
                      {violation.severity}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDuration(violation.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No violations detected during this interview.</p>
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Eye Tracking Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Focus Duration</span>
              <span className="text-sm font-medium">{formatDuration(report.eyeTrackingData?.focusDuration || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Distraction Count</span>
              <span className="text-sm font-medium">{report.eyeTrackingData?.distractionCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Focus Time</span>
              <span className="text-sm font-medium">{report.eyeTrackingData?.avgFocusTime || 0}s</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Object Detection</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Suspicious Objects</span>
              <span className="text-sm font-medium">{report.objectDetectionData?.suspiciousObjects || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phone Detections</span>
              <span className="text-sm font-medium">{report.objectDetectionData?.phoneDetections || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Book Detections</span>
              <span className="text-sm font-medium">{report.objectDetectionData?.bookDetections || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
