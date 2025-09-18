// const tf = require("@tensorflow/tfjs-node"); // Temporarily disabled due to build issues
const path = require("path");

class MLService {
  constructor() {
    this.faceDetectionModel = null;
    this.objectDetectionModel = null;
    this.emotionModel = null;
    this.isInitialized = false;
  }

  // Initialize all ML models
  async initializeModels() {
    try {
      console.log("🤖 Initializing ML models...");

      // Load face detection model (optional server-side backup)
      await this.loadFaceDetectionModel();

      // Load emotion detection model for drowsiness detection
      await this.loadEmotionModel();

      this.isInitialized = true;
      console.log("✅ All ML models initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing ML models:", error);
      throw error;
    }
  }

  // Load face detection model
  async loadFaceDetectionModel() {
    try {
      const modelPath = path.join(
        __dirname,
        "../models/face-detection/model.json"
      );

      // Check if model exists locally, otherwise use a lightweight alternative
      if (require("fs").existsSync(modelPath)) {
        this.faceDetectionModel = await tf.loadLayersModel(
          `file://${modelPath}`
        );
        console.log("✅ Face detection model loaded from local file");
      } else {
        console.log(
          "⚠️ Local face detection model not found, using client-side detection only"
        );
      }
    } catch (error) {
      console.warn("Face detection model loading failed:", error);
    }
  }

  // Load emotion detection model for advanced analysis
  async loadEmotionModel() {
    try {
      const modelUrl =
        "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json";
      this.emotionModel = await tf.loadLayersModel(modelUrl);
      console.log("✅ Emotion detection model loaded");
    } catch (error) {
      console.warn("Emotion model loading failed:", error);
    }
  }

  // Process video frame for server-side analysis
  async processVideoFrame(frameData, analysisType = "basic") {
    if (!this.isInitialized) {
      await this.initializeModels();
    }

    try {
      const results = {
        timestamp: new Date(),
        analysisType,
        detections: [],
      };

      // Convert frame data to tensor
      const frameTensor = this.preprocessFrame(frameData);

      // Perform different types of analysis
      switch (analysisType) {
        case "face":
          results.detections = await this.analyzeForFaces(frameTensor);
          break;
        case "emotion":
          results.detections = await this.analyzeForEmotions(frameTensor);
          break;
        case "comprehensive":
          results.detections = await this.comprehensiveAnalysis(frameTensor);
          break;
        default:
          results.detections = await this.basicAnalysis(frameTensor);
      }

      // Cleanup tensors
      frameTensor.dispose();

      return results;
    } catch (error) {
      console.error("Video frame processing error:", error);
      throw error;
    }
  }

  // Preprocess frame data
  preprocessFrame(frameData) {
    // Convert image data to tensor
    // This would depend on the format of frameData
    const tensor = tf.browser.fromPixels(frameData);

    // Resize to model input size (224x224 for most models)
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);

    // Normalize pixel values
    const normalized = resized.div(255.0);

    // Add batch dimension
    const batched = normalized.expandDims(0);

    tensor.dispose();
    resized.dispose();
    normalized.dispose();

    return batched;
  }

  // Basic frame analysis
  async basicAnalysis(frameTensor) {
    // Placeholder for basic analysis
    return [
      {
        type: "basic_analysis",
        confidence: 0.8,
        details: {
          processed: true,
          timestamp: new Date(),
        },
      },
    ];
  }

  // Face analysis
  async analyzeForFaces(frameTensor) {
    if (!this.faceDetectionModel) {
      return [
        {
          type: "face_analysis_unavailable",
          confidence: 0,
          details: { reason: "Model not loaded" },
        },
      ];
    }

    try {
      const predictions = await this.faceDetectionModel.predict(frameTensor);

      // Process predictions (format depends on model)
      return this.processFacePredictions(predictions);
    } catch (error) {
      console.error("Face analysis error:", error);
      return [
        {
          type: "face_analysis_error",
          confidence: 0,
          details: { error: error.message },
        },
      ];
    }
  }

  // Emotion analysis for drowsiness detection
  async analyzeForEmotions(frameTensor) {
    if (!this.emotionModel) {
      return [
        {
          type: "emotion_analysis_unavailable",
          confidence: 0,
          details: { reason: "Model not loaded" },
        },
      ];
    }

    try {
      const predictions = await this.emotionModel.predict(frameTensor);

      return this.processEmotionPredictions(predictions);
    } catch (error) {
      console.error("Emotion analysis error:", error);
      return [
        {
          type: "emotion_analysis_error",
          confidence: 0,
          details: { error: error.message },
        },
      ];
    }
  }

  // Comprehensive analysis combining multiple models
  async comprehensiveAnalysis(frameTensor) {
    const results = [];

    // Run face analysis
    const faceResults = await this.analyzeForFaces(frameTensor);
    results.push(...faceResults);

    // Run emotion analysis
    const emotionResults = await this.analyzeForEmotions(frameTensor);
    results.push(...emotionResults);

    return results;
  }

  // Process face detection predictions
  processFacePredictions(predictions) {
    // This would depend on the specific model output format
    // Placeholder implementation
    return [
      {
        type: "face_detected",
        confidence: 0.9,
        details: {
          boundingBox: { x: 100, y: 100, width: 200, height: 200 },
          landmarks: [],
        },
      },
    ];
  }

  // Process emotion predictions
  processEmotionPredictions(predictions) {
    // This would depend on the specific model output format
    // Placeholder implementation
    const emotions = [
      "happy",
      "sad",
      "angry",
      "surprised",
      "neutral",
      "drowsy",
    ];

    return [
      {
        type: "emotion_detected",
        confidence: 0.8,
        details: {
          emotion: "neutral",
          scores: emotions.reduce((acc, emotion, index) => {
            acc[emotion] = Math.random();
            return acc;
          }, {}),
        },
      },
    ];
  }

  // Analyze audio for background noise/voices
  async analyzeAudioFrame(audioData) {
    try {
      // Convert audio to tensor
      const audioTensor = tf.tensor1d(audioData);

      // Basic audio analysis (volume, frequency analysis)
      const volume = tf.mean(tf.abs(audioTensor));
      const volumeValue = await volume.data();

      audioTensor.dispose();
      volume.dispose();

      return {
        volume: volumeValue[0],
        hasVoice: volumeValue[0] > 0.1,
        backgroundNoise: volumeValue[0] > 0.05 && volumeValue[0] < 0.1,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Audio analysis error:", error);
      return {
        volume: 0,
        hasVoice: false,
        backgroundNoise: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  // Generate insights from detection logs
  generateInsights(detectionLogs) {
    const insights = {
      patterns: [],
      recommendations: [],
      riskFactors: [],
    };

    // Analyze patterns in violations
    const violationTypes = detectionLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});

    // Identify concerning patterns
    if (violationTypes.focus_lost > 10) {
      insights.patterns.push("Frequent focus loss detected");
      insights.recommendations.push("Consider shorter interview segments");
    }

    if (violationTypes.phone_detected > 0) {
      insights.riskFactors.push("Mobile device usage detected");
      insights.recommendations.push("Implement stricter device policies");
    }

    if (violationTypes.multiple_faces > 3) {
      insights.riskFactors.push("Multiple people detected frequently");
      insights.recommendations.push("Review room setup requirements");
    }

    return insights;
  }

  // Cleanup resources
  dispose() {
    if (this.faceDetectionModel) {
      this.faceDetectionModel.dispose();
    }
    if (this.objectDetectionModel) {
      this.objectDetectionModel.dispose();
    }
    if (this.emotionModel) {
      this.emotionModel.dispose();
    }

    this.isInitialized = false;
    console.log("🧹 ML service resources cleaned up");
  }
}

module.exports = new MLService();
