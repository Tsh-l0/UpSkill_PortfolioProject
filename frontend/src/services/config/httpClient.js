import axios from 'axios';
import { toast } from 'react-hot-toast';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

console.log('🌐 API Base URL:', API_BASE_URL);

// Create main axios instance
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to false for CORS unless backend specifically needs it
});

// Token management utilities
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('upskill-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      // Handle both Zustand persist format and direct format
      const token = parsed.state?.token || parsed.token;
      return token;
    }
  } catch (error) {
    console.warn('⚠️ Error parsing auth data:', error);
    localStorage.removeItem('upskill-auth');
  }
  return null;
};

const clearAuthData = () => {
  try {
    localStorage.removeItem('upskill-auth');
    localStorage.removeItem('upskill-user');
    console.log('🧹 Auth data cleared');
  } catch (error) {
    console.warn('⚠️ Error clearing auth data:', error);
  }
};

// Request interceptor - Add auth token
httpClient.interceptors.request.use(
  config => {
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request metadata for timing
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
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
        `✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`
      );
    }

    // Return the response data directly (backend returns { success, data, message })
    return response.data;
  },
  error => {
    const { response, request, config } = error;

    // Calculate request duration if possible
    const duration = config?.metadata 
      ? new Date() - config.metadata.startTime 
      : 0;

    // Log error details
    if (import.meta.env.DEV) {
      console.error(
        `❌ ${response?.status || 'NETWORK'} ${config?.method?.toUpperCase() || 'UNKNOWN'} ${config?.url || 'UNKNOWN'} (${duration}ms)`,
        {
          message: error.message,
          responseData: response?.data,
          requestConfig: {
            baseURL: config?.baseURL,
            url: config?.url,
            method: config?.method,
            data: config?.data,
          }
        }
      );
    }

    // Handle different error types
    if (!response) {
      // Network error
      console.error('🌐 Network Error:', error.message);
      
      // Only show toast for actual network issues, not when backend is handling CORS
      if (error.code === 'NETWORK_ERROR' || error.message.includes('ERR_NETWORK')) {
        toast.error('Unable to connect to server. Please check your connection.');
      }
      
      return Promise.reject({
        success: false,
        error: 'Network connection failed',
        message: 'Unable to connect to server'
      });
    }

    // HTTP error response
    const status = response.status;
    const errorData = response.data;
    const errorMessage = errorData?.message || errorData?.error || error.message || 'Request failed';

    // Handle specific status codes
    if (status === 401) {
      // Unauthorized - don't show toast (auth store handles this)
      console.warn('🔐 Unauthorized request');
      clearAuthData(); // Clear invalid token
    } else if (status === 403) {
      // Forbidden - don't show toast
      console.warn('🚫 Forbidden request');
    } else if (status === 404) {
      // Not found - show specific message
      console.warn('🔍 Resource not found');
    } else if (status >= 500) {
      // Server error
      console.error('🔥 Server error:', status);
      toast.error('Server error. Please try again later.');
    } else if (status >= 400) {
      // Client error - show error message from server
      if (status !== 401 && status !== 403) {
        toast.error(errorMessage);
      }
    }

    // Return consistent error format
    return Promise.reject({
      success: false,
      error: errorMessage,
      status: status,
      data: errorData
    });
  }
);

// HTTP method helpers
export const get = async (url, config = {}) => {
  try {
    return await httpClient.get(url, config);
  } catch (error) {
    // Ensure consistent error format
    throw {
      success: false,
      error: error.error || error.message || 'GET request failed',
      status: error.status || 0,
      ...error
    };
  }
};

export const post = async (url, data = {}, config = {}) => {
  try {
    return await httpClient.post(url, data, config);
  } catch (error) {
    throw {
      success: false,
      error: error.error || error.message || 'POST request failed',
      status: error.status || 0,
      ...error
    };
  }
};

export const put = async (url, data = {}, config = {}) => {
  try {
    return await httpClient.put(url, data, config);
  } catch (error) {
    throw {
      success: false,
      error: error.error || error.message || 'PUT request failed',
      status: error.status || 0,
      ...error
    };
  }
};

export const del = async (url, config = {}) => {
  try {
    return await httpClient.delete(url, config);
  } catch (error) {
    throw {
      success: false,
      error: error.error || error.message || 'DELETE request failed',
      status: error.status || 0,
      ...error
    };
  }
};

export const patch = async (url, data = {}, config = {}) => {
  try {
    return await httpClient.patch(url, data, config);
  } catch (error) {
    throw {
      success: false,
      error: error.error || error.message || 'PATCH request failed',
      status: error.status || 0,
      ...error
    };
  }
};

// File upload helper
export const upload = async (url, file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      };
    }

    return await httpClient.post(url, formData, config);
  } catch (error) {
    throw {
      success: false,
      error: error.error || error.message || 'File upload failed',
      status: error.status || 0,
      ...error
    };
  }
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
      error: response.status === 'rejected' ? response.reason?.error || response.reason?.message : null,
    }));
  } catch (error) {
    console.error('Batch request failed:', error);
    throw {
      success: false,
      error: 'Batch request failed',
      details: error.message
    };
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await get('/health', { timeout: 5000 });
    return {
      healthy: true,
      ...response,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.error || error.message || 'Health check failed',
    };
  }
};

// Configuration getters
export const getConfig = () => ({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// Utility functions
export { clearAuthData, getAuthToken };

// Default export
export default httpClient;