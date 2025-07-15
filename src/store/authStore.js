// services/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authAPI from '../services/api/auth';
import { toast } from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.login(credentials);
          
          // Debug log to see exact response structure
          console.log('Login API Response:', response);
          
          if (response.success) {
            // Handle backend response structure: { success, user, token } 
            const user = response.user || response.data?.user;
            const token = response.token || response.data?.token;
            const refreshToken = response.refreshToken || response.data?.refreshToken;
            
            if (!user || !token) {
              throw new Error('Invalid response: missing user or token');
            }
            
            set({
              isAuthenticated: true,
              user: user,
              token: token,
              refreshToken: refreshToken,
              isLoading: false,
              error: null,
            });

            toast.success(`Welcome back, ${user.fullName || user.name}!`);
            return { success: true, user, token };
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Signup action
      signup: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.signup(userData);
          
          if (response.success) {
            set({
              isLoading: false,
              error: null,
            });

            toast.success('Account created successfully!');
            return { 
              success: true, 
              message: response.message,
              data: response.data || response.user // Handle both structures
            };
          } else {
            throw new Error(response.message || 'Signup failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Signup failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: async () => {
        const currentToken = get().token;
        
        // Optimistically clear state
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
          error: null,
        });

        try {
          if (currentToken) {
            await authAPI.logout();
          }
          toast.success('Logged out successfully');
        } catch (error) {
          console.warn('Logout API call failed:', error);
          // Still show success since local state is cleared
          toast.success('Logged out successfully');
        }
      },

      // Update user action
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      // Verify token action
      verifyToken: async () => {
        const token = get().token;
        if (!token) {
          return false;
        }

        try {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            // Handle backend response structure
            const user = response.user || response.data || response;
            
            set({
              user: user,
              isAuthenticated: true,
              error: null,
            });
            return true;
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
          return false;
        }
      },

      // Refresh token action
      refreshAuthToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await authAPI.refreshToken(refreshToken);
          if (response.success) {
            // Handle backend response structure
            const token = response.token || response.data?.token;
            const newRefreshToken = response.refreshToken || response.data?.refreshToken;
            const user = response.user || response.data?.user;
            
            set({
              token: token,
              refreshToken: newRefreshToken,
              user: user,
              isAuthenticated: true,
            });
            return true;
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
          return false;
        }
      },

      // Forgot password action
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.forgotPassword(email);
          
          if (response.success) {
            set({ isLoading: false });
            toast.success('Password reset email sent successfully!');
            return { success: true, message: response.message };
          } else {
            throw new Error(response.message || 'Password reset request failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Password reset request failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Reset password action
      resetPassword: async (token, password, confirmPassword) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.resetPassword(token, password, confirmPassword);
          
          if (response.success) {
            set({ isLoading: false });
            toast.success('Password reset successfully!');
            return { success: true, message: response.message };
          } else {
            throw new Error(response.message || 'Password reset failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Password reset failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Change password action
      changePassword: async (currentPassword, newPassword, confirmPassword) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
          
          if (response.success) {
            set({ isLoading: false });
            toast.success('Password changed successfully!');
            return { success: true, message: response.message };
          } else {
            throw new Error(response.message || 'Password change failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Password change failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Initialize auth on app startup
      initializeAuth: async () => {
        if (get().isInitialized) {
          return;
        }

        const token = get().token;
        if (!token) {
          set({ isLoading: false, isInitialized: true });
          return;
        }

        set({ isLoading: true });

        try {
          const isValid = await get().verifyToken();
          if (!isValid) {
            // Try to refresh token
            const refreshed = await get().refreshAuthToken();
            if (!refreshed) {
              // Clear auth state if refresh fails
              set({
                isAuthenticated: false,
                user: null,
                token: null,
                refreshToken: null,
              });
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // Clear auth state on error
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Utility functions
      getUser: () => get().user,
      getToken: () => get().token,
      isLoggedIn: () => get().isAuthenticated,
      
      // Profile completion helper
      isProfileComplete: () => {
        const user = get().user;
        if (!user) return false;
        
        // Check required fields for a complete profile
        const requiredFields = [
          'fullName',
          'email',
          'currentRole',
          'location',
          'bio'
        ];
        
        return requiredFields.every(field => user[field]);
      },

      // Check if user has completed onboarding
      hasCompletedOnboarding: () => {
        const user = get().user;
        return user?.onboardingCompleted || false;
      },
    }),
    {
      name: 'upskill-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;