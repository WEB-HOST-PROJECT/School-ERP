import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

// Add a response interceptor for global error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

export default API