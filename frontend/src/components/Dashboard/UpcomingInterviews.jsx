import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Play } from 'lucide-react';

const UpcomingInterviews = ({ interviews = [] }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilInterview = (scheduledAt) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled - now;
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} away`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m away`;
    } else {
      return `${minutes}m away`;
    }
  };

  const getUrgencyColor = (scheduledAt) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled - now;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return 'text-red-600';
    if (hours < 24) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Upcoming Interviews</h3>
      </div>
      
      {interviews.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No upcoming interviews</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {interviews.map((interview) => (
            <div key={interview._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {interview.title}
                    </p>
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {interview.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <p>{formatDate(interview.scheduledAt)}</p>
                    <span className="mx-2">•</span>
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <p>{interview.duration} min</p>
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs font-medium ${getUrgencyColor(interview.scheduledAt)}`}>
                      {getTimeUntilInterview(interview.scheduledAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/interviews/${interview._id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {interviews.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <Link
            to="/interviews"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all interviews →
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingInterviews;
