import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state
      theme: 'light', // 'light' | 'dark' | 'system'
      isDark: false,
      systemPreference: 'light',
      isLoading: false,

      // Actions
      setTheme: async newTheme => {
        set({ isLoading: true });

        try {
          // Simulate theme change processing
          await new Promise(resolve => setTimeout(resolve, 100));

          let isDark = false;

          if (newTheme === 'system') {
            // Use system preference
            const systemPref = window.matchMedia('(prefers-color-scheme: dark)')
              .matches
              ? 'dark'
              : 'light';
            isDark = systemPref === 'dark';
            set({ systemPreference: systemPref });
          } else {
            isDark = newTheme === 'dark';
          }

          // Apply theme to document
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          set({
            theme: newTheme,
            isDark,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        let newTheme;

        if (currentTheme === 'light') {
          newTheme = 'dark';
        } else if (currentTheme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }

        get().setTheme(newTheme);
      },

      initializeTheme: () => {
        const { theme } = get();

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleSystemChange = e => {
          const systemPref = e.matches ? 'dark' : 'light';
          set({ systemPreference: systemPref });

          // Only update if currently using system theme
          if (get().theme === 'system') {
            const isDark = systemPref === 'dark';
            set({ isDark });

            if (isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        };

        // Add listener for system preference changes
        mediaQuery.addEventListener('change', handleSystemChange);

        // Initialize theme on app start
        get().setTheme(theme);

        // Return cleanup function
        return () => {
          mediaQuery.removeEventListener('change', handleSystemChange);
        };
      },

      // Utility functions
      getTheme: () => get().theme,
      getIsDark: () => get().isDark,
      getSystemPreference: () => get().systemPreference,

      // Theme-aware color helpers
      getThemeColors: () => {
        const isDark = get().isDark;
        return {
          background: isDark ? '#0f172a' : '#ffffff',
          foreground: isDark ? '#f8fafc' : '#0f172a',
          primary: isDark ? '#6366f1' : '#4f46e5',
          secondary: isDark ? '#64748b' : '#6b7280',
          accent: isDark ? '#a855f7' : '#8b5cf6',
          muted: isDark ? '#1e293b' : '#f1f5f9',
          border: isDark ? '#334155' : '#e2e8f0',
        };
      },

      // Preference helpers
      getThemePreferences: () => ({
        theme: get().theme,
        isDark: get().isDark,
        systemPreference: get().systemPreference,
        availableThemes: [
          { value: 'light', label: 'Light', icon: '☀️' },
          { value: 'dark', label: 'Dark', icon: '🌙' },
          { value: 'system', label: 'System', icon: '💻' },
        ],
      }),

      // Animation preferences
      getMotionPreferences: () => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

        return {
          prefersReducedMotion,
          animationDuration: prefersReducedMotion ? 0 : 300,
          enableAnimations: !prefersReducedMotion,
        };
      },
    }),
    {
      name: 'upskill-theme', // Storage key
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        theme: state.theme,
        systemPreference: state.systemPreference,
      }),
    }
  )
);

export default useThemeStore;
