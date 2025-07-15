import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Infinite scroll hook using Intersection Observer
 * Perfect for paginated lists and feeds
 */
const useInfiniteScroll = (options = {}) => {
  const {
    fetchMore,
    hasNextPage = true,
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
    onLoadMore = null,
    onError = null,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  // Intersection Observer hook
  const { ref: triggerRef, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false,
  });

  // Load more function
  const loadMore = useCallback(async () => {
    if (!enabled || !hasNextPage || loading || loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      await fetchMore?.();
      onLoadMore?.();
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [enabled, hasNextPage, loading, fetchMore, onLoadMore, onError]);

  // Trigger load when in view
  useEffect(() => {
    if (inView && enabled && hasNextPage && !loading) {
      loadMore();
    }
  }, [inView, enabled, hasNextPage, loading, loadMore]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    loadingRef.current = false;
  }, []);

  return {
    triggerRef,
    loading,
    error,
    loadMore,
    reset,
    inView,
  };
};

/**
 * Paginated list hook - manages pagination state with infinite scroll
 */
export const usePaginatedList = (initialData = [], options = {}) => {
  const {
    pageSize = 20,
    fetchPage,
    searchQuery = '',
    filters = {},
    sortBy = null,
    sortOrder = 'asc',
  } = options;

  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasNextPage = data.length < totalItems;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Fetch page function
  const fetchMoreData = useCallback(async () => {
    if (!fetchPage || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchPage({
        page: currentPage,
        pageSize,
        search: searchQuery,
        filters,
        sortBy,
        sortOrder,
      });

      const newItems = response.data || [];
      const total = response.total || response.totalItems || 0;

      if (currentPage === 1) {
        setData(newItems);
      } else {
        setData(prev => [...prev, ...newItems]);
      }

      setTotalItems(total);
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    fetchPage,
    loading,
  ]);

  // Infinite scroll hook
  const infiniteScroll = useInfiniteScroll({
    fetchMore: fetchMoreData,
    hasNextPage,
    enabled: !loading && !error,
  });

  // Refresh function
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setData([]);
    setError(null);

    try {
      await fetchMoreData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchMoreData]);

  // Reset when search or filters change
  useEffect(() => {
    setCurrentPage(1);
    setData([]);
    setError(null);
  }, [searchQuery, JSON.stringify(filters), sortBy, sortOrder]);

  // Load initial data
  useEffect(() => {
    if (currentPage === 1 && data.length === 0 && !loading) {
      fetchMoreData();
    }
  }, [currentPage, data.length, loading, fetchMoreData]);

  return {
    // Data state
    data,
    loading: loading || refreshing,
    error,
    refreshing,

    // Pagination state
    currentPage: currentPage - 1, // Adjust for 0-based indexing
    totalPages,
    totalItems,
    hasNextPage,

    // Actions
    refresh,
    loadMore: infiniteScroll.loadMore,

    // Infinite scroll
    triggerRef: infiniteScroll.triggerRef,
    inView: infiniteScroll.inView,
  };
};

/**
 * Virtual scroll hook - for large lists with virtualization
 */
export const useVirtualScroll = (items, options = {}) => {
  const { itemHeight = 100, containerHeight = 400, overscan = 5 } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleItems + overscan * 2
  );

  const visibleData = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback(e => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const scrollToIndex = useCallback(
    index => {
      if (containerRef.current) {
        const scrollTop = index * itemHeight;
        containerRef.current.scrollTop = scrollTop;
        setScrollTop(scrollTop);
      }
    },
    [itemHeight]
  );

  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1);
  }, [scrollToIndex, items.length]);

  return {
    containerRef,
    visibleData,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
};

/**
 * Load more button hook - alternative to infinite scroll
 */
export const useLoadMore = (options = {}) => {
  const { fetchMore, hasNextPage = true, pageSize = 20 } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;

    setLoading(true);
    setError(null);

    try {
      await fetchMore?.();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [hasNextPage, loading, fetchMore]);

  return {
    loadMore,
    loading,
    error,
    canLoadMore: hasNextPage && !loading,
  };
};

/**
 * Scroll position hook - tracks and restores scroll position
 */
export const useScrollPosition = (key, options = {}) => {
  const { threshold = 50, saveDelay = 100 } = options;

  const [scrollPosition, setScrollPosition] = useState(0);
  const timeoutRef = useRef(null);

  // Save scroll position to storage
  const savePosition = useCallback(
    position => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        localStorage.setItem(`scroll-${key}`, position.toString());
      }, saveDelay);
    },
    [key, saveDelay]
  );

  // Handle scroll event
  const handleScroll = useCallback(
    e => {
      const position = e.target.scrollTop;
      setScrollPosition(position);

      if (Math.abs(position - scrollPosition) > threshold) {
        savePosition(position);
      }
    },
    [scrollPosition, threshold, savePosition]
  );

  // Restore scroll position
  const restorePosition = useCallback(
    element => {
      const savedPosition = localStorage.getItem(`scroll-${key}`);
      if (savedPosition && element) {
        element.scrollTop = parseInt(savedPosition, 10);
        setScrollPosition(parseInt(savedPosition, 10));
      }
    },
    [key]
  );

  // Clear saved position
  const clearPosition = useCallback(() => {
    localStorage.removeItem(`scroll-${key}`);
    setScrollPosition(0);
  }, [key]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    scrollPosition,
    handleScroll,
    restorePosition,
    clearPosition,
  };
};

export default useInfiniteScroll;
