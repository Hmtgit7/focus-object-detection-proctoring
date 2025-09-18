import { useEffect, useState, useCallback, useRef } from "react";
import * as tf from "@tensorflow/tfjs";

const useObjectDetection = () => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const detectionRef = useRef(null);

  // COCO-SSD class names (subset for proctoring)
  const PROHIBITED_OBJECTS = {
    67: "cell phone",
    84: "book",
    76: "keyboard",
    77: "mouse",
    78: "remote",
    79: "cell phone", // Alternative detection
    // Add more object classes as needed
  };

  // Initialize TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);

        // Load COCO-SSD model for object detection
        await tf.ready();
        const cocoSsd = await import("@tensorflow-models/coco-ssd");
        const loadedModel = await cocoSsd.load({
          base: "lite_mobilenet_v2", // Faster inference
        });

        setModel(loadedModel);
        setError(null);
        console.log("✅ Object detection model loaded successfully");
      } catch (err) {
        console.error("❌ Failed to load object detection model:", err);
        setError("Failed to load object detection model");
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  // Detect objects in video frame
  const detectObjects = useCallback(
    async (videoElement) => {
      if (!model || !videoElement) {
        return { objects: [], prohibited: [], confidence: 0 };
      }

      try {
        const predictions = await model.detect(videoElement, {
          maxNumBoxes: 20,
          minScore: 0.3, // Lower threshold for better detection
        });

        const prohibitedObjects = predictions.filter((prediction) => {
          const className = prediction.class.toLowerCase();
          const isProhibited = (
            className.includes("cell phone") ||
            className.includes("phone") ||
            className.includes("book") ||
            className.includes("laptop") ||
            className.includes("keyboard") ||
            className.includes("mouse") ||
            className.includes("remote")
          );
          
          if (isProhibited) {
            console.log("🚫 Prohibited object detected:", {
              class: prediction.class,
              confidence: prediction.score,
              bbox: prediction.bbox
            });
          }
          
          return isProhibited;
        });

        console.log("🔍 Object detection results:", {
          totalPredictions: predictions.length,
          prohibitedObjects: prohibitedObjects.length,
          allClasses: predictions.map(p => p.class),
          prohibitedClasses: prohibitedObjects.map(p => p.class)
        });

        return {
          objects: predictions,
          prohibited: prohibitedObjects,
          confidence: predictions.length > 0 ? predictions[0].score : 0,
          timestamp: Date.now(),
        };
      } catch (err) {
        console.error("Object detection error:", err);
        return {
          objects: [],
          prohibited: [],
          confidence: 0,
          error: err.message,
        };
      }
    },
    [model]
  );

  // Process detection results for proctoring
  const processDetectionResults = useCallback((detectionResults) => {
    if (
      !detectionResults.prohibited ||
      detectionResults.prohibited.length === 0
    ) {
      return {
        violations: [],
        severity: "none",
        score: 0,
      };
    }

    const violations = detectionResults.prohibited.map((obj) => ({
      type: obj.class.toLowerCase().includes("phone")
        ? "phone_detected"
        : obj.class.toLowerCase().includes("book")
        ? "book_detected"
        : "device_detected",
      object: obj.class,
      confidence: obj.score,
      boundingBox: obj.bbox,
      timestamp: detectionResults.timestamp,
    }));

    // Calculate severity based on object type and confidence
    let maxSeverity = "low";
    violations.forEach((violation) => {
      if (violation.type === "phone_detected" && violation.confidence > 0.8) {
        maxSeverity = "high";
      } else if (violation.confidence > 0.7) {
        maxSeverity = "medium";
      }
    });

    return {
      violations,
      severity: maxSeverity,
      score: Math.max(...violations.map((v) => v.confidence * 100)),
    };
  }, []);

  return {
    model,
    isLoading,
    error,
    detectObjects,
    processDetectionResults,
  };
};

export default useObjectDetection;
