// services/store/userStore.js - FIXED IMPORTS
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

// FIXED: Import from correct API structure
import { usersAPI, analyticsAPI } from '../services/api/users';

const useUserStore = create(
  persist(
    (set, get) => ({
      // User profile state
      profile: null,
      skills: [],
      experience: [],
      projects: [],
      endorsements: [],
      connections: [],
      analytics: null,
      isLoading: false,
      error: null,

      // REAL Profile update
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await usersAPI.updateProfile(profileData);

          if (response.success) {
            const updatedProfile = response.user || response.data;

            set({
              profile: updatedProfile,
              isLoading: false,
              error: null,
            });

            toast.success('Profile updated successfully!');
            return { success: true, profile: updatedProfile };
          } else {
            throw new Error(response.message || 'Failed to update profile');
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to update profile';
          set({
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      // REAL Load user profile
      loadProfile: async (userId = null) => {
        set({ isLoading: true, error: null });

        try {
          const response = userId
            ? await usersAPI.getUserById(userId)
            : await usersAPI.getProfile();

          if (response.success) {
            const profile = response.user || response.data;

            set({
              profile: profile,
              isLoading: false,
              error: null,
            });

            return { success: true, profile };
          } else {
            throw new Error(response.message || 'Failed to load profile');
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to load profile';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // REAL Load user analytics
      loadAnalytics: async (timeframe = '30d') => {
        set({ isLoading: true, error: null });

        try {
          const response = await analyticsAPI.getUserAnalytics({ timeframe });

          if (response.success) {
            const analytics = response.data || response.analytics;

            set({
              analytics: analytics,
              isLoading: false,
              error: null,
            });

            return { success: true, analytics };
          } else {
            throw new Error(response.message || 'Failed to load analytics');
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to load analytics';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // REAL Load user skills
      loadUserSkills: async (userId = null) => {
        set({ isLoading: true, error: null });

        try {
          const response = await usersAPI.getUserSkills(userId);

          if (response.success) {
            const skills = response.skills || response.data || [];

            set({
              skills: skills,
              isLoading: false,
              error: null,
            });

            return { success: true, skills };
          } else {
            throw new Error(response.message || 'Failed to load skills');
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to load skills';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Initialize all user data
      initializeUserData: async (userId = null) => {
        set({ isLoading: true, error: null });

        try {
          // Load profile first (most important)
          const profileResult = await get().loadProfile(userId);
          
          if (profileResult.success) {
            // Load additional data in parallel (non-blocking)
            Promise.allSettled([
              get().loadUserSkills(userId),
              get().loadAnalytics(),
            ]).then((results) => {
              console.log('Additional data loaded:', results);
            });

            set({ isLoading: false });
            return { success: true };
          } else {
            throw new Error('Failed to load profile');
          }
        } catch (error) {
          const errorMessage = error.message || 'Failed to initialize user data';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Utility Functions
      calculateProfileCompletion: (profile) => {
        if (!profile) return 0;
        
        const fields = [
          profile?.fullName,
          profile?.bio,
          profile?.location,
          profile?.experienceLevel,
          profile?.profileImage,
          profile?.currentRole,
        ];

        const completedFields = fields.filter(
          field => field && field.trim() !== ''
        ).length;
        return Math.round((completedFields / fields.length) * 100);
      },

      getSkillsByCategory: () => {
        const skills = get().skills;
        return skills.reduce((acc, skill) => {
          const category = skill.skillId?.category || skill.category || 'other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(skill);
          return acc;
        }, {});
      },

      // Reset functions
      clearError: () => {
        set({ error: null });
      },

      resetUserData: () => {
        set({
          profile: null,
          skills: [],
          experience: [],
          projects: [],
          endorsements: [],
          connections: [],
          analytics: null,
          error: null,
        });
      },

      // Getters
      getProfile: () => get().profile,
      getSkills: () => get().skills,
      getAnalytics: () => get().analytics,
    }),
    {
      name: 'upskill-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        skills: state.skills,
        analytics: state.analytics,
      }),
    }
  )
);

export default useUserStore;