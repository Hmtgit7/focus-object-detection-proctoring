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
  Download,
  Volume2,
  VolumeX,
  SkipForward,
  Phone,
  PhoneOff
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
  
  // AI Interview System State
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [interviewPhase, setInterviewPhase] = useState('waiting'); // waiting, started, questions, ended
  
  const timerRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // AI Question System
  const QUESTION_CATEGORIES = {
    'frontend-js': [
      "Explain the difference between let, const, and var in JavaScript.",
      "What is the event loop in JavaScript and how does it work?",
      "How do closures work in JavaScript? Can you give an example?",
      "What is the difference between == and === in JavaScript?",
      "Explain the concept of hoisting in JavaScript.",
      "What are arrow functions and how do they differ from regular functions?",
      "Explain the difference between null and undefined in JavaScript.",
      "What is the purpose of the 'this' keyword in JavaScript?",
      "How do you handle asynchronous operations in JavaScript?",
      "What is the difference between call, apply, and bind methods?"
    ],
    'backend-node': [
      "What is the difference between require() and import in Node.js?",
      "Explain the event-driven architecture of Node.js.",
      "What is middleware in Express.js and how do you use it?",
      "How do you handle errors in Node.js applications?",
      "What is the purpose of package.json in Node.js projects?",
      "Explain the difference between synchronous and asynchronous operations in Node.js.",
      "What is the Node.js event loop and how does it work?",
      "How do you manage environment variables in Node.js?",
      "What is the purpose of the fs module in Node.js?",
      "How do you implement authentication in Node.js applications?"
    ],
    'react': [
      "What is the difference between state and props in React?",
      "Explain the React component lifecycle methods.",
      "What are React hooks and how do you use them?",
      "What is the difference between functional and class components in React?",
      "How do you handle forms in React?",
      "What is the purpose of useEffect hook in React?",
      "Explain the concept of virtual DOM in React.",
      "How do you manage state in React applications?",
      "What is the difference between controlled and uncontrolled components?",
      "How do you handle events in React?"
    ],
    'python': [
      "What is the difference between lists and tuples in Python?",
      "Explain the concept of list comprehensions in Python.",
      "What is the purpose of the __init__ method in Python classes?",
      "How do you handle exceptions in Python?",
      "What is the difference between == and is in Python?",
      "Explain the concept of decorators in Python.",
      "What is the purpose of the if __name__ == '__main__' statement?",
      "How do you work with files in Python?",
      "What is the difference between local and global variables in Python?",
      "Explain the concept of generators in Python."
    ]
  };

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

  // Handle access denied responses
  useEffect(() => {
    if (currentInterview && currentInterview.accessDenied) {
      console.log("🚫 Interview access denied:", currentInterview.reason);
      
      if (currentInterview.reason === 'completed') {
        // Redirect to dashboard with completion message
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Interview has already been completed',
              type: 'info'
            }
          });
        }, 2000);
      } else if (currentInterview.reason === 'not_started') {
        // Redirect to dashboard with not started message
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Interview has not started yet. Please wait until the scheduled time.',
              type: 'warning'
            }
          });
        }, 2000);
      } else if (currentInterview.reason === 'expired') {
        // Redirect to dashboard with expired message
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Interview time has expired. The interview window has closed.',
              type: 'error'
            }
          });
        }, 2000);
      }
    }
  }, [currentInterview, navigate]);

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

  // AI Interview Functions
  const startAIInterview = async () => {
    if (!currentInterview) {
      console.error("❌ No current interview found");
      return;
    }
    
    console.log("🚀 Starting AI interview:", {
      interviewId: currentInterview._id,
      userRole: user?.role,
      userId: user?._id
    });
    
    try {
      // Start the interview
      const result = await startInterview(currentInterview._id);
      console.log("📡 Start interview result:", result);
      
      if (result.success) {
        setIsInterviewStarted(true);
        setInterviewStatus('in-progress');
        setInterviewPhase('started');
        
        // Load questions based on interview category
        const category = currentInterview.category || 'frontend-js';
        const interviewQuestions = QUESTION_CATEGORIES[category] || QUESTION_CATEGORIES['frontend-js'];
        setQuestions(interviewQuestions);
        
        // Start with first question
        setTimeout(() => {
          setInterviewPhase('questions');
          setCurrentQuestion(interviewQuestions[0]);
          speakQuestion(interviewQuestions[0]);
        }, 2000); // 2 second delay to start
      } else {
        console.error("❌ Failed to start interview:", result.error);
      }
    } catch (error) {
      console.error("❌ Error starting AI interview:", error);
    }
  };

  const speakQuestion = (question) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.8; // Slower speech
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      speakQuestion(questions[nextIndex]);
    } else {
      // All questions completed
      endAIInterview();
    }
  };

  const endAIInterview = async () => {
    if (!currentInterview) return;
    
    try {
      // Stop speech
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }
      
      // End the interview
      const result = await endInterview(currentInterview._id);
      if (result.success) {
        setIsInterviewStarted(false);
        setInterviewStatus('completed');
        setInterviewPhase('ended');
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        console.log("✅ AI Interview ended successfully");
        
        // Refresh interview data
        if (id) {
          fetchInterview(id);
        }

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Interview completed successfully! Report will be available shortly.',
              type: 'success'
            }
          });
        }, 3000);
      }
    } catch (error) {
      console.error("❌ Error ending AI interview:", error);
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

          // Redirect to dashboard after ending interview
          setTimeout(() => {
            navigate('/dashboard', { 
              state: { 
                message: 'Interview ended successfully! Report will be available shortly.',
                type: 'success'
              }
            });
          }, 2000);
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

  // Handle access denied cases
  if (currentInterview && currentInterview.accessDenied) {
    const getAccessDeniedContent = () => {
      switch (currentInterview.reason) {
        case 'completed':
          return {
            icon: <AlertTriangle className="h-16 w-16 text-green-500 mx-auto mb-4" />,
            title: 'Interview Already Completed',
            message: 'This interview has already been completed and cannot be accessed again.',
            buttonText: 'Back to Dashboard',
            buttonColor: 'bg-green-600 hover:bg-green-700'
          };
        case 'not_started':
          return {
            icon: <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />,
            title: 'Interview Not Started',
            message: `This interview is scheduled for ${new Date(currentInterview.scheduledAt).toLocaleString()}. Please wait until the scheduled time.`,
            buttonText: 'Back to Dashboard',
            buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
          };
        case 'expired':
          return {
            icon: <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />,
            title: 'Interview Time Expired',
            message: 'The interview time window has closed. You can no longer access this interview.',
            buttonText: 'Back to Dashboard',
            buttonColor: 'bg-red-600 hover:bg-red-700'
          };
        default:
          return {
            icon: <AlertTriangle className="h-16 w-16 text-gray-500 mx-auto mb-4" />,
            title: 'Access Denied',
            message: 'You do not have permission to access this interview.',
            buttonText: 'Back to Dashboard',
            buttonColor: 'bg-gray-600 hover:bg-gray-700'
          };
      }
    };

    const content = getAccessDeniedContent();

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-4">
          {content.icon}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {content.message}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-6 py-2 text-white rounded-lg ${content.buttonColor}`}
          >
            {content.buttonText}
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

      {/* AI Interview Interface */}
      {hasRole('candidate') ? (
        <div className="flex h-screen">
          {/* Main Interview Area */}
          <div className="flex-1 flex flex-col">
            {/* Video Stream */}
            <div className="flex-1 bg-gray-900 relative">
              <VideoStream 
                interviewId={currentInterview._id}
                isInterviewer={false}
                onDetectionResults={setDetectionResults}
                showDetectionUI={false}
              />
              
              {/* Interview Timer Overlay */}
              {isInterviewStarted && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                  <div className="text-lg font-bold">{formatTime(interviewTimer)}</div>
                  <div className="text-xs">Question {questionIndex + 1} of {questions.length}</div>
                </div>
              )}
            </div>

            {/* AI Question Panel */}
            <div className="bg-white border-t border-gray-200 p-6">
              {interviewPhase === 'waiting' && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Start Your AI Interview?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    The AI will ask you {QUESTION_CATEGORIES[currentInterview.category || 'frontend-js']?.length || 10} questions about {currentInterview.category || 'Frontend JavaScript'}.
                  </p>
                  <button
                    onClick={startAIInterview}
                    className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2 mx-auto"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Interview</span>
                  </button>
                </div>
              )}

              {interviewPhase === 'started' && (
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    🎯 Interview Starting...
                  </h2>
                  <p className="text-gray-600">
                    Get ready! The AI will begin asking questions shortly.
                  </p>
                </div>
              )}

              {interviewPhase === 'questions' && currentQuestion && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {questionIndex + 1} of {questions.length}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {isSpeaking ? (
                        <Volume2 className="h-5 w-5 text-green-500 animate-pulse" />
                      ) : (
                        <VolumeX className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {currentQuestion}
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => speakQuestion(currentQuestion)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Repeat Question</span>
                    </button>
                    
                    <button
                      onClick={nextQuestion}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      <span>Next Question</span>
                    </button>
                  </div>
                </div>
              )}

              {interviewPhase === 'ended' && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-600 mb-4">
                    ✅ Interview Completed!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Thank you for completing the interview. Your responses have been recorded and a detailed report will be generated.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Student Controls */}
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex justify-center">
                <button
                  onClick={endAIInterview}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>End Interview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hidden Detection Panel (for background monitoring) */}
          <div className="hidden">
            <DetectionPanel 
              detectionResults={detectionResults}
              realTimeAlerts={realTimeAlerts}
              className="h-full"
            />
          </div>
        </div>
      ) : (
        /* Admin/Interviewer View - Keep existing interface */
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
              <AlertsPanel 
                alerts={realTimeAlerts}
                currentScore={currentInterview.integrityScore}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}


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
