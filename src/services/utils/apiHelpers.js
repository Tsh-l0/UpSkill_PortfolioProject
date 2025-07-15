// Build query string from params object
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// Parse query string to params object
export const parseQueryString = queryString => {
  const params = {};
  const searchParams = new URLSearchParams(queryString);

  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      // Convert to array if multiple values
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  }

  return params;
};

// Build URL with path parameters
export const buildUrlWithParams = (url, params = {}) => {
  let builtUrl = url;

  Object.entries(params).forEach(([key, value]) => {
    builtUrl = builtUrl.replace(`:${key}`, encodeURIComponent(value));
  });

  return builtUrl;
};

// Extract error message from API response
export const extractErrorMessage = error => {
  if (typeof error === 'string') return error;

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  return 'An unexpected error occurred';
};

// Extract validation errors from API response
export const extractValidationErrors = error => {
  const errors = {};

  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }

  if (error?.data?.errors) {
    return error.data.errors;
  }

  if (error?.errors) {
    return error.errors;
  }

  return errors;
};

// Check if error is network related
export const isNetworkError = error => {
  return (
    !error.response ||
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ECONNABORTED' ||
    error.message === 'Network Error'
  );
};

// Check if error is server error (5xx)
export const isServerError = error => {
  return error?.response?.status >= 500;
};

// Check if error is client error (4xx)
export const isClientError = error => {
  const status = error?.response?.status;
  return status >= 400 && status < 500;
};

// Check if error is authentication error
export const isAuthError = error => {
  const status = error?.response?.status;
  return status === 401 || status === 403;
};

// Format API response for consistent structure
export const formatApiResponse = response => {
  return {
    data: response.data || response,
    status: response.status || 200,
    headers: response.headers || {},
    success: true,
  };
};

// Format API error for consistent structure
export const formatApiError = error => {
  return {
    message: extractErrorMessage(error),
    errors: extractValidationErrors(error),
    status: error?.response?.status || 0,
    code: error?.code || 'UNKNOWN_ERROR',
    success: false,
  };
};

// Retry configuration for API calls
export const createRetryConfig = (maxRetries = 3, baseDelay = 1000) => {
  return {
    retries: maxRetries,
    retryDelay: retryCount => {
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, retryCount - 1);
      const jitter = Math.random() * 1000;
      return delay + jitter;
    },
    retryCondition: error => {
      // Retry on network errors and 5xx server errors
      return isNetworkError(error) || isServerError(error);
    },
  };
};

// Timeout configuration
export const createTimeoutConfig = (timeout = 30000) => {
  return { timeout };
};

// Request interceptor helpers
export const createAuthInterceptor = getToken => {
  return config => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };
};

export const createLoggingInterceptor = (logger = console) => {
  return config => {
    logger.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  };
};

// Response interceptor helpers
export const createResponseLoggingInterceptor = (logger = console) => {
  return response => {
    logger.log(`API Response: ${response.status} ${response.config?.url}`);
    return response;
  };
};

export const createErrorLoggingInterceptor = (logger = console) => {
  return error => {
    logger.error(
      `API Error: ${error.response?.status || 'NETWORK'} ${error.config?.url}`,
      error
    );
    return Promise.reject(error);
  };
};

// Data transformation helpers
export const transformRequestData = (data, transformers = []) => {
  return transformers.reduce((acc, transformer) => transformer(acc), data);
};

export const transformResponseData = (data, transformers = []) => {
  return transformers.reduce((acc, transformer) => transformer(acc), data);
};

// Common data transformers
export const transformers = {
  // Convert snake_case to camelCase
  toCamelCase: obj => {
    if (Array.isArray(obj)) {
      return obj.map(item => transformers.toCamelCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        acc[camelKey] = transformers.toCamelCase(obj[key]);
        return acc;
      }, {});
    }

    return obj;
  },

  // Convert camelCase to snake_case
  toSnakeCase: obj => {
    if (Array.isArray(obj)) {
      return obj.map(item => transformers.toSnakeCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(
          /[A-Z]/g,
          letter => `_${letter.toLowerCase()}`
        );
        acc[snakeKey] = transformers.toSnakeCase(obj[key]);
        return acc;
      }, {});
    }

    return obj;
  },

  // Remove null/undefined values
  removeEmpty: obj => {
    if (Array.isArray(obj)) {
      return obj
        .map(item => transformers.removeEmpty(item))
        .filter(item => item != null);
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const value = transformers.removeEmpty(obj[key]);
        if (value != null) {
          acc[key] = value;
        }
        return acc;
      }, {});
    }

    return obj;
  },

  // Convert dates to ISO strings
  serializeDates: obj => {
    if (Array.isArray(obj)) {
      return obj.map(item => transformers.serializeDates(item));
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = transformers.serializeDates(obj[key]);
        return acc;
      }, {});
    }

    return obj;
  },

  // Parse ISO strings to dates
  parseDates: (obj, dateFields = []) => {
    if (Array.isArray(obj)) {
      return obj.map(item => transformers.parseDates(item, dateFields));
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        if (dateFields.includes(key) && typeof value === 'string') {
          acc[key] = new Date(value);
        } else {
          acc[key] = transformers.parseDates(value, dateFields);
        }
        return acc;
      }, {});
    }

    return obj;
  },
};

// Cache helpers
export const createCacheKey = (url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${url}:${JSON.stringify(sortedParams)}`;
};

export const createCacheTimeout = (minutes = 5) => {
  return minutes * 60 * 1000;
};

// Request deduplication
const pendingRequests = new Map();

export const deduplicate = async (key, requestFn) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

// Rate limiting helpers
export const createRateLimiter = (requests = 100, window = 60000) => {
  const requests_log = [];

  return () => {
    const now = Date.now();

    // Remove old requests outside the window
    while (requests_log.length > 0 && requests_log[0] <= now - window) {
      requests_log.shift();
    }

    if (requests_log.length >= requests) {
      const waitTime = requests_log[0] + window - now;
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    requests_log.push(now);
  };
};

// Progress tracking
export const createProgressTracker = onProgress => {
  return {
    onUploadProgress: progressEvent => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress?.(percentCompleted, 'upload');
    },

    onDownloadProgress: progressEvent => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress?.(percentCompleted, 'download');
    },
  };
};

export default {
  buildQueryString,
  parseQueryString,
  buildUrlWithParams,
  extractErrorMessage,
  extractValidationErrors,
  isNetworkError,
  isServerError,
  isClientError,
  isAuthError,
  formatApiResponse,
  formatApiError,
  createRetryConfig,
  createTimeoutConfig,
  createAuthInterceptor,
  createLoggingInterceptor,
  createResponseLoggingInterceptor,
  createErrorLoggingInterceptor,
  transformRequestData,
  transformResponseData,
  transformers,
  createCacheKey,
  createCacheTimeout,
  deduplicate,
  createRateLimiter,
  createProgressTracker,
};
