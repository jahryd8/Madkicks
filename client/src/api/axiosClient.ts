// src/api/axiosClient.ts
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Increased to 30s to account for potential Render free-tier cold starts
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const rawToken = localStorage.getItem('token');
    
    if (rawToken && config.headers) {
      // Clean quotes, leading/trailing whitespace, and redundant Bearer prefixes
      const cleanToken = rawToken
        .replace(/^"|"$/g, '')
        .replace(/^bearer\s+/i, '')
        .trim();

      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect only on true unauthorized requests
      localStorage.removeItem('token');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;