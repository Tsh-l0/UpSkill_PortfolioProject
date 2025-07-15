import useAuthStore from './authStore';
import useThemeStore from './themeStore.js';
import useUserStore from './userStore.js';

export { default as useAuthStore } from './authStore';
export { default as useThemeStore } from './themeStore.js';
export { default as useUserStore } from './userStore.js';

// Combined hooks for convenience
export const useStores = () => ({
  auth: useAuthStore(),
  theme: useThemeStore(),
  user: useUserStore(),
});

// Store initialization helper
export const initializeStores = async () => {
  try {
    // Initialize theme store
    const themeStore = useThemeStore.getState();
    const themeCleanup = themeStore.initializeTheme();
    
    // Initialize auth store if token exists
    const authStore = useAuthStore.getState();
    if (authStore.token) {
      await authStore.initializeAuth();
    }
    
    return {
      success: true,
      cleanup: () => {
        themeCleanup?.();
      },
    };
  } catch (error) {
    console.error('Failed to initialize stores:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};