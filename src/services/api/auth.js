// services/api/auth.js
import httpClient from '../config/httpClient';

const authAPI = {
  // POST /api/auth/login
  login: async credentials => {
    try {
      const response = await httpClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || 'Login failed'
      );
    }
  },

  // POST /api/auth/signup
  signup: async userData => {
    try {
      const response = await httpClient.post('/auth/signup', {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        location: userData.location,
        currentRole: userData.currentRole,
        experienceLevel: userData.experienceLevel,
        ...userData,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || 'Signup failed'
      );
    }
  },

  // POST /api/auth/logout
  logout: async () => {
    try {
      const response = await httpClient.post('/auth/logout');
      return response;
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
      return { success: true };
    }
  },

  // GET /api/auth/me
  getCurrentUser: async () => {
    try {
      const response = await httpClient.get('/auth/me');
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to get user data'
      );
    }
  },

  // POST /api/auth/refresh
  refreshToken: async refreshToken => {
    try {
      const response = await httpClient.post('/auth/refresh', {
        refreshToken,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || 'Token refresh failed'
      );
    }
  },

  // POST /api/auth/forgot-password
  forgotPassword: async email => {
    try {
      const response = await httpClient.post('/auth/forgot-password', {
        email,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Password reset request failed'
      );
    }
  },

  // POST /api/auth/reset-password
  resetPassword: async (token, password, confirmPassword) => {
    try {
      const response = await httpClient.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Password reset failed'
      );
    }
  },

  // PUT /api/auth/change-password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await httpClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Password change failed'
      );
    }
  },

  // GET /api/auth/verify-email
  verifyEmail: async token => {
    try {
      const response = await httpClient.get(
        `/auth/verify-email?token=${token}`
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Email verification failed'
      );
    }
  },

  // POST /api/auth/resend-verification
  resendVerification: async email => {
    try {
      const response = await httpClient.post('/auth/resend-verification', {
        email,
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to resend verification email'
      );
    }
  },
};

export default authAPI;
