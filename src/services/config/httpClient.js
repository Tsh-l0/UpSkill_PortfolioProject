// services/config/httpClient.js - CORS FIXED
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

console.log('API Base URL:', API_BASE_URL); // Debug log

// Create main axios instance
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Only include headers that backend CORS allows
    'X-Client-Version': '1.0.0',
  },
  withCredentials: true, // Important for CORS
});

// Token management utilities
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('upskill-auth');
    console.log('📦 Raw auth data from localStorage:', authData ? 'exists' : 'missing');
    
    if (authData) {
      const parsed = JSON.parse(authData);
      console.log('📦 Parsed auth data keys:', Object.keys(parsed));
      
      const token = parsed.state?.token || parsed.token;
      console.log('🔑 Extracted token:', token ? 'found' : 'missing');
      
      return token;
    }
  } catch (error) {
    console.warn('❌ Error parsing auth data:', error);
    localStorage.removeItem('upskill-auth');
  }
  return null;
};

const clearAuthData = () => {
  localStorage.removeItem('upskill-auth');
  localStorage.removeItem('upskill-user');
};

// Request interceptor - Add auth token and logging
httpClient.interceptors.request.use(
  config => {
    // Add timestamp for request duration tracking
    config.metadata = { startTime: new Date() };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached:', token.substring(0, 20) + '...'); // Debug log
    } else {
      console.log('❌ No token available'); // Debug log
    }

    // Add session ID (allowed by backend CORS)
    config.headers['X-Session-ID'] = `session_${Date.now()}`;

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
    }

    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
httpClient.interceptors.response.use(
  response => {
    // Calculate request duration
    const duration = response.config.metadata
      ? new Date() - response.config.metadata.startTime
      : 0;

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.status} ${response.config.url} (${duration}ms)`,
        response.data
      );
    }

    // Return the response data directly (your backend returns { success, data, message })
    return response.data;
  },
  error => {
    const { response, request, config } = error;

    // Calculate request duration if possible
    const duration = config?.metadata 
      ? new Date() - config.metadata.startTime 
      : 0;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ ${response?.status || 'NETWORK'} ${config?.url} (${duration}ms)`,
        {
          message: error.message,
          response: response?.data,
          config: {
            baseURL: config?.baseURL,
            url: config?.url,
            method: config?.method,
          }
        }
      );
    }

    // Handle different error types
    if (!response) {
      // Network error
      console.error('Network Error:', error.message);
      toast.error('Network error. Please check your connection and try again.');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // HTTP error response
    const errorMessage = response?.data?.message || response?.data?.error || error.message;
    
    // Don't show toast for auth errors (handled by auth store)
    if (response?.status !== 401 && response?.status !== 403) {
      toast.error(errorMessage);
    }

    return Promise.reject(new Error(errorMessage));
  }
);

// Helper functions for common HTTP methods
export const get = (url, config = {}) => httpClient.get(url, config);
export const post = (url, data = {}, config = {}) => httpClient.post(url, data, config);
export const put = (url, data = {}, config = {}) => httpClient.put(url, data, config);
export const del = (url, config = {}) => httpClient.delete(url, config);
export const patch = (url, data = {}, config = {}) => httpClient.patch(url, data, config);

// File upload helper
export const upload = (url, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  return httpClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress ? (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(progress);
    } : undefined,
  });
};

// Batch requests helper
export const batchRequests = async (requests) => {
  try {
    const responses = await Promise.allSettled(
      requests.map(req => httpClient.request(req))
    );
    
    return responses.map(response => ({
      success: response.status === 'fulfilled',
      data: response.status === 'fulfilled' ? response.value : null,
      error: response.status === 'rejected' ? response.reason : null,
    }));
  } catch (error) {
    console.error('Batch request failed:', error);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await httpClient.get('/health', { timeout: 5000 });
    return {
      healthy: true,
      ...response,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
    };
  }
};

// Configuration getters
export const getConfig = () => ({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

export { clearAuthData, getAuthToken };
export default httpClient;