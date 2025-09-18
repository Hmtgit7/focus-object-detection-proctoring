import { useEffect, useRef, useCallback, useState } from "react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const useMediaPipe = () => {
  const [faceDetector, setFaceDetector] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize MediaPipe Face Detector
  useEffect(() => {
    const initializeFaceDetector = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );

        const detector = await FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
          minSuppressionThreshold: 0.3,
        });

        setFaceDetector(detector);
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize MediaPipe Face Detector:", err);
        setError("Failed to initialize face detection");
        setIsInitialized(false);
      }
    };

    initializeFaceDetector();

    return () => {
      if (faceDetector) {
        faceDetector.close();
      }
    };
  }, []);

  // Detect faces in video frame
  const detectFaces = useCallback(
    async (video, timestamp) => {
      if (!faceDetector || !video || !isInitialized) {
        return { faces: [], confidence: 0 };
      }

      try {
        const detections = faceDetector.detectForVideo(video, timestamp);

        const result = {
          faces: detections.detections || [],
          confidence: detections.detections?.[0]?.categories?.[0]?.score || 0,
          timestamp,
        };

        console.log("👤 Face detection result:", {
          faceCount: result.faces.length,
          confidence: result.confidence,
          timestamp: result.timestamp
        });

        return result;
      } catch (err) {
        console.error("Face detection error:", err);
        return { faces: [], confidence: 0, error: err.message };
      }
    },
    [faceDetector, isInitialized]
  );

  // Calculate focus metrics
  const calculateFocusMetrics = useCallback((detections) => {
    if (!detections.faces || detections.faces.length === 0) {
      return {
        isFocused: false,
        faceCount: 0,
        focusScore: 0,
        metrics: {
          facePresent: false,
          multipleFaces: false,
          gazeDirection: null,
        },
      };
    }

    const face = detections.faces[0];
    const bbox = face.boundingBox;

    // Calculate focus metrics based on face position and size
    const centerX = bbox.originX + bbox.width / 2;
    const centerY = bbox.originY + bbox.height / 2;

    // Assuming video dimensions (these should be dynamic based on actual video)
    const videoCenterX = 0.5;
    const videoCenterY = 0.5;

    // Calculate how centered the face is
    const deviationX = Math.abs(centerX - videoCenterX);
    const deviationY = Math.abs(centerY - videoCenterY);

    const maxDeviation = 0.4; // 40% deviation from center (more lenient)
    const focusScore = Math.max(
      0,
      1 - (deviationX + deviationY) / maxDeviation
    );

    const result = {
      isFocused: focusScore > 0.5, // Lower threshold for focus detection
      faceCount: detections.faces.length,
      focusScore: Math.round(focusScore * 100),
      metrics: {
        facePresent: true,
        multipleFaces: detections.faces.length > 1,
        gazeDirection: {
          x: centerX,
          y: centerY,
          deviation: deviationX + deviationY,
        },
        confidence: detections.confidence,
      },
    };

    console.log("🎯 Focus metrics:", {
      isFocused: result.isFocused,
      focusScore: result.focusScore,
      faceCount: result.faceCount,
      deviation: result.metrics.gazeDirection.deviation,
      centerX,
      centerY
    });

    return result;
  }, []);

  return {
    faceDetector,
    isInitialized,
    error,
    detectFaces,
    calculateFocusMetrics,
    videoRef,
    canvasRef,
  };
};

export default useMediaPipe;
