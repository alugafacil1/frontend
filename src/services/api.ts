import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081", 
    headers: {
        "Content-Type": "application/json",
    },
});

// Instância para endpoints públicos (sem autenticação)
export const publicApi = axios.create({
    baseURL: "http://localhost:8081", 
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;