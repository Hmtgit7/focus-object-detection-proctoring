import * as tf from "@tensorflow/tfjs";

class MLService {
  constructor() {
    this.models = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  // Initialize TensorFlow.js and load models
  async initialize() {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  async _doInitialize() {
    try {
      console.log("🤖 Initializing ML Service...");

      // Initialize TensorFlow.js
      await tf.ready();
      console.log("✅ TensorFlow.js ready");

      // Set backend (WebGL for better performance)
      if (tf.getBackend() !== "webgl") {
        try {
          await tf.setBackend("webgl");
          console.log("✅ WebGL backend set");
        } catch (error) {
          console.warn("⚠️ WebGL not available, using CPU backend");
          await tf.setBackend("cpu");
        }
      }

      this.isInitialized = true;
      console.log("🎉 ML Service initialized successfully");
    } catch (error) {
      console.error("❌ ML Service initialization failed:", error);
      throw error;
    }
  }

  // Load a model from URL
  async loadModel(name, url, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.models.has(name)) {
        return this.models.get(name);
      }

      console.log(`📥 Loading model: ${name}`);
      const model = await tf.loadLayersModel(url, options);

      this.models.set(name, {
        model,
        loadedAt: new Date(),
        url,
        options,
      });

      console.log(`✅ Model loaded: ${name}`);
      return model;
    } catch (error) {
      console.error(`❌ Failed to load model ${name}:`, error);
      throw error;
    }
  }

  // Get a loaded model
  getModel(name) {
    const modelData = this.models.get(name);
    return modelData ? modelData.model : null;
  }

  // Preprocess image for model input
  preprocessImage(imageElement, inputShape = [224, 224]) {
    return tf.tidy(() => {
      // Convert image to tensor
      let tensor = tf.browser.fromPixels(imageElement);

      // Resize to input shape
      tensor = tf.image.resizeBilinear(tensor, inputShape);

      // Normalize pixel values to [0, 1]
      tensor = tensor.div(255.0);

      // Add batch dimension
      tensor = tensor.expandDims(0);

      return tensor;
    });
  }

  // Preprocess video frame
  preprocessVideoFrame(videoElement, inputShape = [224, 224]) {
    return tf.tidy(() => {
      // Create canvas to capture frame
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = inputShape[0];
      canvas.height = inputShape[1];

      // Draw video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to tensor
      let tensor = tf.browser.fromPixels(canvas);

      // Normalize
      tensor = tensor.div(255.0);

      // Add batch dimension
      tensor = tensor.expandDims(0);

      return tensor;
    });
  }

  // Basic object detection using a pre-trained model
  async detectObjects(imageElement, modelName = "coco-ssd", threshold = 0.5) {
    try {
      // For demonstration - in real implementation, you'd load a proper object detection model
      const model = this.getModel(modelName);
      if (!model) {
        throw new Error(`Model ${modelName} not loaded`);
      }

      const preprocessed = this.preprocessImage(imageElement);
      const predictions = await model.predict(preprocessed).data();

      // Process predictions (this is model-specific)
      const detections = this.processObjectDetections(predictions, threshold);

      preprocessed.dispose();
      return detections;
    } catch (error) {
      console.error("Object detection error:", error);
      return [];
    }
  }

  // Process object detection predictions
  processObjectDetections(predictions, threshold) {
    // This is a simplified example - real implementation depends on model output format
    const detections = [];

    // Example: assuming predictions is a flat array of [class, confidence, x, y, w, h, ...]
    for (let i = 0; i < predictions.length; i += 6) {
      const confidence = predictions[i + 1];

      if (confidence >= threshold) {
        detections.push({
          class: Math.round(predictions[i]),
          confidence: confidence,
          bbox: {
            x: predictions[i + 2],
            y: predictions[i + 3],
            width: predictions[i + 4],
            height: predictions[i + 5],
          },
        });
      }
    }

    return detections;
  }

  // Face detection using a simple approach
  async detectFaces(imageElement) {
    try {
      // This is a placeholder - real face detection would use MediaPipe or similar
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = imageElement.width || imageElement.videoWidth;
      canvas.height = imageElement.height || imageElement.videoHeight;

      ctx.drawImage(imageElement, 0, 0);

      // Simple face detection simulation
      // In real implementation, use MediaPipe Face Detection
      return {
        faces: [],
        confidence: 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Face detection error:", error);
      return { faces: [], confidence: 0 };
    }
  }

  // Analyze image for prohibited objects
  async analyzeForProhibitedItems(imageElement) {
    const prohibitedClasses = [
      "cell phone",
      "book",
      "laptop",
      "keyboard",
      "mouse",
    ];

    try {
      const detections = await this.detectObjects(imageElement);

      const prohibited = detections.filter((detection) =>
        prohibitedClasses.some((item) =>
          detection.class.toLowerCase().includes(item.toLowerCase())
        )
      );

      return {
        detections: prohibited,
        hasViolations: prohibited.length > 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Prohibited items analysis error:", error);
      return { detections: [], hasViolations: false };
    }
  }

  // Calculate focus score based on face position and size
  calculateFocusScore(faceDetections) {
    if (!faceDetections.faces || faceDetections.faces.length === 0) {
      return { score: 0, isFocused: false, reason: "No face detected" };
    }

    if (faceDetections.faces.length > 1) {
      return { score: 0, isFocused: false, reason: "Multiple faces detected" };
    }

    const face = faceDetections.faces[0];

    // Simple focus calculation based on face size and position
    // In real implementation, use eye gaze detection
    const centeredness = this.calculateFaceCenteredness(face.bbox);
    const sizeScore = this.calculateFaceSizeScore(face.bbox);

    const score = Math.round(((centeredness + sizeScore) / 2) * 100);
    const isFocused = score >= 70;

    return {
      score,
      isFocused,
      reason: isFocused ? "Good focus" : "Poor focus",
    };
  }

  // Calculate how centered the face is in the frame
  calculateFaceCenteredness(bbox) {
    const faceCenterX = bbox.x + bbox.width / 2;
    const faceCenterY = bbox.y + bbox.height / 2;

    // Assuming normalized coordinates [0, 1]
    const deviationX = Math.abs(faceCenterX - 0.5);
    const deviationY = Math.abs(faceCenterY - 0.5);

    const maxDeviation = 0.3; // Allow 30% deviation from center
    const centeredness = Math.max(
      0,
      1 - (deviationX + deviationY) / maxDeviation
    );

    return Math.min(1, centeredness);
  }

  // Calculate face size score (appropriate size indicates good positioning)
  calculateFaceSizeScore(bbox) {
    const faceArea = bbox.width * bbox.height;
    const idealArea = 0.15; // 15% of frame area is ideal
    const deviation = Math.abs(faceArea - idealArea) / idealArea;

    return Math.max(0, 1 - deviation);
  }

  // Dispose of a model to free memory
  disposeModel(name) {
    const modelData = this.models.get(name);
    if (modelData) {
      modelData.model.dispose();
      this.models.delete(name);
      console.log(`🗑️ Model disposed: ${name}`);
    }
  }

  // Dispose all models and cleanup
  dispose() {
    for (const [name, modelData] of this.models) {
      modelData.model.dispose();
    }
    this.models.clear();
    this.isInitialized = false;
    console.log("🧹 ML Service disposed");
  }

  // Get memory usage information
  getMemoryInfo() {
    return {
      tensors: tf.memory().numTensors,
      bytes: tf.memory().numBytes,
      models: this.models.size,
      backend: tf.getBackend(),
    };
  }

  // Warm up models (run dummy predictions to optimize performance)
  async warmUpModels() {
    try {
      console.log("🔥 Warming up models...");

      // Create dummy input
      const dummyInput = tf.randomNormal([1, 224, 224, 3]);

      for (const [name, modelData] of this.models) {
        try {
          await modelData.model.predict(dummyInput);
          console.log(`✅ Model warmed up: ${name}`);
        } catch (error) {
          console.warn(`⚠️ Failed to warm up model ${name}:`, error);
        }
      }

      dummyInput.dispose();
      console.log("🎉 Models warmed up successfully");
    } catch (error) {
      console.error("❌ Model warm-up failed:", error);
    }
  }
}

// Create singleton instance
const mlService = new MLService();

export default mlService;
