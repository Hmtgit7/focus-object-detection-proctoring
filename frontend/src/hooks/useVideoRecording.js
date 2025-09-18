import { useState, useRef, useCallback, useEffect } from 'react';

const useVideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize media stream
  const startStream = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setError(null);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera/microphone');
      throw err;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (constraints) => {
    try {
      if (!streamRef.current) {
        await startStream(constraints);
      }

      const stream = streamRef.current;
      chunksRef.current = [];

      // Configure MediaRecorder with optimal settings
      let options = {};
      if (MediaRecorder.isTypeSupported('video/mp4; codecs=h264,aac')) {
        options = { 
          mimeType: 'video/mp4; codecs=h264,aac',
          videoBitsPerSecond: 2000000, // 2 Mbps
          audioBitsPerSecond: 128000   // 128 kbps
        };
      } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')) {
        options = { 
          mimeType: 'video/webm; codecs=vp9,opus',
          videoBitsPerSecond: 2000000,
          audioBitsPerSecond: 128000
        };
      } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp8,opus')) {
        options = { 
          mimeType: 'video/webm; codecs=vp8,opus',
          videoBitsPerSecond: 1500000,
          audioBitsPerSecond: 128000
        };
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current.mimeType 
        });
        setRecordedBlob(blob);
        setIsRecording(false);
        
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording error occurred');
        setIsRecording(false);
      };

      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  }, [startStream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // Reset recording
  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordingDuration(0);
    chunksRef.current = [];
  }, []);

  // Stop all tracks and cleanup
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setError(null);
  }, []);

  // Format duration for display
  const formatDuration = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isRecording,
    recordedBlob,
    recordingDuration: formatDuration(recordingDuration),
    rawDuration: recordingDuration,
    error,
    stream: streamRef.current,
    startRecording,
    stopRecording,
    resetRecording,
    cleanup,
    mimeType: mediaRecorderRef.current?.mimeType
  };
};

export default useVideoRecording;
