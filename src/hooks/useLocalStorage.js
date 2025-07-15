import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Enhanced localStorage hook with JSON support, error handling, and SSR safety
 */
const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
    onError = null,
  } = options;

  const [storedValue, setStoredValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const isInitialized = useRef(false);

  // Initialize value from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsedValue = deserialize(item);
        setStoredValue(parsedValue);
      }
      setError(null);
    } catch (err) {
      console.error(`Error reading localStorage key "${key}":`, err);
      setError(err);
      onError?.(err, 'read');
    } finally {
      isInitialized.current = true;
    }
  }, [key, deserialize, onError]);

  // Update localStorage when value changes
  const setValue = useCallback(
    value => {
      if (typeof window === 'undefined') return;

      try {
        // Allow value to be a function for functional updates
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialize(valueToStore));
        }

        setError(null);

        // Dispatch custom event for cross-tab sync
        if (syncAcrossTabs) {
          window.dispatchEvent(
            new CustomEvent('localStorage-change', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (err) {
        console.error(`Error setting localStorage key "${key}":`, err);
        setError(err);
        onError?.(err, 'write');
      }
    },
    [key, serialize, storedValue, syncAcrossTabs, onError]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    setValue(undefined);
  }, [setValue]);

  // Cross-tab synchronization
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = e => {
      if (e.key === key && e.newValue !== e.oldValue) {
        try {
          const newValue = e.newValue ? deserialize(e.newValue) : initialValue;
          setStoredValue(newValue);
          setError(null);
        } catch (err) {
          console.error(`Error syncing localStorage key "${key}":`, err);
          setError(err);
          onError?.(err, 'sync');
        }
      }
    };

    const handleCustomStorageChange = e => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage-change', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'localStorage-change',
        handleCustomStorageChange
      );
    };
  }, [key, deserialize, initialValue, syncAcrossTabs, onError]);

  return [storedValue, setValue, removeValue, error, isInitialized.current];
};

/**
 * Session storage hook - similar to localStorage but for session only
 */
export const useSessionStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = null,
  } = options;

  const [storedValue, setStoredValue] = useState(initialValue);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.sessionStorage.getItem(key);
      if (item !== null) {
        setStoredValue(deserialize(item));
      }
      setError(null);
    } catch (err) {
      console.error(`Error reading sessionStorage key "${key}":`, err);
      setError(err);
      onError?.(err, 'read');
    }
  }, [key, deserialize, onError]);

  const setValue = useCallback(
    value => {
      if (typeof window === 'undefined') return;

      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (valueToStore === undefined) {
          window.sessionStorage.removeItem(key);
        } else {
          window.sessionStorage.setItem(key, serialize(valueToStore));
        }

        setError(null);
      } catch (err) {
        console.error(`Error setting sessionStorage key "${key}":`, err);
        setError(err);
        onError?.(err, 'write');
      }
    },
    [key, serialize, storedValue, onError]
  );

  const removeValue = useCallback(() => {
    setValue(undefined);
  }, [setValue]);

  return [storedValue, setValue, removeValue, error];
};

/**
 * Storage state hook - manages multiple localStorage keys as one state object
 */
export const useStorageState = (
  storageKey,
  initialState = {},
  options = {}
) => {
  const [state, setState, removeState, error] = useLocalStorage(
    storageKey,
    initialState,
    options
  );

  const updateState = useCallback(
    updates => {
      setState(prevState => ({
        ...prevState,
        ...updates,
      }));
    },
    [setState]
  );

  const resetState = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);

  const setStateKey = useCallback(
    (key, value) => {
      setState(prevState => ({
        ...prevState,
        [key]: value,
      }));
    },
    [setState]
  );

  const removeStateKey = useCallback(
    key => {
      setState(prevState => {
        const newState = { ...prevState };
        delete newState[key];
        return newState;
      });
    },
    [setState]
  );

  return {
    state,
    setState,
    updateState,
    resetState,
    setStateKey,
    removeStateKey,
    removeState,
    error,
  };
};

/**
 * Persistent form hook - saves form data to localStorage
 */
export const usePersistentForm = (formKey, initialValues = {}) => {
  const [formData, setFormData, removeFormData] = useLocalStorage(
    `form-${formKey}`,
    initialValues
  );

  const updateField = useCallback(
    (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    [setFormData]
  );

  const updateFields = useCallback(
    updates => {
      setFormData(prev => ({
        ...prev,
        ...updates,
      }));
    },
    [setFormData]
  );

  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, [setFormData, initialValues]);

  const clearForm = useCallback(() => {
    removeFormData();
  }, [removeFormData]);

  const getFieldValue = useCallback(
    field => {
      return formData[field];
    },
    [formData]
  );

  const hasUnsavedChanges = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialValues);
  }, [formData, initialValues]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    clearForm,
    getFieldValue,
    hasUnsavedChanges,
  };
};

/**
 * Storage quota hook - monitors localStorage usage
 */
export const useStorageQuota = () => {
  const [usage, setUsage] = useState({ used: 0, total: 0, percentage: 0 });

  const calculateUsage = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      // Estimate quota (browsers typically allow 5-10MB)
      const estimatedQuota = 5 * 1024 * 1024; // 5MB
      const percentage = (totalSize / estimatedQuota) * 100;

      setUsage({
        used: totalSize,
        total: estimatedQuota,
        percentage: Math.min(percentage, 100),
      });
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
  }, []);

  useEffect(() => {
    calculateUsage();

    // Recalculate on storage changes
    const handleStorageChange = () => calculateUsage();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [calculateUsage]);

  const formatSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    usage,
    formatSize,
    calculateUsage,
    isNearLimit: usage.percentage > 80,
    isFull: usage.percentage >= 95,
  };
};

/**
 * Storage backup hook - backup and restore localStorage data
 */
export const useStorageBackup = () => {
  const createBackup = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const backup = {};
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          backup[key] = localStorage[key];
        }
      }
      return {
        data: backup,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }, []);

  const restoreBackup = useCallback(backup => {
    if (typeof window === 'undefined' || !backup?.data) return false;

    try {
      // Clear existing data
      localStorage.clear();

      // Restore backup data
      Object.entries(backup.data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }, []);

  const exportBackup = useCallback(() => {
    const backup = createBackup();
    if (!backup) return;

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upskill-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [createBackup]);

  return {
    createBackup,
    restoreBackup,
    exportBackup,
  };
};

export default useLocalStorage;
