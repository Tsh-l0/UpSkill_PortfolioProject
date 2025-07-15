import { toast } from 'react-hot-toast';
import { ERROR_CODES } from '../config/constants.js';

// Custom error classes
export class AppError extends Error {
  constructor(
    message,
    code = 'UNKNOWN_ERROR',
    statusCode = 500,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred') {
    super(message, ERROR_CODES.NETWORK_ERROR, 0);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, ERROR_CODES.UNAUTHORIZED, 401);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, ERROR_CODES.RESOURCE_NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, ERROR_CODES.PERMISSION_DENIED, 403);
    this.name = 'PermissionError';
  }
}

// Error categorization
export const categorizeError = error => {
  if (error instanceof ValidationError) return 'validation';
  if (error instanceof NetworkError) return 'network';
  if (error instanceof AuthError) return 'auth';
  if (error instanceof NotFoundError) return 'not_found';
  if (error instanceof PermissionError) return 'permission';

  // Categorize by status code
  if (error.statusCode) {
    if (error.statusCode >= 400 && error.statusCode < 500) return 'client';
    if (error.statusCode >= 500) return 'server';
  }

  // Categorize by error code
  if (error.code) {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return 'network';
      case 'UNAUTHORIZED':
      case 'TOKEN_EXPIRED':
        return 'auth';
      case 'VALIDATION_ERROR':
      case 'REQUIRED_FIELD':
      case 'INVALID_FORMAT':
        return 'validation';
      default:
        return 'unknown';
    }
  }

  return 'unknown';
};

// Error severity levels
export const getErrorSeverity = error => {
  const category = categorizeError(error);

  switch (category) {
    case 'network':
    case 'server':
      return 'high';
    case 'auth':
    case 'permission':
      return 'medium';
    case 'validation':
    case 'client':
      return 'low';
    default:
      return 'medium';
  }
};

// Error logging
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    name: error.name,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    category: categorizeError(error),
    severity: getErrorSeverity(error),
    timestamp: new Date().toISOString(),
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ${errorInfo.severity.toUpperCase()} ERROR`);
    console.error('Message:', errorInfo.message);
    console.error('Category:', errorInfo.category);
    console.error('Code:', errorInfo.code);
    console.error('Context:', errorInfo.context);
    console.error('Stack:', errorInfo.stack);
    console.groupEnd();
  }

  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    window.errorTracker?.captureException(error, {
      tags: {
        category: errorInfo.category,
        severity: errorInfo.severity,
      },
      extra: errorInfo.context,
    });
  }

  return errorInfo;
};

// Error notification
export const notifyError = (error, options = {}) => {
  const { showToast = true, toastDuration = 4000, title = 'Error' } = options;

  const category = categorizeError(error);
  const message = getUserFriendlyMessage(error);

  if (showToast) {
    switch (category) {
      case 'validation':
        toast.error(message, {
          duration: toastDuration,
          id: 'validation-error',
        });
        break;
      case 'auth':
        toast.error(message, { duration: toastDuration, id: 'auth-error' });
        break;
      case 'network':
        toast.error(message, { duration: toastDuration, id: 'network-error' });
        break;
      default:
        toast.error(message, { duration: toastDuration });
    }
  }
};

// User-friendly error messages
export const getUserFriendlyMessage = error => {
  const category = categorizeError(error);

  // Return specific message if available
  if (error.message && !error.message.includes('Error:')) {
    return error.message;
  }

  // Fallback to category-based messages
  switch (category) {
    case 'network':
      return 'Unable to connect. Please check your internet connection and try again.';
    case 'auth':
      return 'Your session has expired. Please log in again.';
    case 'permission':
      return "You don't have permission to perform this action.";
    case 'validation':
      return 'Please check your input and try again.';
    case 'not_found':
      return 'The requested resource could not be found.';
    case 'server':
      return 'Something went wrong on our end. Please try again later.';
    case 'client':
      return 'There was an issue with your request. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Error recovery suggestions
export const getRecoverySuggestions = error => {
  const category = categorizeError(error);

  switch (category) {
    case 'network':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Try again in a few moments',
      ];
    case 'auth':
      return [
        'Log in again',
        'Clear your browser cache',
        'Contact support if the issue persists',
      ];
    case 'validation':
      return [
        'Check your input for errors',
        'Make sure all required fields are filled',
        'Verify the format of your data',
      ];
    case 'server':
      return [
        'Try again in a few minutes',
        'Check our status page for updates',
        'Contact support if the issue continues',
      ];
    default:
      return [
        'Try refreshing the page',
        'Try again in a few moments',
        'Contact support if the problem continues',
      ];
  }
};

// Error boundary helper
export const createErrorBoundary = fallbackComponent => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      logError(error, { errorInfo, component: 'ErrorBoundary' });
    }

    render() {
      if (this.state.hasError) {
        return fallbackComponent
          ? fallbackComponent(this.state.error)
          : React.createElement('div', null, 'Something went wrong.');
      }

      return this.props.children;
    }
  };
};

// Async error wrapper
export const withErrorHandling = (asyncFn, options = {}) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const enhancedError =
        error instanceof AppError
          ? error
          : new AppError(
              error.message || 'Unknown error occurred',
              error.code || 'UNKNOWN_ERROR',
              error.statusCode || 500
            );

      logError(enhancedError, { function: asyncFn.name, args });

      if (options.notify !== false) {
        notifyError(enhancedError, options.notifyOptions);
      }

      if (options.rethrow !== false) {
        throw enhancedError;
      }

      return options.fallback || null;
    }
  };
};

// Retry with exponential backoff
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = error =>
      categorizeError(error) === 'network' ||
      categorizeError(error) === 'server',
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt > maxRetries || !retryCondition(error)) {
        throw error;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Global error handler
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    logError(
      new AppError(
        event.reason?.message || 'Unhandled promise rejection',
        'UNHANDLED_REJECTION'
      ),
      { type: 'unhandledrejection' }
    );

    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', event => {
    logError(
      new AppError(
        event.error?.message || event.message || 'Uncaught error',
        'UNCAUGHT_ERROR'
      ),
      {
        type: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });
};

// Error reporting
export const reportError = async (error, additionalInfo = {}) => {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    category: categorizeError(error),
    severity: getErrorSeverity(error),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: additionalInfo.userId,
    sessionId: additionalInfo.sessionId,
    additionalInfo,
  };

  try {
    // Send error report to backend
    await fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
    });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};

export default {
  AppError,
  ValidationError,
  NetworkError,
  AuthError,
  NotFoundError,
  PermissionError,
  categorizeError,
  getErrorSeverity,
  logError,
  notifyError,
  getUserFriendlyMessage,
  getRecoverySuggestions,
  createErrorBoundary,
  withErrorHandling,
  retryWithBackoff,
  setupGlobalErrorHandler,
  reportError,
};
