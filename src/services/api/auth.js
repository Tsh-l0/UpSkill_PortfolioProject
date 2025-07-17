// File location: src/services/api/auth.js
import { get, post } from '../config/httpClient.js';

const authAPI = {
  // POST /api/auth/login
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      const response = await post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('🔐 Login response:', response);
      
      // Handle different response formats from backend
      if (response) {
        // If response has success property, check it
        if (response.hasOwnProperty('success') && !response.success) {
          throw new Error(response.message || response.error || 'Login failed');
        }
        
        // If we have token or user data, consider it successful
        if (response.token || response.user || response.data) {
          return {
            success: true,
            ...response
          };
        }
        
        // If response exists but no clear success indicator, assume success
        return {
          success: true,
          ...response
        };
      }
      
      throw new Error('No response received from server');
    } catch (error) {
      console.error('🔐 Login API error:', error);
      
      // Re-throw with consistent format
      const errorMessage = error.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  // POST /api/auth/signup
  signup: async (userData) => {
    try {
      console.log('📝 Attempting signup for:', userData.email);
      
      const response = await post('/auth/signup', {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        location: userData.location,
        currentRole: userData.currentRole,
        experienceLevel: userData.experienceLevel,
        ...userData,
      });

      console.log('📝 Signup response:', response);
      
      // Handle different response formats
      if (response) {
        if (response.hasOwnProperty('success') && !response.success) {
          throw new Error(response.message || response.error || 'Signup failed');
        }
        
        return {
          success: true,
          ...response
        };
      }
      
      throw new Error('No response received from server');
    } catch (error) {
      console.error('📝 Signup API error:', error);
      
      const errorMessage = error.error || error.message || 'Signup failed';
      throw new Error(errorMessage);
    }
  },

  // POST /api/auth/logout
  logout: async () => {
    try {
      console.log('👋 Attempting logout');
      
      const response = await post('/auth/logout');
      
      console.log('👋 Logout response:', response);
      
      // Logout should generally succeed even if API call fails
      return {
        success: true,
        message: 'Logged out successfully',
        ...response
      };
    } catch (error) {
      console.warn('👋 Logout API error (continuing anyway):', error);
      
      // Return success anyway since logout is primarily client-side
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  },

  // GET /api/auth/me
  getCurrentUser: async () => {
    try {
      console.log('👤 Fetching current user');
      
      const response = await get('/auth/me');
      
      console.log('👤 Current user response:', response);
      
      if (response) {
        if (response.hasOwnProperty('success') && !response.success) {
          throw new Error(response.message || response.error || 'Failed to get user data');
        }
        
        return {
          success: true,
          ...response
        };
      }
      
      throw new Error('No user data received');
    } catch (error) {
      console.error('👤 Get current user error:', error);
      
      const errorMessage = error.error || error.message || 'Failed to get user data';
      throw new Error(errorMessage);
    }
  },

  // POST /api/auth/refresh
  refreshToken: async (refreshToken) => {
    try {
      console.log('🔄 Attempting token refresh');
      
      const response = await post('/auth/refresh', {
        refreshToken,
      });
      
      console.log('🔄 Token refresh response:', response);
      
      if (response) {
        if (response.hasOwnProperty('success') && !response.success) {
          throw new Error(response.message || response.error || 'Token refresh failed');
        }
        
        return {
          success: true,
          ...response
        };
      }
      
      throw new Error('No response received from server');
    } catch (error) {
      console.error('🔄 Token refresh error:', error);
      
      const errorMessage = error.error || error.message || 'Token refresh failed';
      throw new Error(errorMessage);
    }
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (email) => {
    try {
      console.log('🔑 Attempting password reset for:', email);
      
      const response = await post('/auth/forgot-password', { email });
      
      console.log('🔑 Forgot password response:', response);
      
      if (response) {
        if (response.hasOwnProperty('success') && !response.success) {
          throw new Error(response.message || response.error || 'Password reset request failed');
        }
        
        return {
          success: true,
          ...response
        };
      }
      
      throw new Error('No response received from server');
    } catch (error) {
      console.error('🔑 Forgot password error:', error);
      
      const errorMessage = error.error || error.message || 'Password reset request failed';
      throw new Error(errorMessage);
    }
  },

  // POST /api/auth/reset-password
  resetPassword: async (token, password, confirmPassword) => {
    try {
      console.log('🔒 Attempting password reset');
      
      const response = await post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      
      console.log('🔒 Reset password response:', response);
      
      if (response) {
        if (response.hasOwnProperty('success') && !response.success) {
          throw new Error(response.message || response.error || 'Password reset failed');
        }
        
        return {
          success: true,
          ...response
        };
      }
      
      throw new Error('No response received from server');
    } catch (error) {
      console.error('🔒 Reset password error:', error);
      
      const errorMessage = error.error || error.message || 'Password reset failed';
      throw new Error(errorMessage);
    }
  },

  // PUT /api/auth/change-password
  changePassword: async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Attempting password change');
      
      const response = await post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      console.log('🔐 Change password response:', response);
      
      if (response) {
        if (response.hasOwnProperty('success') && !response.success) {
          throw new Error(response.message || response.error || 'Password change failed');
        }
        
        return {
          success: true,
          ...response
        };
      }
      
      throw new Error('No response received from server');
    } catch (error) {
      console.error('🔐 Change password error:', error);
      
      const errorMessage = error.error || error.message || 'Password change failed';
      throw new Error(errorMessage);
    }
  },
};

export default authAPI;