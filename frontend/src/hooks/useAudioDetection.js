import { useEffect, useRef, useCallback, useState } from "react";

const useAudioDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [microphone, setMicrophone] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const audioStreamRef = useRef(null);

  // Initialize audio detection
  useEffect(() => {
    const initializeAudioDetection = async () => {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          } 
        });
        
        audioStreamRef.current = stream;

        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        setAudioContext(audioCtx);

        // Create analyser node
        const analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;
        setAnalyser(analyserNode);

        // Create microphone source
        const microphoneNode = audioCtx.createMediaStreamSource(stream);
        setMicrophone(microphoneNode);

        // Connect microphone to analyser
        microphoneNode.connect(analyserNode);

        // Create data array for frequency analysis
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArrayBuffer = new Uint8Array(bufferLength);
        setDataArray(dataArrayBuffer);

        setIsInitialized(true);
        setError(null);
        console.log("✅ Audio detection initialized successfully");
      } catch (err) {
        console.error("Failed to initialize audio detection:", err);
        setError("Failed to initialize audio detection");
        setIsInitialized(false);
      }
    };

    initializeAudioDetection();

    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Analyze audio for violations
  const analyzeAudio = useCallback(() => {
    if (!analyser || !dataArray || !isInitialized) {
      return {
        volume: 0,
        hasVoice: false,
        backgroundNoise: false,
        violations: [],
        timestamp: Date.now()
      };
    }

    try {
      // Get frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      
      // Calculate RMS (Root Mean Square) for better volume detection
      const rms = Math.sqrt(dataArray.reduce((sum, value) => sum + value * value, 0) / dataArray.length);
      
      // Detect voice activity (threshold-based)
      const hasVoice = averageVolume > 30; // Adjust threshold as needed
      const backgroundNoise = averageVolume > 10 && averageVolume < 30;

      console.log("🎤 Audio analysis:", {
        averageVolume,
        rms,
        hasVoice,
        backgroundNoise,
        timestamp: Date.now()
      });
      
      // Analyze frequency spectrum for suspicious patterns
      const violations = [];
      
      // Check for sudden volume spikes (potential shouting)
      if (averageVolume > 100) {
        violations.push({
          type: "volume_spike",
          severity: averageVolume > 150 ? "high" : "medium",
          confidence: Math.min(averageVolume / 200, 1),
          details: { volume: averageVolume }
        });
      }
      
      // Check for very low volume (potential whispering or muted mic)
      if (averageVolume < 5 && hasVoice) {
        violations.push({
          type: "low_volume",
          severity: "medium",
          confidence: 0.7,
          details: { volume: averageVolume }
        });
      }
      
      // Check for background noise patterns
      if (backgroundNoise && !hasVoice) {
        violations.push({
          type: "background_noise",
          severity: "low",
          confidence: 0.6,
          details: { volume: averageVolume }
        });
      }

      return {
        volume: averageVolume,
        rms: rms,
        hasVoice,
        backgroundNoise,
        violations,
        timestamp: Date.now(),
        frequencyData: Array.from(dataArray)
      };
    } catch (err) {
      console.error("Audio analysis error:", err);
      return {
        volume: 0,
        hasVoice: false,
        backgroundNoise: false,
        violations: [],
        error: err.message,
        timestamp: Date.now()
      };
    }
  }, [analyser, dataArray, isInitialized]);

  // Detect multiple voices (simplified approach)
  const detectMultipleVoices = useCallback((audioData) => {
    if (!audioData.frequencyData) return false;
    
    // Look for multiple frequency peaks that could indicate multiple speakers
    const peaks = audioData.frequencyData
      .map((value, index) => ({ value, index }))
      .filter(item => item.value > 50) // Threshold for significant frequency
      .sort((a, b) => b.value - a.value);
    
    // If we have multiple significant peaks in different frequency ranges
    const significantPeaks = peaks.filter(peak => peak.value > 80);
    return significantPeaks.length > 1;
  }, []);

  // Process detection results for proctoring
  const processAudioDetectionResults = useCallback((audioResults) => {
    if (!audioResults.violations || audioResults.violations.length === 0) {
      return {
        violations: [],
        severity: "none",
        score: 0,
        summary: "No audio violations detected"
      };
    }

    const violations = audioResults.violations.map(violation => ({
      type: violation.type,
      severity: violation.severity,
      confidence: violation.confidence,
      details: violation.details,
      timestamp: audioResults.timestamp
    }));

    // Calculate overall severity
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const maxSeverity = violations.reduce((max, violation) => {
      return severityLevels[violation.severity] > severityLevels[max] 
        ? violation.severity 
        : max;
    }, "low");

    // Calculate score based on violations
    const score = violations.reduce((total, violation) => {
      const baseScore = violation.confidence * 100;
      const severityMultiplier = severityLevels[violation.severity];
      return total + (baseScore * severityMultiplier);
    }, 0);

    return {
      violations,
      severity: maxSeverity,
      score: Math.min(score, 100),
      summary: `${violations.length} audio violation(s) detected`,
      volume: audioResults.volume,
      hasVoice: audioResults.hasVoice,
      backgroundNoise: audioResults.backgroundNoise
    };
  }, []);

  return {
    isInitialized,
    error,
    analyzeAudio,
    detectMultipleVoices,
    processAudioDetectionResults,
    audioContext,
    analyser
  };
};

export default useAudioDetection;
