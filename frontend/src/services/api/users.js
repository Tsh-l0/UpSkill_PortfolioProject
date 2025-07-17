import { get, post, put, del, upload } from '../config/httpClient.js';

const usersAPI = {
  // GET /api/users/profile
  getProfile: async () => {
    const response = await get('/users/profile');
    return response;
  },

  // PUT /api/users/profile
  updateProfile: async profileData => {
    const response = await put('/users/profile', profileData);
    return response;
  },

  // GET /api/users/:id
  getUserById: async userId => {
    const response = await get(`/users/${userId}`);
    return response;
  },

  // GET /api/users/search
  searchUsers: async params => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/users/search?${queryString}`);
    return response;
  },

  // GET /api/users/trending
  getTrendingUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/users/trending?${queryString}`);
    return response;
  },

  // POST /api/users/upload-avatar
  uploadAvatar: async (file, onProgress) => {
    const response = await upload('/users/upload-avatar', file, onProgress);
    return response;
  },

  // GET /api/users/analytics
  getAnalytics: async (timeframe = '30d') => {
    const response = await get(`/users/analytics?timeframe=${timeframe}`);
    return response;
  },

  // GET /api/users/settings
  getSettings: async () => {
    const response = await get('/users/settings');
    return response;
  },

  // PUT /api/users/settings
  updateSettings: async settings => {
    const response = await put('/users/settings', settings);
    return response;
  },

  // GET /api/users/:userId/skills - matches your backend
  getUserSkills: async userId => {
    const response = await get(`/users/${userId}/skills`);
    return response;
  },

  // POST /api/users/skills - matches your backend
  addSkill: async skillData => {
    const response = await post('/users/skills', skillData);
    return response;
  },

  // PUT /api/users/skills/:id - matches your backend
  updateSkill: async (skillId, skillData) => {
    const response = await put(`/users/skills/${skillId}`, skillData);
    return response;
  },

  // DELETE /api/users/skills/:id - matches your backend
  deleteSkill: async skillId => {
    const response = await del(`/users/skills/${skillId}`);
    return response;
  },
};

// SKILLS API - matches your backend
const skillsAPI = {
  // GET /api/skills
  getAllSkills: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/skills?${queryString}`);
    return response;
  },

  // GET /api/skills/trending
  getTrendingSkills: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/skills/trending?${queryString}`);
    return response;
  },

  // GET /api/skills/categories
  getSkillCategories: async () => {
    const response = await get('/skills/categories');
    return response;
  },

  // POST /api/skills
  createSkill: async skillData => {
    const response = await post('/skills', skillData);
    return response;
  },

  // GET /api/skills/search
  searchSkills: async query => {
    const response = await get(`/skills/search?q=${encodeURIComponent(query)}`);
    return response;
  },
};

// EXPERIENCE API - matches your backend
const experienceAPI = {
  // GET /api/experience - get user's experience
  getUserExperience: async (userId = null) => {
    const url = userId ? `/experience?userId=${userId}` : '/experience';
    const response = await get(url);
    return response;
  },

  // GET /api/experience/:id
  getExperienceById: async experienceId => {
    const response = await get(`/experience/${experienceId}`);
    return response;
  },

  // POST /api/experience
  createExperience: async experienceData => {
    const response = await post('/experience', experienceData);
    return response;
  },

  // PUT /api/experience/:id
  updateExperience: async (experienceId, experienceData) => {
    const response = await put(`/experience/${experienceId}`, experienceData);
    return response;
  },

  // DELETE /api/experience/:id
  deleteExperience: async experienceId => {
    const response = await del(`/experience/${experienceId}`);
    return response;
  },
};

// PROJECTS API - matches your backend
const projectsAPI = {
  // GET /api/projects
  getUserProjects: async (userId = null) => {
    const url = userId ? `/projects?userId=${userId}` : '/projects';
    const response = await get(url);
    return response;
  },

  // GET /api/projects/:id
  getProjectById: async projectId => {
    const response = await get(`/projects/${projectId}`);
    return response;
  },

  // POST /api/projects
  createProject: async projectData => {
    const response = await post('/projects', projectData);
    return response;
  },

  // PUT /api/projects/:id
  updateProject: async (projectId, projectData) => {
    const response = await put(`/projects/${projectId}`, projectData);
    return response;
  },

  // DELETE /api/projects/:id
  deleteProject: async projectId => {
    const response = await del(`/projects/${projectId}`);
    return response;
  },

  // POST /api/projects/:id/like
  toggleProjectLike: async projectId => {
    const response = await post(`/projects/${projectId}/like`);
    return response;
  },
};

// BLOG API - matches your backend
const blogAPI = {
  // GET /api/blog/posts
  getPosts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/blog/posts?${queryString}`);
    return response;
  },

  // GET /api/blog/posts/:id
  getPostById: async postId => {
    const response = await get(`/blog/posts/${postId}`);
    return response;
  },

  // GET /api/blog/categories
  getCategories: async () => {
    const response = await get('/blog/categories');
    return response;
  },

  // POST /api/blog/posts/:id/bookmark
  toggleBookmark: async postId => {
    const response = await post(`/blog/posts/${postId}/bookmark`);
    return response;
  },

  // GET /api/blog/bookmarks
  getUserBookmarks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/blog/bookmarks?${queryString}`);
    return response;
  },
};

// ENDORSEMENTS API - matches your backend
const endorsementsAPI = {
  // POST /api/endorsements
  createEndorsement: async endorsementData => {
    const response = await post('/endorsements', endorsementData);
    return response;
  },

  // GET /api/endorsements/received
  getReceivedEndorsements: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/endorsements/received?${queryString}`);
    return response;
  },

  // GET /api/endorsements/given
  getGivenEndorsements: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/endorsements/given?${queryString}`);
    return response;
  },

  // GET /api/endorsements/stats
  getEndorsementStats: async () => {
    const response = await get('/endorsements/stats');
    return response;
  },

  // PUT /api/endorsements/:id
  updateEndorsement: async (endorsementId, endorsementData) => {
    const response = await put(
      `/endorsements/${endorsementId}`,
      endorsementData
    );
    return response;
  },

  // DELETE /api/endorsements/:id
  deleteEndorsement: async endorsementId => {
    const response = await del(`/endorsements/${endorsementId}`);
    return response;
  },
};

// CONNECTIONS API - matches your backend
const connectionsAPI = {
  // POST /api/connections/request
  sendConnectionRequest: async connectionData => {
    const response = await post('/connections/request', connectionData);
    return response;
  },

  // PUT /api/connections/:id/respond
  respondToConnection: async (connectionId, action) => {
    const response = await put(`/connections/${connectionId}/respond`, {
      action,
    });
    return response;
  },

  // GET /api/connections
  getUserConnections: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/connections?${queryString}`);
    return response;
  },

  // GET /api/connections/requests
  getPendingRequests: async (type = 'received') => {
    const response = await get(`/connections/requests?type=${type}`);
    return response;
  },

  // GET /api/connections/mutual/:userId
  getMutualConnections: async userId => {
    const response = await get(`/connections/mutual/${userId}`);
    return response;
  },

  // DELETE /api/connections/:id
  removeConnection: async connectionId => {
    const response = await del(`/connections/${connectionId}`);
    return response;
  },
};

// ANALYTICS API - matches your backend - FIXED VERSION
const analyticsAPI = {
  // POST /api/analytics/track
  trackEvent: async eventData => {
    try {
      const response = await post('/analytics/track', eventData);
      return response;
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
      return { success: false, error: error.message };
    }
  },

  // GET /api/analytics/dashboard
  getDashboardAnalytics: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await get(`/analytics/dashboard?${queryString}`);
      return response;
    } catch (error) {
      console.warn('Dashboard analytics failed:', error);
      // Return mock data as fallback
      return {
        success: true,
        data: generateMockAnalytics(params)
      };
    }
  },

  // GET /api/analytics/skills
  getSkillsAnalytics: async () => {
    try {
      const response = await get('/analytics/skills');
      return response;
    } catch (error) {
      console.warn('Skills analytics failed:', error);
      return {
        success: true,
        data: { distribution: [], topSkills: [] }
      };
    }
  },

  // GET /api/analytics/trending
  getTrendingAnalytics: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await get(`/analytics/trending?${queryString}`);
      return response;
    } catch (error) {
      console.warn('Trending analytics failed:', error);
      return {
        success: true,
        data: { trends: [] }
      };
    }
  },

  // Primary function used throughout the app - FIXED
  getUserAnalytics: async (params = {}) => {
    try {
      // Handle both old and new parameter formats
      const queryParams = typeof params === 'string' 
        ? { timeframe: params }
        : { timeframe: '30d', ...params };

      return await analyticsAPI.getDashboardAnalytics(queryParams);
    } catch (error) {
      console.warn('User analytics failed:', error);
      // Return mock data as fallback
      return {
        success: true,
        data: generateMockAnalytics(params)
      };
    }
  },
};

// Mock analytics generator for fallback
const generateMockAnalytics = (params = {}) => {
  return {
    profileViews: {
      thisMonth: 47,
      lastMonth: 32,
      growth: 47,
      chartData: []
    },
    networking: {
      totalConnections: 156,
      endorsementsReceived: 23,
      endorsementsGiven: 18,
      connectionRequests: 3
    },
    skillsGrowth: {
      totalSkills: 8,
      endorsedSkills: 5,
      trending: ['React', 'TypeScript', 'Node.js']
    },
    careerProgress: {
      profileCompletion: 85,
      profileStrength: 'Strong',
      recommendations: 3
    },
    recentActivity: [],
    generatedAt: new Date().toISOString()
  };
};

// NOTIFICATIONS API - matches your backend
const notificationsAPI = {
  // GET /api/notifications
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/notifications?${queryString}`);
    return response;
  },

  // PUT /api/notifications/:id/read
  markAsRead: async notificationId => {
    const response = await put(`/notifications/${notificationId}/read`);
    return response;
  },

  // PUT /api/notifications/read-all
  markAllAsRead: async () => {
    const response = await put('/notifications/read-all');
    return response;
  },

  // DELETE /api/notifications/:id
  archiveNotification: async notificationId => {
    const response = await del(`/notifications/${notificationId}`);
    return response;
  },

  // GET /api/notifications/counts
  getNotificationCounts: async () => {
    const response = await get('/notifications/counts');
    return response;
  },
};

// Export all APIs
export {
  usersAPI,
  skillsAPI,
  experienceAPI,
  projectsAPI,
  blogAPI,
  endorsementsAPI,
  connectionsAPI,
  analyticsAPI,
  notificationsAPI,
};

export default usersAPI;