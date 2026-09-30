import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://splitmate-api-3hxq.onrender.com/api",
});

export default API;