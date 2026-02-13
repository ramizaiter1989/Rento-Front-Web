// lib/axios.js
import axios from "axios";

// Base URL for API (same as Postman: https://rento-lb.com/api/api)
let baseURL = import.meta.env.VITE_API_URL || "https://rento-lb.com/api/api";

// Clean up baseURL: remove trailing slashes
baseURL = baseURL.trim().replace(/\/+$/, "");

const api = axios.create({
  baseURL: baseURL,
  // withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    // Check both token and authToken for compatibility
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: auto logout if token expired (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear both token keys for compatibility
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // You can redirect automatically if you want:
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
