import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce hook - delays updating a value until after delay has passed
 * Perfect for search inputs and API calls
 */
const useDebounce = (value, delay = 300, options = {}) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef(null);

  const {
    leading = false, // Execute immediately on first change
    trailing = true, // Execute after delay
    maxWait = null, // Maximum time to wait
    onDebounce = null, // Callback when debounce starts
    onResolve = null, // Callback when debounce resolves
  } = options;

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Execute immediately if leading edge
    if (leading && !isDebouncing) {
      setDebouncedValue(value);
      onResolve?.(value);
    }

    // Set debouncing state
    setIsDebouncing(true);
    onDebounce?.(value);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
        onResolve?.(value);
      }
      setIsDebouncing(false);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing, onDebounce, onResolve]);

  // MaxWait functionality
  useEffect(() => {
    if (!maxWait) return;

    const maxWaitTimeout = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
      onResolve?.(value);
    }, maxWait);

    return () => clearTimeout(maxWaitTimeout);
  }, [value, maxWait, onResolve]);

  // Manual cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsDebouncing(false);
    }
  }, []);

  // Manual flush function (execute immediately)
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDebouncedValue(value);
    setIsDebouncing(false);
    onResolve?.(value);
  }, [value, onResolve]);

  return {
    debouncedValue,
    isDebouncing,
    cancel,
    flush,
  };
};

/**
 * Debounced callback hook - debounces function calls
 * Perfect for API calls triggered by user input
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when deps change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const flush = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    callbackRef.current(...args);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedCallback,
    cancel,
    flush,
  };
};

/**
 * Search hook - combines debouncing with search state management
 * Perfect for search inputs with loading states
 */
export const useSearch = (initialQuery = '', delay = 300, options = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  const { minLength = 1, onSearch = null, onClear = null } = options;

  const { debouncedValue: debouncedQuery, isDebouncing } = useDebounce(
    query,
    delay,
    {
      onDebounce: () => setIsSearching(true),
      onResolve: value => {
        setIsSearching(false);
        if (value.length >= minLength) {
          onSearch?.(value);
        } else if (value.length === 0) {
          onClear?.();
        }
      },
    }
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsSearching(false);
    onClear?.();
  }, [onClear]);

  const hasQuery = query.length > 0;
  const isValidQuery = query.length >= minLength;
  const shouldShowLoading = isSearching && isValidQuery;

  return {
    query,
    setQuery,
    debouncedQuery,
    isSearching: shouldShowLoading,
    isDebouncing,
    clearSearch,
    hasQuery,
    isValidQuery,
  };
};

/**
 * Form debounce hook - debounces form validation and submission
 */
export const useFormDebounce = (formData, delay = 500) => {
  const [debouncedFormData, setDebouncedFormData] = useState(formData);
  const [isValidating, setIsValidating] = useState(false);

  const { debouncedValue, isDebouncing } = useDebounce(formData, delay, {
    onDebounce: () => setIsValidating(true),
    onResolve: value => {
      setDebouncedFormData(value);
      setIsValidating(false);
    },
  });

  return {
    debouncedFormData,
    isValidating: isDebouncing || isValidating,
  };
};

/**
 * API debounce hook - combines debouncing with API calls
 */
export const useApiDebounce = (apiFunction, delay = 300) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedApiCall = useDebouncedCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, delay);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    debouncedApiCall.cancel();
  }, [debouncedApiCall]);

  return {
    data,
    loading,
    error,
    execute: debouncedApiCall.debouncedCallback,
    cancel: debouncedApiCall.cancel,
    flush: debouncedApiCall.flush,
    reset,
  };
};

export default useDebounce;
