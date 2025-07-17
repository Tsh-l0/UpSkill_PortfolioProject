import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      
      // Cache time - how long inactive data stays in cache (10 minutes)
      cacheTime: 10 * 60 * 1000,
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408 (timeout)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
          return false;
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (disabled in development)
      refetchOnWindowFocus: import.meta.env.PROD,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Background refetch interval (disabled by default)
      refetchInterval: false,
      
      // Don't refetch on mount if data exists and is not stale
      refetchOnMount: true,
      
      // Network mode
      networkMode: 'online',
    },
    
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // Don't retry on 4xx errors
      retryDelay: 1000,
      
      // Global error handler for mutations
      onError: (error, variables, context) => {
        console.error('🚨 Mutation error:', error);
        
        // Only show toast for non-auth errors (auth errors are handled by auth store)
        if (error?.status !== 401 && error?.status !== 403) {
          const message = error?.message || error?.data?.message || 'Something went wrong';
          toast.error(message);
        }
      },
      
      // Global success handler for mutations
      onSuccess: (data, variables, context) => {
        // Log successful mutations in development
        if (import.meta.env.DEV) {
          console.log('✅ Mutation success:', data);
        }
      },
    },
  },
});

// Global error handler for queries
queryClient.setMutationDefaults(['query'], {
  onError: (error) => {
    console.error('🚨 Query error:', error);
    
    // Handle specific error types
    if (error?.status === 401) {
      // Authentication error - handled by auth store
      return;
    }
    
    if (error?.status === 403) {
      // Permission error
      toast.error('You do not have permission to access this resource');
      return;
    }
    
    if (error?.status === 404) {
      // Not found - usually handled by component
      return;
    }
    
    if (error?.status >= 500) {
      // Server error
      toast.error('Server error. Please try again later.');
      return;
    }
    
    // Network error
    if (!error?.status) {
      toast.error('Network error. Please check your connection.');
      return;
    }
    
    // Generic error
    const message = error?.message || 'An unexpected error occurred';
    toast.error(message);
  }
});

// Utility functions for query management
export const invalidateQueries = (queryKey) => {
  return queryClient.invalidateQueries({ queryKey });
};

export const setQueryData = (queryKey, data) => {
  return queryClient.setQueryData(queryKey, data);
};

export const getQueryData = (queryKey) => {
  return queryClient.getQueryData(queryKey);
};

export const removeQueries = (queryKey) => {
  return queryClient.removeQueries({ queryKey });
};

export const prefetchQuery = (queryKey, queryFn, options = {}) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    ...options
  });
};

// Clear all cache (useful for logout)
export const clearQueryCache = () => {
  queryClient.clear();
};

// Query key factories for consistent cache management
export const queryKeys = {
  // Auth queries
  auth: ['auth'],
  currentUser: () => [...queryKeys.auth, 'currentUser'],
  
  // User queries
  users: ['users'],
  user: (id) => [...queryKeys.users, 'detail', id],
  userProfile: (id) => [...queryKeys.users, 'profile', id],
  userAnalytics: (id, timeframe) => [...queryKeys.users, 'analytics', id, timeframe],
  searchUsers: (params) => [...queryKeys.users, 'search', params],
  trendingUsers: (params) => [...queryKeys.users, 'trending', params],
  
  // Skills queries
  skills: ['skills'],
  skillsAll: (params) => [...queryKeys.skills, 'all', params],
  skillsTrending: (params) => [...queryKeys.skills, 'trending', params],
  userSkills: (userId) => [...queryKeys.skills, 'user', userId],
  
  // Blog queries
  blog: ['blog'],
  blogPosts: (params) => [...queryKeys.blog, 'posts', params],
  blogPost: (id) => [...queryKeys.blog, 'post', id],
  blogCategories: () => [...queryKeys.blog, 'categories'],
  
  // Analytics queries
  analytics: ['analytics'],
  dashboardAnalytics: (params) => [...queryKeys.analytics, 'dashboard', params],
  skillsAnalytics: () => [...queryKeys.analytics, 'skills'],
  
  // Connections queries
  connections: ['connections'],
  userConnections: (userId) => [...queryKeys.connections, 'user', userId],
  pendingRequests: (type) => [...queryKeys.connections, 'pending', type],
  
  // Endorsements queries
  endorsements: ['endorsements'],
  userEndorsements: (userId, type) => [...queryKeys.endorsements, 'user', userId, type],
  
  // Projects queries
  projects: ['projects'],
  userProjects: (userId) => [...queryKeys.projects, 'user', userId],
  
  // Notifications queries
  notifications: ['notifications'],
  notificationsList: (params) => [...queryKeys.notifications, 'list', params],
  notificationCounts: () => [...queryKeys.notifications, 'counts'],
};

// Development tools
if (import.meta.env.DEV) {
  // Log cache changes in development
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'added') {
      console.log('📦 Query cache added:', event.query.queryKey);
    }
    if (event?.type === 'removed') {
      console.log('🗑️ Query cache removed:', event.query.queryKey);
    }
  });
}

export default queryClient;