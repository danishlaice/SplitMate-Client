import axios from "axios";
import { getAuthToken } from "../utils/storage.js";

const API = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || "https://splitmate-api-3hxq.onrender.com/api",
});

API.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Storage access protected against any runtime errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;