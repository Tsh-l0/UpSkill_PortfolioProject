import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Query client configuration
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache time - how long data stays in cache when unused
      cacheTime: 1000 * 60 * 10, // 10 minutes

      // Stale time - how long data is considered fresh
      staleTime: 1000 * 60 * 2, // 2 minutes

      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }

        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: attemptIndex => {
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      // Background refetch settings
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch when component mounts

      // Error handling
      onError: error => {
        // Log error for debugging
        console.error('Query error:', error);

        // Don't show toast for validation errors (422) or auth errors (401/403)
        if (
          error?.status === 422 ||
          error?.status === 401 ||
          error?.status === 403
        ) {
          return;
        }

        // Don't show toast for network errors that are already handled
        if (error?.code === 'NETWORK_ERROR') {
          return;
        }

        // Show generic error toast for other errors
        if (error?.message && !error?.message.includes('toast already shown')) {
          toast.error(error.message);
        }
      },
    },

    mutations: {
      // Retry mutations only once
      retry: 1,

      // Retry delay for mutations
      retryDelay: 2000,

      // Error handling for mutations
      onError: error => {
        console.error('Mutation error:', error);

        // Let individual mutations handle their own error display
        // This is just for logging and global error tracking
      },

      // Success handling
      onSuccess: data => {
        // Global success handling if needed
        console.log('Mutation success:', data);
      },
    },
  },
};

// Create the query client
export const queryClient = new QueryClient(queryClientConfig);

// Query key factories for consistent cache keys
export const queryKeys = {
  // Auth
  auth: ['auth'],
  authUser: () => [...queryKeys.auth, 'user'],
  authSessions: () => [...queryKeys.auth, 'sessions'],

  // Users
  users: ['users'],
  usersList: filters => [...queryKeys.users, 'list', filters],
  userProfile: userId => [...queryKeys.users, 'profile', userId],
  userSkills: userId => [...queryKeys.users, userId, 'skills'],
  userExperience: userId => [...queryKeys.users, userId, 'experience'],
  userProjects: userId => [...queryKeys.users, userId, 'projects'],
  userConnections: userId => [...queryKeys.users, userId, 'connections'],
  userEndorsements: userId => [...queryKeys.users, userId, 'endorsements'],
  userAnalytics: (userId, timeframe) => [
    ...queryKeys.users,
    userId,
    'analytics',
    timeframe,
  ],

  // Skills
  skills: ['skills'],
  skillsList: filters => [...queryKeys.skills, 'list', filters],
  skillDetail: skillId => [...queryKeys.skills, skillId],
  skillsSearch: (query, filters) => [
    ...queryKeys.skills,
    'search',
    query,
    filters,
  ],
  skillsTrending: timeframe => [...queryKeys.skills, 'trending', timeframe],
  skillsCategories: () => [...queryKeys.skills, 'categories'],
  skillsAnalytics: () => [...queryKeys.skills, 'analytics'],

  // Blog
  blog: ['blog'],
  blogPosts: filters => [...queryKeys.blog, 'posts', filters],
  blogPost: postId => [...queryKeys.blog, 'post', postId],
  blogSearch: (query, filters) => [...queryKeys.blog, 'search', query, filters],
  blogCategories: () => [...queryKeys.blog, 'categories'],
  blogTags: () => [...queryKeys.blog, 'tags'],
  blogFeatured: () => [...queryKeys.blog, 'featured'],
  blogTrending: timeframe => [...queryKeys.blog, 'trending', timeframe],

  // Search
  search: ['search'],
  searchGlobal: query => [...queryKeys.search, 'global', query],
  searchUsers: (query, filters) => [
    ...queryKeys.search,
    'users',
    query,
    filters,
  ],
  searchSkills: (query, filters) => [
    ...queryKeys.search,
    'skills',
    query,
    filters,
  ],

  // Notifications
  notifications: ['notifications'],
  notificationsList: () => [...queryKeys.notifications, 'list'],
  notificationsUnread: () => [...queryKeys.notifications, 'unread'],

  // Analytics
  analytics: ['analytics'],
  analyticsDashboard: timeframe => [
    ...queryKeys.analytics,
    'dashboard',
    timeframe,
  ],
  analyticsSkills: timeframe => [...queryKeys.analytics, 'skills', timeframe],
  analyticsUsers: timeframe => [...queryKeys.analytics, 'users', timeframe],
};

// Helper functions for cache management
export const invalidateQueries = queryKey => {
  return queryClient.invalidateQueries({ queryKey });
};

export const removeQueries = queryKey => {
  return queryClient.removeQueries({ queryKey });
};

export const refetchQueries = queryKey => {
  return queryClient.refetchQueries({ queryKey });
};

export const setQueryData = (queryKey, data) => {
  return queryClient.setQueryData(queryKey, data);
};

export const getQueryData = queryKey => {
  return queryClient.getQueryData(queryKey);
};

export const prefetchQuery = (queryKey, queryFn, options = {}) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Cache optimization helpers
export const optimisticUpdate = async (queryKey, updater, rollbackData) => {
  // Cancel any outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot the previous value
  const previousData = queryClient.getQueryData(queryKey);

  // Optimistically update to the new value
  queryClient.setQueryData(queryKey, updater);

  // Return a context object with the snapshotted value
  return { previousData, rollbackData };
};

export const rollbackOptimisticUpdate = (queryKey, context) => {
  queryClient.setQueryData(queryKey, context.previousData);
};

// Prefetch strategies
export const prefetchUserData = async userId => {
  const prefetchPromises = [
    prefetchQuery(queryKeys.userProfile(userId), () =>
      import('../api/users').then(m => m.default.getUserById(userId))
    ),
    prefetchQuery(queryKeys.userSkills(userId), () =>
      import('../api/users').then(m => m.default.getUserSkills(userId))
    ),
    prefetchQuery(queryKeys.userProjects(userId), () =>
      import('../api/users').then(m => m.default.getUserProjects(userId))
    ),
  ];

  return Promise.allSettled(prefetchPromises);
};

export const prefetchDashboardData = async () => {
  const prefetchPromises = [
    prefetchQuery(queryKeys.authUser(), () =>
      import('../api/auth').then(m => m.default.verify())
    ),
    prefetchQuery(queryKeys.skillsTrending('30d'), () =>
      import('../api/users').then(m => m.default.getTrendingSkills('30d'))
    ),
    prefetchQuery(queryKeys.blogFeatured(), () =>
      import('../api/users').then(m => m.default.getFeaturedPosts())
    ),
  ];

  return Promise.allSettled(prefetchPromises);
};

// Background sync for offline support
export const syncOfflineData = async () => {
  if (!navigator.onLine) return;

  // Refetch critical data when coming back online
  const criticalQueries = [
    queryKeys.authUser(),
    queryKeys.notificationsUnread(),
  ];

  return Promise.allSettled(
    criticalQueries.map(queryKey => refetchQueries(queryKey))
  );
};

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineData);
  window.addEventListener('focus', () => {
    // Refetch stale queries when window gains focus
    queryClient.resumePausedMutations();
  });
}

// Mutation helpers for common patterns
export const createMutation = (mutationFn, options = {}) => {
  return {
    mutationFn,
    ...options,
    onError: (error, variables, context) => {
      console.error('Mutation failed:', error);
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      console.log('Mutation succeeded:', data);
      options.onSuccess?.(data, variables, context);
    },
  };
};

export const createOptimisticMutation = (
  mutationFn,
  queryKey,
  updater,
  options = {}
) => {
  return createMutation(mutationFn, {
    ...options,
    onMutate: async variables => {
      const context = await optimisticUpdate(queryKey, updater, variables);
      return { ...context, ...(options.onMutate?.(variables) || {}) };
    },
    onError: (error, variables, context) => {
      rollbackOptimisticUpdate(queryKey, context);
      options.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      invalidateQueries(queryKey);
      options.onSettled?.(data, error, variables, context);
    },
  });
};

export default queryClient;
