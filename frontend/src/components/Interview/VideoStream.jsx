import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  MicOff,
  Video,
  VideoOff,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import useMediaPipe from "../../hooks/useMediaPipe";
import useObjectDetection from "../../hooks/useObjectDetection";
import useVideoRecording from "../../hooks/useVideoRecording";
import useSocket from "../../hooks/useSocket";

const VideoStream = ({ interviewId, isInterviewer = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [detectionResults, setDetectionResults] = useState({
    focus: { isFocused: true, score: 100 },
    objects: { violations: [] },
    alerts: [],
  });

  // Custom hooks
  const {
    isInitialized: isFaceDetectionReady,
    detectFaces,
    calculateFocusMetrics,
    error: faceDetectionError,
  } = useMediaPipe();

  const {
    model: objectDetectionModel,
    detectObjects,
    processDetectionResults,
    isLoading: isObjectDetectionLoading,
  } = useObjectDetection();

  const {
    isRecording,
    recordedBlob,
    recordingDuration,
    startRecording,
    stopRecording,
    stream,
    error: recordingError,
  } = useVideoRecording();

  const { socket, emitDetectionEvent } = useSocket();

  // Initialize video stream
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Start recording for candidates
        if (!isInterviewer) {
          await startRecording(constraints);
        }
      } catch (error) {
        console.error("Failed to initialize video:", error);
      }
    };

    initializeVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startRecording, isInterviewer]);

  // Real-time detection loop
  const performDetection = useCallback(async () => {
    if (!videoRef.current || !isFaceDetectionReady || !objectDetectionModel) {
      return;
    }

    const video = videoRef.current;
    const timestamp = performance.now();

    try {
      // Face detection for focus analysis
      const faceDetection = await detectFaces(video, timestamp);
      const focusMetrics = calculateFocusMetrics(faceDetection);

      // Object detection for prohibited items
      const objectDetection = await detectObjects(video);
      const objectResults = processDetectionResults(objectDetection);

      // Update state
      const newResults = {
        focus: focusMetrics,
        objects: objectResults,
        alerts: [],
        timestamp: new Date(),
      };

      setDetectionResults(newResults);

      // Emit detection events to server
      if (!focusMetrics.isFocused && focusMetrics.faceCount === 0) {
        emitDetectionEvent({
          interviewId,
          type: "face_absent",
          confidence: 1 - focusMetrics.focusScore / 100,
          details: { duration: 1000 },
          timestamp,
        });
      }

      if (focusMetrics.faceCount > 1) {
        emitDetectionEvent({
          interviewId,
          type: "multiple_faces",
          confidence: 0.9,
          details: { faceCount: focusMetrics.faceCount },
          timestamp,
        });
      }

      if (!focusMetrics.isFocused && focusMetrics.faceCount === 1) {
        emitDetectionEvent({
          interviewId,
          type: "focus_lost",
          confidence: 1 - focusMetrics.focusScore / 100,
          details: {
            score: focusMetrics.focusScore,
            deviation: focusMetrics.metrics.gazeDirection?.deviation,
          },
          timestamp,
        });
      }

      // Object detection violations
      objectResults.violations.forEach((violation) => {
        emitDetectionEvent({
          interviewId,
          type: violation.type,
          confidence: violation.confidence,
          details: {
            object: violation.object,
            boundingBox: violation.boundingBox,
          },
          timestamp,
        });
      });
    } catch (error) {
      console.error("Detection error:", error);
    }
  }, [
    isFaceDetectionReady,
    objectDetectionModel,
    detectFaces,
    calculateFocusMetrics,
    detectObjects,
    processDetectionResults,
    emitDetectionEvent,
    interviewId,
  ]);

  // Start detection loop
  useEffect(() => {
    if (isFaceDetectionReady && objectDetectionModel && !isInterviewer) {
      detectionIntervalRef.current = setInterval(performDetection, 1000); // Check every second
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [
    isFaceDetectionReady,
    objectDetectionModel,
    performDetection,
    isInterviewer,
  ]);

  // Toggle video
  const toggleVideo = () => {
    if (videoRef.current?.srcObject) {
      const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (videoRef.current?.srcObject) {
      const audioTrack = videoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Video Container */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted={false}
          playsInline
          className="w-full h-auto max-h-96 object-cover"
        />

        {/* Canvas for debugging (hidden) */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
        />

        {/* Status Indicators */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {isRecording && (
            <div className="flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              REC {recordingDuration}
            </div>
          )}

          {!isInterviewer && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                detectionResults.focus.isFocused
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              Focus: {detectionResults.focus.score}%
            </div>
          )}
        </div>

        {/* Detection Alerts */}
        {detectionResults.objects.violations.length > 0 && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <AlertTriangle size={16} className="mr-1" />
            {detectionResults.objects.violations.length} Violation(s)
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition-colors`}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              isAudioEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition-colors`}
          >
            {isAudioEnabled ? <Camera size={20} /> : <MicOff size={20} />}
          </button>
        </div>

        {/* Loading States */}
        {(isObjectDetectionLoading || !isFaceDetectionReady) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Initializing AI Detection...</p>
            </div>
          </div>
        )}

        {/* Error States */}
        {(faceDetectionError || recordingError) && (
          <div className="absolute bottom-16 left-4 right-4 bg-red-600 text-white p-3 rounded-lg">
            <p className="text-sm">{faceDetectionError || recordingError}</p>
          </div>
        )}
      </div>

      {/* Detection Details Panel */}
      {!isInterviewer && (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Detection Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Face Detection */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  detectionResults.focus.faceCount === 1
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {detectionResults.focus.faceCount}
              </div>
              <p className="text-sm text-gray-600">Face(s) Detected</p>
            </div>

            {/* Focus Score */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  detectionResults.focus.score > 70
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {detectionResults.focus.score}%
              </div>
              <p className="text-sm text-gray-600">Focus Score</p>
            </div>

            {/* Violations */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  detectionResults.objects.violations.length === 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {detectionResults.objects.violations.length}
              </div>
              <p className="text-sm text-gray-600">Active Violations</p>
            </div>
          </div>

          {/* Violation Details */}
          {detectionResults.objects.violations.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">
                Detected Violations:
              </h4>
              <ul className="text-sm text-red-700">
                {detectionResults.objects.violations.map((violation, index) => (
                  <li key={index} className="flex items-center">
                    <AlertTriangle size={14} className="mr-2" />
                    {violation.object} detected (
                    {Math.round(violation.confidence * 100)}% confidence)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoStream;
