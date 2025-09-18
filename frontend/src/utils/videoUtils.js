// Video recording utilities
export const VIDEO_CONSTRAINTS = {
  HD: {
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
  },
  FULL_HD: {
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
  },
  LOW_QUALITY: {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 15 },
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 22050,
    },
  },
};

// Supported video formats and codecs
export const VIDEO_FORMATS = {
  MP4: {
    mimeType: "video/mp4",
    extension: "mp4",
    codec: "h264",
  },
  WEBM: {
    mimeType: "video/webm",
    extension: "webm",
    codec: "vp8",
  },
  WEBM_VP9: {
    mimeType: "video/webm; codecs=vp9",
    extension: "webm",
    codec: "vp9",
  },
};

// Get optimal video format based on browser support
export const getOptimalVideoFormat = () => {
  const mediaRecorder = window.MediaRecorder;

  if (!mediaRecorder) {
    throw new Error("MediaRecorder not supported");
  }

  // Check support in order of preference
  const formats = [
    "video/mp4; codecs=h264,aac",
    "video/webm; codecs=vp9,opus",
    "video/webm; codecs=vp8,opus",
    "video/webm",
  ];

  for (const format of formats) {
    if (mediaRecorder.isTypeSupported(format)) {
      return format;
    }
  }

  // Fallback
  return "video/webm";
};

// Get media stream with error handling
export const getUserMedia = async (constraints = VIDEO_CONSTRAINTS.HD) => {
  try {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("getUserMedia is not supported in this browser");
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Validate stream
    if (!stream || stream.getTracks().length === 0) {
      throw new Error("No media tracks available");
    }

    return stream;
  } catch (error) {
    console.error("Error getting user media:", error);

    // Try with reduced constraints if permission denied
    if (error.name === "NotAllowedError") {
      throw new Error(
        "Camera/microphone permission denied. Please allow access and try again."
      );
    } else if (error.name === "NotFoundError") {
      throw new Error(
        "No camera or microphone found. Please connect a device and try again."
      );
    } else if (error.name === "NotReadableError") {
      throw new Error(
        "Camera or microphone is already in use by another application."
      );
    } else {
      throw new Error(`Media access error: ${error.message}`);
    }
  }
};

// Stop all media tracks
export const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
};

// Get available media devices
export const getMediaDevices = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error("Device enumeration not supported");
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    return {
      videoInputs: devices.filter((device) => device.kind === "videoinput"),
      audioInputs: devices.filter((device) => device.kind === "audioinput"),
      audioOutputs: devices.filter((device) => device.kind === "audiooutput"),
    };
  } catch (error) {
    console.error("Error enumerating devices:", error);
    return { videoInputs: [], audioInputs: [], audioOutputs: [] };
  }
};

// Create video element from blob
export const createVideoFromBlob = (blob) => {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(blob);
  video.controls = true;
  return video;
};

// Download video blob as file
export const downloadVideo = (blob, filename = "interview-recording.webm") => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Get video duration from blob
export const getVideoDuration = (blob) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(blob);
  });
};

// Compress video blob (basic compression by reducing quality)
export const compressVideo = async (blob, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth * quality;
      canvas.height = video.videoHeight * quality;

      video.ontimeupdate = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      };

      // This is a simplified approach - real compression would need more sophisticated methods
      canvas.toBlob(resolve, "video/webm", quality);
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(blob);
  });
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Format duration for display
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

// Check browser compatibility
export const checkBrowserCompatibility = () => {
  const issues = [];

  if (!navigator.mediaDevices) {
    issues.push("MediaDevices API not supported");
  }

  if (!navigator.mediaDevices.getUserMedia) {
    issues.push("getUserMedia not supported");
  }

  if (!window.MediaRecorder) {
    issues.push("MediaRecorder not supported");
  }

  if (!navigator.mediaDevices.enumerateDevices) {
    issues.push("Device enumeration not supported");
  }

  return {
    compatible: issues.length === 0,
    issues,
  };
};

// Video stream utilities
export const getVideoTrackSettings = (stream) => {
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) return null;

  return videoTrack.getSettings();
};

export const getAudioTrackSettings = (stream) => {
  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack) return null;

  return audioTrack.getSettings();
};

// Apply video filters/effects
export const applyVideoFilter = (videoElement, filter) => {
  const filters = {
    none: "none",
    blur: "blur(2px)",
    brightness: "brightness(1.2)",
    contrast: "contrast(1.2)",
    grayscale: "grayscale(100%)",
    sepia: "sepia(100%)",
  };

  videoElement.style.filter = filters[filter] || filters.none;
};

// Screen recording utilities (for screen sharing)
export const getScreenMedia = async (constraints = {}) => {
  try {
    if (!navigator.mediaDevices.getDisplayMedia) {
      throw new Error("Screen sharing not supported");
    }

    const defaultConstraints = {
      video: {
        mediaSource: "screen",
        width: { max: 1920 },
        height: { max: 1080 },
        frameRate: { max: 30 },
      },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getDisplayMedia({
      ...defaultConstraints,
      ...constraints,
    });

    return stream;
  } catch (error) {
    console.error("Error getting screen media:", error);
    throw error;
  }
};
