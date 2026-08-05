import axios from "axios";

const API = axios.create({
 baseURL: "https://splitmate-api-3hxq.onrender.com/api",
});

export default API;