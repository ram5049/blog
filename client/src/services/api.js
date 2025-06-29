// API Configuration and Base Setup
import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === "production" 
      ? "/api"  // Use relative path in production (served by same server)
      : "http://localhost:5000/api"),
  timeout: 10000,
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors, but be selective about showing toasts
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      if (
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.href = "/admin/login";
      }
    } else if (error.response?.status === 403) {
      // Only show toast for 403 if user is on an admin page
      if (window.location.pathname.startsWith("/admin")) {
        toast.error(
          "Access denied. You don't have permission to perform this action."
        );
      }
    } else if (error.response?.status >= 500) {
      // Only show server error toasts for explicit user actions, not background API calls
      if (!error.config?.headers?.["X-Background-Request"]) {
        toast.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please check your connection.");
    } else if (!error.response) {
      // Network error - only show if not a background request
      if (!error.config?.headers?.["X-Background-Request"]) {
        toast.error("Network error. Please check your connection.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
