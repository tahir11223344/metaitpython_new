// src/lib/apiClient.js
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============ REQUEST interceptor ============
// Har request ke sath token khud attach kar deta hai (agar hai to)
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ============ RESPONSE interceptor ============
// Agar kabhi bhi 401 (token expired/invalid) aaye, khud hi
// localStorage clear kar ke /login pe bhej deta hai — har jagah
// alag se try/catch likhne ki zaroorat nahi.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login?session=expired";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;