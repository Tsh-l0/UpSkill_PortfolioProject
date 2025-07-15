// services/hooks/useAuth.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

const useAuth = (options = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth store
  const {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    isInitialized,
    login,
    signup,
    logout,
    updateUser,
    verifyToken,
    initializeAuth,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError,
    getUser,
    getToken,
    isLoggedIn,
    isProfileComplete,
    hasCompletedOnboarding,
  } = useAuthStore();

  const {
    redirectTo = '/dashboard',
    requireAuth = false,
    requireGuest = false,
    onAuthChange,
  } = options;

  // Enhanced login with navigation
  const handleLogin = async (credentials, options = {}) => {
    try {
      const result = await login(credentials);

      if (result.success) {
        // Get redirect destination
        const from = location.state?.from?.pathname || options.redirectTo;

        if (from) {
          navigate(from, { replace: true });
        } else {
          // Check if user needs onboarding
          if (!hasCompletedOnboarding()) {
            navigate('/onboarding', { replace: true });
          } else if (!isProfileComplete()) {
            navigate('/profile', {
              replace: true,
              state: {
                message: 'Please complete your profile to get started.',
              },
            });
          } else {
            navigate(redirectTo, { replace: true });
          }
        }

        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Enhanced signup with navigation
  const handleSignup = async (userData, options = {}) => {
    try {
      const result = await signup(userData);

      if (result.success) {
        // For signup, always redirect to login with success message
        const destination = options.redirectTo || '/login';
        navigate(destination, {
          replace: true,
          state: {
            message: 'Account created successfully! Please log in.',
            email: userData.email,
          },
        });

        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  // Enhanced logout with cleanup and navigation
  const handleLogout = async (options = {}) => {
    try {
      await logout();

      // Navigate to home or specified route
      const destination = options.redirectTo || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      const destination = options.redirectTo || '/';
      navigate(destination, { replace: true });
    }
  };

  // Profile update helper
  const handleUpdateUser = async userData => {
    try {
      updateUser(userData);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  // Initialize auth on mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Handle authentication requirements
  useEffect(() => {
    // Don't redirect while loading or if not initialized
    if (isLoading || !isInitialized) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      // Store intended destination for after login
      navigate('/login', {
        state: { from: location },
        replace: true,
      });
    }

    if (requireGuest && isAuthenticated) {
      // Redirect authenticated users away from guest-only pages
      navigate(redirectTo, { replace: true });
    }
  }, [
    isAuthenticated,
    isLoading,
    isInitialized,
    requireAuth,
    requireGuest,
    navigate,
    location,
    redirectTo,
  ]);

  // Call onAuthChange when auth state changes
  useEffect(() => {
    if (onAuthChange && isInitialized) {
      onAuthChange({ isAuthenticated, user });
    }
  }, [isAuthenticated, user, isInitialized, onAuthChange]);

  // Auto-clear errors after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Permission helpers
  const hasRole = role => {
    return user?.role === role;
  };

  const hasPermission = permission => {
    const permissions = user?.permissions || [];
    return permissions.includes(permission);
  };

  const canAccessRoute = (routePermissions = []) => {
    if (!isAuthenticated) return false;
    if (routePermissions.length === 0) return true;

    return routePermissions.some(permission => hasPermission(permission));
  };

  // User status helpers
  const getUserStatus = () => {
    if (!user) return 'guest';
    if (!hasCompletedOnboarding()) return 'onboarding';
    if (!isProfileComplete()) return 'incomplete_profile';
    return 'active';
  };

  const shouldRedirectToOnboarding = () => {
    return isAuthenticated && !hasCompletedOnboarding();
  };

  const shouldCompleteProfile = () => {
    return isAuthenticated && hasCompletedOnboarding() && !isProfileComplete();
  };

  return {
    // Auth state
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    isInitialized,

    // Auth actions
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    clearError,

    // Utility functions
    getUser,
    getToken,
    isLoggedIn,
    isProfileComplete,
    hasCompletedOnboarding,

    // Permission helpers
    hasRole,
    hasPermission,
    canAccessRoute,

    // Status helpers
    getUserStatus,
    shouldRedirectToOnboarding,
    shouldCompleteProfile,
  };
};

export default useAuth;
