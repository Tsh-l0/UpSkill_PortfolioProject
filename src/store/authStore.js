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

      // Login action - FIXED
      login: async credentials => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.login(credentials);

          // Debug log to see exact response structure
          console.log('Login API Response:', response);

          // Handle different response structures
          if (
            response &&
            (response.success || response.token || response.user)
          ) {
            // Extract data from various possible response structures
            const success = response.success !== false; // default to true if not explicitly false
            const user = response.user || response.data?.user || response.data;
            const token =
              response.token || response.data?.token || response.accessToken;
            const refreshToken =
              response.refreshToken ||
              response.data?.refreshToken ||
              response.refresh_token;

            if (!user && !token) {
              console.error(
                'Login response missing both user and token:',
                response
              );
              throw new Error('Invalid login response: missing user data');
            }

            // If we have a token but no user, try to get user data
            let finalUser = user;
            if (token && !user) {
              try {
                const userResponse = await authAPI.getCurrentUser();
                if (userResponse.success) {
                  finalUser = userResponse.user || userResponse.data;
                }
              } catch (error) {
                console.warn('Failed to fetch user after login:', error);
                // Continue with login if we have the token
              }
            }

            set({
              isAuthenticated: true,
              user: finalUser,
              token: token,
              refreshToken: refreshToken,
              isLoading: false,
              error: null,
              isInitialized: true,
            });

            const userName = finalUser?.fullName || finalUser?.name || 'there';
            toast.success(`Welcome back, ${userName}!`);
            return { success: true, user: finalUser, token };
          } else {
            // Handle error responses
            const errorMessage =
              response?.message || response?.error || 'Login failed';
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('Login error:', error);
          const errorMessage = error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Signup action - FIXED
      signup: async userData => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.signup(userData);

          console.log('Signup API Response:', response);

          if (response && response.success !== false) {
            set({
              isLoading: false,
              error: null,
            });

            toast.success('Account created successfully! Please log in.');
            return {
              success: true,
              message: response.message || 'Account created successfully',
              data: response.data || response.user,
            };
          } else {
            throw new Error(
              response?.message || response?.error || 'Signup failed'
            );
          }
        } catch (error) {
          console.error('Signup error:', error);
          const errorMessage = error.message || 'Signup failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // Logout action - IMPROVED
      logout: async () => {
        const currentToken = get().token;

        // Optimistically clear state immediately
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
          error: null,
          isInitialized: true, // Keep initialized state
        });

        // Clear localStorage immediately
        try {
          localStorage.removeItem('upskill-auth');
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }

        // Try to notify backend (don't wait for it)
        if (currentToken) {
          authAPI.logout().catch(error => {
            console.warn('Logout API call failed:', error);
          });
        }

        toast.success('Logged out successfully');
        return { success: true };
      },

      // Update user action
      updateUser: userData => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          return updatedUser;
        }
        return null;
      },

      // Verify token action - IMPROVED
      verifyToken: async () => {
        const token = get().token;
        if (!token) {
          return false;
        }

        try {
          const response = await authAPI.getCurrentUser();
          console.log('Token verification response:', response);

          if (response && response.success !== false) {
            // Handle different response structures
            const user = response.user || response.data;

            if (user) {
              set({
                user: user,
                isAuthenticated: true,
                error: null,
                isInitialized: true,
              });
              return true;
            } else {
              throw new Error('User data not found in response');
            }
          } else {
            throw new Error(response?.message || 'Token verification failed');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear auth state on verification failure
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
            isInitialized: true,
          });
          return false;
        }
      },

      // Refresh token action - IMPROVED
      refreshAuthToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          console.log('No refresh token available');
          return false;
        }

        try {
          console.log('Attempting token refresh...');
          const response = await authAPI.refreshToken(refreshToken);

          if (response && response.success !== false) {
            // Handle different response structures
            const newToken =
              response.token || response.data?.token || response.accessToken;
            const newRefreshToken =
              response.refreshToken ||
              response.data?.refreshToken ||
              refreshToken;
            const user = response.user || response.data?.user;

            if (newToken) {
              set({
                token: newToken,
                refreshToken: newRefreshToken,
                user: user || get().user, // Keep existing user if none provided
                isAuthenticated: true,
                isInitialized: true,
              });
              console.log('Token refreshed successfully');
              return true;
            } else {
              throw new Error('New token not found in refresh response');
            }
          } else {
            throw new Error(response?.message || 'Token refresh failed');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Clear auth state on refresh failure
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null,
            isInitialized: true,
          });
          return false;
        }
      },

      // Initialize auth on app startup - IMPROVED
      initializeAuth: async () => {
        if (get().isInitialized) {
          console.log('Auth already initialized');
          return;
        }

        console.log('Initializing auth...');
        const token = get().token;

        if (!token) {
          console.log('No token found, skipping auth initialization');
          set({ isLoading: false, isInitialized: true });
          return;
        }

        set({ isLoading: true });

        try {
          console.log('Verifying existing token...');
          const isValid = await get().verifyToken();

          if (!isValid) {
            console.log('Token invalid, attempting refresh...');
            const refreshed = await get().refreshAuthToken();

            if (!refreshed) {
              console.log('Token refresh failed, clearing auth state');
              set({
                isAuthenticated: false,
                user: null,
                token: null,
                refreshToken: null,
              });
            }
          } else {
            console.log('Token verified successfully');
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
          console.log('Auth initialization complete');
        }
      },

      // Forgot password action
      forgotPassword: async email => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.forgotPassword(email);

          if (response && response.success !== false) {
            set({ isLoading: false });
            toast.success('Password reset email sent successfully!');
            return { success: true, message: response.message };
          } else {
            throw new Error(
              response?.message ||
                response?.error ||
                'Password reset request failed'
            );
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
          const response = await authAPI.resetPassword(
            token,
            password,
            confirmPassword
          );

          if (response && response.success !== false) {
            set({ isLoading: false });
            toast.success('Password reset successfully!');
            return { success: true, message: response.message };
          } else {
            throw new Error(
              response?.message || response?.error || 'Password reset failed'
            );
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
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authAPI.changePassword(
            currentPassword,
            newPassword
          );

          if (response && response.success !== false) {
            set({ isLoading: false });
            toast.success('Password changed successfully!');
            return { success: true, message: response.message };
          } else {
            throw new Error(
              response?.message || response?.error || 'Password change failed'
            );
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

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Utility functions
      getUser: () => get().user,
      getToken: () => get().token,
      isLoggedIn: () => get().isAuthenticated,

      // Profile completion helper - IMPROVED
      isProfileComplete: () => {
        const user = get().user;
        if (!user) return false;

        // Check required fields for a complete profile
        const requiredFields = ['fullName', 'email', 'currentRole', 'location'];

        const isComplete = requiredFields.every(field => {
          const value = user[field];
          return value && value.toString().trim().length > 0;
        });

        // Also check if user has at least one skill
        const hasSkills = user.skills && user.skills.length > 0;

        return isComplete && hasSkills;
      },

      // Check if user has completed onboarding
      hasCompletedOnboarding: () => {
        const user = get().user;
        return (
          user?.onboardingCompleted ||
          user?.profileCompletionScore > 50 ||
          false
        );
      },

      // Get profile completion percentage
      getProfileCompletionScore: () => {
        const user = get().user;
        if (!user) return 0;

        if (user.profileCompletionScore) {
          return user.profileCompletionScore;
        }

        // Calculate completion score
        let score = 0;
        const fields = [
          { field: 'fullName', weight: 20 },
          { field: 'email', weight: 15 },
          { field: 'currentRole', weight: 15 },
          { field: 'location', weight: 10 },
          { field: 'bio', weight: 15 },
          { field: 'profileImage', weight: 10 },
          { field: 'skills', weight: 15, isArray: true },
        ];

        fields.forEach(({ field, weight, isArray }) => {
          const value = user[field];
          if (isArray) {
            if (value && Array.isArray(value) && value.length > 0) {
              score += weight;
            }
          } else {
            if (value && value.toString().trim().length > 0) {
              score += weight;
            }
          }
        });

        return Math.min(score, 100);
      },
    }),
    {
      name: 'upskill-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => state => {
        console.log('Auth state rehydrated from localStorage:', state);
        // Automatically initialize auth after rehydration
        if (state && state.token && !state.isInitialized) {
          // Use setTimeout to avoid calling during render
          setTimeout(() => {
            state.initializeAuth();
          }, 100);
        }
      },
    }
  )
);

export default useAuthStore;
