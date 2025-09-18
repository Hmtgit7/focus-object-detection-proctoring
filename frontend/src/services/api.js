import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  getMe: () => api.get("/api/auth/me"),
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    return Promise.resolve();
  },
};

// Interview API calls
export const interviewAPI = {
  create: (interviewData) => api.post("/api/interviews", interviewData),
  getAll: (params = {}) => api.get("/api/interviews", { params }),
  getById: (id) => api.get(`/api/interviews/${id}`),
  update: (id, updateData) => api.put(`/api/interviews/${id}`, updateData),
  delete: (id) => api.delete(`/api/interviews/${id}`),
  start: (id) => api.put(`/api/interviews/${id}/start`),
  end: (id) => api.put(`/api/interviews/${id}/end`),
  uploadVideo: (id, formData) =>
    api.post(`/api/interviews/${id}/upload-video`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes for large video uploads
    }),
};

// Report API calls
export const reportAPI = {
  getAll: (params = {}) => api.get("/api/reports", { params }),
  getStats: (interviewId) => api.get(`/api/reports/${interviewId}/stats`),
  downloadPDF: (interviewId) =>
    api.get(`/api/reports/${interviewId}/pdf`, {
      responseType: "blob",
    }),
  downloadCSV: (interviewId) =>
    api.get(`/api/reports/${interviewId}/csv`, {
      responseType: "blob",
    }),
};

// Detection API calls
export const detectionAPI = {
  logDetection: (detectionData) =>
    api.post("/api/detections/log", detectionData),
  getDetectionLogs: (interviewId, params = {}) =>
    api.get(`/api/detections/interview/${interviewId}`, { params }),
};

// File upload helper
export const uploadFile = async (file, endpoint, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || "Server error occurred",
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Network error
    return {
      message: "Network error. Please check your connection.",
      status: 0,
      data: null,
    };
  } else {
    // Other error
    return {
      message: error.message || "An unexpected error occurred",
      status: 0,
      data: null,
    };
  }
};

export default api;
