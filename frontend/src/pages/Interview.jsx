import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Clock, 
  AlertTriangle,
  Settings,
  Play,
  Square,
  Download
} from 'lucide-react';
import { useInterview } from '../contexts/InterviewContext';
import { useAuth } from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import VideoStream from '../components/Interview/VideoStream';
import DetectionPanel from '../components/Interview/DetectionPanel';
import InterviewControls from '../components/Interview/InterviewControls';
import AlertsPanel from '../components/Interview/AlertsPanel';
import Loading from '../components/Common/Loading';

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { currentInterview, fetchInterview, startInterview, endInterview, loading, error } = useInterview();
  const { socket, isConnected, joinInterview, leaveInterview } = useSocket();
  
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState('waiting');
  const [detectionResults, setDetectionResults] = useState({});
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [interviewTimer, setInterviewTimer] = useState(0);
  
  const timerRef = useRef(null);

  // Load interview data
  useEffect(() => {
    if (id) {
      console.log("📋 Fetching interview data for ID:", id);
      fetchInterview(id);
    }

    // Cleanup when component unmounts
    return () => {
      console.log("🧹 Cleaning up interview component");
    };
  }, [id, fetchInterview]);

  // Sync local state with interview status when interview data loads
  useEffect(() => {
    if (currentInterview) {
      console.log("🔄 Syncing local state with interview status:", currentInterview.status);
      
      // Update interview status based on server data
      if (currentInterview.status === 'in-progress') {
        setIsInterviewStarted(true);
        setInterviewStatus('in-progress');
      } else if (currentInterview.status === 'completed') {
        setIsInterviewStarted(false);
        setInterviewStatus('completed');
        // Clear timer if interview is completed
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (currentInterview.status === 'scheduled') {
        setIsInterviewStarted(false);
        setInterviewStatus('waiting');
      }
    }
  }, [currentInterview]);

  // Join socket room when interview loads
  useEffect(() => {
    if (currentInterview && isConnected) {
      console.log("🎯 Joining interview room:", currentInterview._id);
      joinInterview(currentInterview._id);
    }

    return () => {
      if (currentInterview) {
        console.log("🚪 Leaving interview room:", currentInterview._id);
        leaveInterview(currentInterview._id);
      }
    };
  }, [currentInterview?._id, isConnected, joinInterview, leaveInterview]);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      // Interview events
      socket.on('interview_started', handleInterviewStarted);
      socket.on('interview_ended', handleInterviewEnded);
      socket.on('user_joined', handleUserJoined);
      socket.on('user_left', handleUserLeft);
      socket.on('detection_alert', handleDetectionAlert);
      socket.on('critical_alert', handleCriticalAlert);

      return () => {
        socket.off('interview_started', handleInterviewStarted);
        socket.off('interview_ended', handleInterviewEnded);
        socket.off('user_joined', handleUserJoined);
        socket.off('user_left', handleUserLeft);
        socket.off('detection_alert', handleDetectionAlert);
        socket.off('critical_alert', handleCriticalAlert);
      };
    }
  }, [socket]);

  // Interview timer
  useEffect(() => {
    if (isInterviewStarted) {
      timerRef.current = setInterval(() => {
        setInterviewTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewStarted]);

  const handleInterviewStarted = (data) => {
    setIsInterviewStarted(true);
    setInterviewStatus('in-progress');
    setInterviewTimer(0);
  };

  const handleInterviewEnded = (data) => {
    console.log("🛑 Interview ended via socket:", data);
    setIsInterviewStarted(false);
    setInterviewStatus('completed');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Refresh interview data to ensure status is synchronized
    if (id) {
      fetchInterview(id);
    }
  };

  const handleUserJoined = (data) => {
    setParticipants(prev => [...prev, data]);
  };

  const handleUserLeft = (data) => {
    setParticipants(prev => prev.filter(p => p.userId !== data.userId));
  };

  const handleDetectionAlert = (data) => {
    setDetectionResults(prev => ({
      ...prev,
      [data.type]: data
    }));
    
    setRealTimeAlerts(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 alerts
  };

  const handleCriticalAlert = (data) => {
    setRealTimeAlerts(prev => [{ ...data, critical: true }, ...prev.slice(0, 49)]);
    
    // Show browser notification for critical alerts
    if (Notification.permission === 'granted') {
      new Notification('Critical Alert', {
        body: data.message,
        icon: '/favicon.ico'
      });
    }
  };

  const handleStartInterview = async () => {
    if (currentInterview && hasRole('interviewer')) {
      const result = await startInterview(currentInterview._id);
      if (result.success) {
        setIsInterviewStarted(true);
        setInterviewStatus('in-progress');
      }
    }
  };

  const handleEndInterview = async () => {
    console.log("🛑 Attempting to end interview:", {
      currentInterview: currentInterview?._id,
      hasRoleInterviewer: hasRole('interviewer'),
      isInterviewStarted,
      interviewStatus
    });
    
    if (currentInterview && hasRole('interviewer')) {
      try {
        const result = await endInterview(currentInterview._id);
        console.log("🛑 End interview result:", result);
        
        if (result.success) {
          setIsInterviewStarted(false);
          setInterviewStatus('completed');
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          console.log("✅ Interview ended successfully");
          // Refresh interview data to ensure status is synchronized
          if (id) {
            fetchInterview(id);
          }
        } else {
          console.error("❌ Failed to end interview:", result.error);
        }
      } catch (error) {
        console.error("❌ Error ending interview:", error);
      }
    } else {
      console.warn("⚠️ Cannot end interview - missing requirements:", {
        hasCurrentInterview: !!currentInterview,
        hasRoleInterviewer: hasRole('interviewer')
      });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInterviewProgress = () => {
    if (!currentInterview || !isInterviewStarted) return 0;
    const maxDuration = currentInterview.duration * 60; // Convert to seconds
    return Math.min((interviewTimer / maxDuration) * 100, 100);
  };

  console.log("🔍 Interview page state:", { 
    loading, 
    error, 
    currentInterview: currentInterview ? { 
      id: currentInterview._id, 
      title: currentInterview.title,
      status: currentInterview.status,
      interviewer: currentInterview.interviewer,
      candidate: currentInterview.candidate
    } : null, 
    isConnected,
    interviewId: id,
    user: user ? { id: user._id, name: user.name, role: user.role } : null,
    hasRoleInterviewer: hasRole('interviewer'),
    isInterviewStarted,
    interviewStatus,
    canControl: hasRole('interviewer'),
    shouldShowStartButton: hasRole('interviewer') && !isInterviewStarted
  });

  if (loading) {
    return <Loading fullScreen text="Loading interview..." />;
  }

  if (error || !currentInterview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Interview Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The requested interview could not be found.'}
          </p>
          <button
            onClick={() => navigate('/interviews')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Interview Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentInterview.title}
              </h1>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {hasRole('interviewer') 
                      ? `Candidate: ${currentInterview.candidate?.name}`
                      : `Interviewer: ${currentInterview.interviewer?.name}`
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {currentInterview.duration} min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Interview Timer */}
            {isInterviewStarted && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(interviewTimer)}
                </div>
                <div className="text-xs text-gray-500">
                  {currentInterview.duration} min session
                </div>
                {/* Progress Bar */}
                <div className="w-24 h-1 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-1 bg-primary-600 rounded-full transition-all duration-1000"
                    style={{ width: `${getInterviewProgress()}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              interviewStatus === 'in-progress' 
                ? 'bg-green-100 text-green-800'
                : interviewStatus === 'completed'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {interviewStatus === 'in-progress' && '🔴 LIVE'}
              {interviewStatus === 'completed' && 'Completed'}
              {interviewStatus === 'waiting' && 'Waiting to Start'}
            </span>

            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              } ${isConnected ? 'animate-pulse' : ''}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interview Interface */}
      <div className="flex h-screen">
        {/* Video & Controls Section */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Video Stream */}
            <VideoStream 
              interviewId={currentInterview._id}
              isInterviewer={hasRole('interviewer')}
              onDetectionResults={setDetectionResults}
            />

            {/* Interview Controls */}
            <InterviewControls 
              interview={currentInterview}
              isStarted={isInterviewStarted}
              onStart={handleStartInterview}
              onEnd={handleEndInterview}
              canControl={hasRole('interviewer')}
              status={interviewStatus}
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Participants</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentInterview.interviewer?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {currentInterview.interviewer?.name}
                  </p>
                  <p className="text-xs text-gray-500">Interviewer</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentInterview.candidate?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {currentInterview.candidate?.name}
                  </p>
                  <p className="text-xs text-gray-500">Candidate</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Detection Panel */}
          <div className="flex-1 overflow-hidden">
            {!hasRole('interviewer') ? (
              <DetectionPanel 
                detectionResults={detectionResults}
                realTimeAlerts={realTimeAlerts}
                className="h-full"
              />
            ) : (
              <AlertsPanel 
                alerts={realTimeAlerts}
                currentScore={currentInterview.integrityScore}
                className="h-full"
              />
            )}
          </div>
        </div>
      </div>


      {/* Pre-interview Setup Modal */}
      {(() => {
        const shouldShowModal = !isInterviewStarted && interviewStatus === 'waiting' && hasRole('interviewer');
        console.log("🔍 Modal condition check:", { 
          isInterviewStarted, 
          interviewStatus, 
          hasRoleInterviewer: hasRole('interviewer'),
          shouldShowModal 
        });
        return shouldShowModal;
      })() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ready to Start Interview?
            </h3>
            <p className="text-gray-600 mb-6">
              Make sure both you and the candidate are ready. The interview will begin
              recording and monitoring once started.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">
                  AI monitoring will be active during the interview
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/interviews')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartInterview}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Start Interview</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
