/* eslint-disable no-undef */
import axios from 'axios';

const axiosInstance = axios.create({
  // eslint-disable-next-line no-undef
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Global error interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === 'production') {
      // Remove sensitive info in production
      delete error.config;
      delete error.request;
      delete error.response?.headers;
      delete error.response?.config;
    } else {
      // Log full error in development
      console.error('API Error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;