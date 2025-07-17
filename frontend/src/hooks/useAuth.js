import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

const useAuth = (options = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auth store - using all available methods
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
    getProfileCompletionScore,
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
            email: userData.email, // Pre-fill email on login
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

  // Enhanced logout with navigation
  const handleLogout = async () => {
    try {
      await logout();
      
      // Always redirect to home after logout
      navigate('/', { replace: true });
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API fails
      navigate('/', { replace: true });
      return { success: true }; // Logout is primarily client-side
    }
  };

  // Check authentication requirement
  useEffect(() => {
    if (!isInitialized) return; // Wait for auth to initialize

    if (requireAuth && !isAuthenticated) {
      // Store the attempted location
      const from = location.pathname + location.search;
      
      navigate('/login', {
        replace: true,
        state: { 
          from: { pathname: from },
          message: 'Please log in to access this page.'
        }
      });
    }

    if (requireGuest && isAuthenticated) {
      // Redirect authenticated users away from guest-only pages
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isInitialized, requireAuth, requireGuest, navigate, location, redirectTo]);

  // Call onAuthChange callback when auth state changes
  useEffect(() => {
    if (onAuthChange && isInitialized) {
      onAuthChange({ isAuthenticated, user });
    }
  }, [isAuthenticated, user, isInitialized, onAuthChange]);

  // Profile completion helpers
  const getProfileStrength = () => {
    const score = getProfileCompletionScore();
    if (score >= 90) return { level: 'excellent', color: 'green' };
    if (score >= 70) return { level: 'good', color: 'blue' };
    if (score >= 50) return { level: 'fair', color: 'yellow' };
    return { level: 'poor', color: 'red' };
  };

  const getMissingProfileFields = () => {
    if (!user) return [];
    
    const missing = [];
    
    if (!user.fullName) missing.push('Full Name');
    if (!user.currentRole) missing.push('Current Role');
    if (!user.location) missing.push('Location');
    if (!user.bio) missing.push('Bio');
    if (!user.profileImage) missing.push('Profile Photo');
    if (!user.skills || user.skills.length === 0) missing.push('Skills');
    
    return missing;
  };

  // Return enhanced auth object
  return {
    // Auth state
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    isInitialized,
    
    // Auth actions (enhanced)
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    
    // Profile management
    updateUser,
    
    // Token management
    verifyToken,
    initializeAuth,
    
    // Password management
    forgotPassword,
    resetPassword,
    changePassword,
    
    // Utility functions
    clearError,
    getUser,
    getToken,
    isLoggedIn,
    
    // Profile completion
    isProfileComplete,
    hasCompletedOnboarding,
    getProfileCompletionScore,
    getProfileStrength,
    getMissingProfileFields,
    
    // Enhanced getters
    userRole: user?.role || 'user',
    userName: user?.fullName || user?.name || 'User',
    userEmail: user?.email || '',
    userAvatar: user?.profileImage || user?.avatar || null,
    
    // Auth checks
    canAccessRoute: (routeRequiresAuth = false) => {
      if (!routeRequiresAuth) return true;
      return isAuthenticated;
    },
    
    shouldRedirectToOnboarding: () => {
      return isAuthenticated && !hasCompletedOnboarding();
    },
    
    shouldRedirectToProfile: () => {
      return isAuthenticated && hasCompletedOnboarding() && !isProfileComplete();
    }
  };
};

export default useAuth;