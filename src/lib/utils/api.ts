import axios from "axios";

export const api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com", //trocar pela baseURL do backend
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);
