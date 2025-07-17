// services/hooks/useApiHooks.js - REAL REACT QUERY HOOKS
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  usersAPI,
  skillsAPI,
  experienceAPI,
  projectsAPI,
  blogAPI,
  endorsementsAPI,
  connectionsAPI,
  analyticsAPI,
  notificationsAPI,
} from '../api/users.js';
import authAPI from '../api/auth.js';
import { queryKeys } from '../config/queryClient.js';

// ===================================
// AUTHENTICATION HOOKS
// ===================================
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.authUser(),
    queryFn: authAPI.getCurrentUser,
    select: data => data.data?.user || data.user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

export const useVerifyToken = () => {
  return useMutation({
    mutationFn: authAPI.verifyToken,
    onError: error => {
      if (error?.status === 401) {
        // Token is invalid, clear auth state
        localStorage.removeItem('upskill-auth');
        window.location.href = '/login';
      }
    },
  });
};

// ===================================
// USER PROFILE HOOKS
// ===================================
export const useUserProfile = (userId = null) => {
  return useQuery({
    queryKey: queryKeys.userProfile(userId || 'current'),
    queryFn: () =>
      userId ? usersAPI.getUserById(userId) : usersAPI.getProfile(),
    select: data => data.data?.user || data.user || data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.updateProfile,
    onSuccess: data => {
      const updatedUser = data.data?.user || data.user || data.data;

      // Update cache
      queryClient.setQueryData(queryKeys.userProfile('current'), {
        success: true,
        data: updatedUser,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users });

      toast.success('Profile updated successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      usersAPI.uploadAvatar(file, onProgress),
    onSuccess: data => {
      // Invalidate user profile to refetch with new avatar
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProfile('current'),
      });
      toast.success('Avatar uploaded successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to upload avatar');
    },
  });
};

// ===================================
// SKILLS HOOKS
// ===================================
export const useAllSkills = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.skillsList(params),
    queryFn: () => skillsAPI.getAllSkills(params),
    select: data => ({
      skills: data.data?.skills || data.skills || [],
      pagination: data.pagination,
    }),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUserSkills = (userId = null) => {
  return useQuery({
    queryKey: queryKeys.userSkills(userId || 'current'),
    queryFn: () => usersAPI.getUserSkills(userId || 'current'),
    select: data => data.data?.skills || data.skills || data.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.addSkill,
    onSuccess: data => {
      // Invalidate skills queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.userSkills('current'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProfile('current'),
      });

      toast.success('Skill added successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to add skill');
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ skillId, updates }) =>
      usersAPI.updateSkill(skillId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userSkills('current'),
      });
      toast.success('Skill updated successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update skill');
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersAPI.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userSkills('current'),
      });
      toast.success('Skill removed successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to remove skill');
    },
  });
};

export const useTrendingSkills = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.skillsTrending(params),
    queryFn: () => skillsAPI.getTrendingSkills(params),
    select: data => data.data?.skills || data.skills || [],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useSkillCategories = () => {
  return useQuery({
    queryKey: queryKeys.skillsCategories(),
    queryFn: skillsAPI.getCategories,
    select: data => data.data?.categories || data.categories || [],
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// ===================================
// EXPERIENCE HOOKS
// ===================================
export const useUserExperience = (userId = null) => {
  return useQuery({
    queryKey: queryKeys.userExperience(userId || 'current'),
    queryFn: () => experienceAPI.getUserExperiences(userId),
    select: data => data.data?.experiences || data.experiences || [],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: experienceAPI.createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userExperience('current'),
      });
      toast.success('Experience added successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to add experience');
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ experienceId, data }) =>
      experienceAPI.updateExperience(experienceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userExperience('current'),
      });
      toast.success('Experience updated successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update experience');
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: experienceAPI.deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userExperience('current'),
      });
      toast.success('Experience deleted successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete experience');
    },
  });
};

// ===================================
// PROJECTS HOOKS
// ===================================
export const useUserProjects = (userId = null) => {
  return useQuery({
    queryKey: queryKeys.userProjects(userId || 'current'),
    queryFn: () => projectsAPI.getUserProjects(userId),
    select: data => data.data?.projects || data.projects || [],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProject = projectId => {
  return useQuery({
    queryKey: queryKeys.projectDetail(projectId),
    queryFn: () => projectsAPI.getProjectById(projectId),
    select: data => data.data?.project || data.project,
    enabled: !!projectId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsAPI.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userProjects('current'),
      });
      toast.success('Project created successfully!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to create project');
    },
  });
};

// ===================================
// BLOG HOOKS
// ===================================
export const useBlogPosts = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.blogPosts(params),
    queryFn: () => blogAPI.getPosts(params),
    select: data => ({
      posts: data.data?.posts || data.posts || [],
      pagination: data.pagination,
      categories: data.categories || [],
      tags: data.tags || [],
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBlogPost = postId => {
  return useQuery({
    queryKey: queryKeys.blogPost(postId),
    queryFn: () => blogAPI.getPostById(postId),
    select: data => ({
      post: data.data?.post || data.post,
      relatedPosts: data.data?.relatedPosts || data.relatedPosts || [],
    }),
    enabled: !!postId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: queryKeys.blogCategories(),
    queryFn: blogAPI.getCategories,
    select: data => data.data?.categories || data.categories || [],
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogAPI.toggleBookmark,
    onSuccess: (data, postId) => {
      // Invalidate blog queries to update bookmark status
      queryClient.invalidateQueries({ queryKey: queryKeys.blog });

      const isBookmarked = data.data?.bookmarked;
      toast.success(isBookmarked ? 'Post bookmarked!' : 'Bookmark removed!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to update bookmark');
    },
  });
};

// ===================================
// USER SEARCH & DISCOVERY HOOKS
// ===================================
export const useSearchUsers = params => {
  return useQuery({
    queryKey: queryKeys.searchUsers(params.q || '', params),
    queryFn: () => usersAPI.searchUsers(params),
    select: data => ({
      users: data.data?.users || data.users || [],
      pagination: data.pagination,
    }),
    enabled: !!params?.q || !!params?.skills || !!params?.location,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTrendingUsers = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.usersList({ trending: true, ...params }),
    queryFn: () => usersAPI.getTrendingUsers(params),
    select: data => data.data?.users || data.users || [],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// ===================================
// CONNECTIONS HOOKS
// ===================================
export const useConnections = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.userConnections('current'),
    queryFn: () => connectionsAPI.getUserConnections(params),
    select: data => ({
      connections: data.data?.connections || data.connections || [],
      pagination: data.pagination,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePendingRequests = (type = 'received') => {
  return useQuery({
    queryKey: ['connections', 'requests', type],
    queryFn: () => connectionsAPI.getPendingRequests(type),
    select: data => data.data?.requests || data.requests || [],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectionsAPI.sendConnectionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request sent!');
    },
    onError: error => {
      toast.error(error.message || 'Failed to send connection request');
    },
  });
};

// ===================================
// ANALYTICS HOOKS
// ===================================
export const useDashboardAnalytics = (timeframe = 30) => {
  return useQuery({
    queryKey: queryKeys.analyticsDashboard(timeframe),
    queryFn: () => analyticsAPI.getDashboardAnalytics(timeframe),
    select: data => data.data?.analytics || data.analytics || data.data,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useTrackEvent = () => {
  return useMutation({
    mutationFn: analyticsAPI.trackEvent,
    // Silent mutation - no toast notifications for tracking
    onError: error => {
      console.warn('Analytics tracking failed:', error);
    },
  });
};

// ===================================
// NOTIFICATIONS HOOKS
// ===================================
export const useNotifications = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.notificationsList(params),
    queryFn: () => notificationsAPI.getNotifications(params),
    select: data => ({
      notifications: data.data?.notifications || data.notifications || [],
      pagination: data.pagination,
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useNotificationCounts = () => {
  return useQuery({
    queryKey: ['notifications', 'counts'],
    queryFn: notificationsAPI.getNotificationCounts,
    select: data => data.data?.counts || data.counts || data.data,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// ===================================
// UTILITY HOOKS
// ===================================
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateUser: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    invalidateSkills: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.skills }),
    invalidateBlog: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.blog }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
};
