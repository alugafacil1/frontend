import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    
    if (error.response) {
      
      
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          console.warn("Sessão expirada. Redirecionando para login...");
          
          
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);