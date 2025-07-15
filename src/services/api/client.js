import axios from 'axios';
import { toast } from 'react-hot-toast';

// Environment configuration - FIXED API URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies if backend uses them
});

// Token management utilities
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('upskill-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token || parsed.state?.token;
    }
  } catch (error) {
    console.error('Error parsing auth data:', error);
    localStorage.removeItem('upskill-auth');
  }
  return null;
};

const clearAuthData = () => {
  localStorage.removeItem('upskill-auth');
  // Clear any other auth-related data
  localStorage.removeItem('upskill-user');
  localStorage.removeItem('upskill-refresh-token');
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  config => {
    // Add auth token
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log outgoing requests in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common responses and errors
apiClient.interceptors.response.use(
  response => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(
        `${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`,
        response.data
      );
    }

    // Return the response data directly (matches your backend structure)
    return response.data;
  },
  async error => {
    const { response, request, config } = error;

    // Calculate request duration if possible
    const duration = config?.metadata
      ? new Date() - config.metadata.startTime
      : 0;

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error(
        `${config?.method?.toUpperCase()} ${config?.url} failed - ${duration}ms`,
        error
      );
    }

    // Handle different error types
    if (response) {
      // Server responded with error status
      const { status, data } = response;

      switch (status) {
        case 400: // Bad request - show specific error message
        {
          const errorMsg = data?.error || data?.message || 'Bad request';
          toast.error(errorMsg);
          break;
        }

        case 401: // Unauthorized - clear auth and redirect
        {
          toast.error('Session expired. Please log in again.');
          clearAuthData();

          // Only redirect if not already on auth pages
          const currentPath = window.location.pathname;
          if (
            !['/login', '/signup', '/forgot-password'].includes(currentPath)
          ) {
            window.location.href = '/login';
          }
          break;
        }

        case 403:
          toast.error(
            "Access denied. You don't have permission for this action."
          );
          break;

        case 404:
          toast.error('Resource not found');
          break;

        case 409:
          // Conflict (duplicate data, etc.)
          toast.error(data?.error || 'Conflict: Resource already exists');
          break;

        case 422:
          // Validation errors - handle multiple errors
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach(error => toast.error(error));
          } else if (data?.error) {
            toast.error(data.error);
          } else {
            toast.error('Validation failed');
          }
          break;

        case 429:
          toast.error('Too many requests. Please slow down.');
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data?.error || data?.message || 'Something went wrong');
      }

      // Return structured error that matches your service expectations
      return Promise.reject({
        success: false,
        status,
        error: data?.error || data?.message || 'Request failed',
        errors: data?.errors || [],
        data: data,
      });
    } else if (request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        success: false,
        status: 0,
        error: 'Network error',
        errors: [],
        data: null,
      });
    } else {
      // Request setup error
      toast.error('Request failed to send');
      return Promise.reject({
        success: false,
        status: -1,
        error: error.message || 'Request setup failed',
        errors: [],
        data: null,
      });
    }
  }
);

// Helper functions for common request patterns
export const createRequest = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// File upload helper - updated for your backend
export const uploadFile = async (
  file,
  endpoint = '/users/upload-avatar',
  onProgress = null
) => {
  const formData = new FormData();
  formData.append('avatar', file); // Match your backend field name

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progressEvent => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  };

  return apiClient.post(endpoint, formData, config);
};

// Batch request helper
export const batchRequest = async requests => {
  try {
    const responses = await Promise.allSettled(requests);
    return responses.map((response, index) => ({
      index,
      success: response.status === 'fulfilled',
      data: response.status === 'fulfilled' ? response.value : null,
      error: response.status === 'rejected' ? response.reason : null,
    }));
  } catch (error) {
    console.error('Batch request failed:', error);
    throw error;
  }
};

// API health check
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 });
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
export const getApiConfig = () => ({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  debug: import.meta.env.VITE_DEBUG === 'true',
});

// Export utilities
export { clearAuthData, getAuthToken };

export default apiClient;
