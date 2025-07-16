/**
 * Application constants
 */

// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
};

export const PERMISSIONS = {
  // User permissions
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile',
  DELETE_PROFILE: 'delete_profile',

  // Skill permissions
  ADD_SKILL: 'add_skill',
  EDIT_SKILL: 'edit_skill',
  DELETE_SKILL: 'delete_skill',
  ENDORSE_SKILL: 'endorse_skill',

  // Content permissions
  CREATE_POST: 'create_post',
  EDIT_POST: 'edit_post',
  DELETE_POST: 'delete_post',
  MODERATE_CONTENT: 'moderate_content',

  // Admin permissions
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
};

// Skill categories and levels
export const SKILL_CATEGORIES = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  MOBILE: 'Mobile',
  DEVOPS: 'DevOps',
  DATABASE: 'Database',
  DESIGN: 'Design',
  TESTING: 'Testing',
  CLOUD: 'Cloud',
  AI_ML: 'AI/ML',
  BLOCKCHAIN: 'Blockchain',
  SECURITY: 'Security',
  PROJECT_MANAGEMENT: 'Project Management',
  SOFT_SKILLS: 'Soft Skills',
  OTHER: 'Other',
};

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

export const SKILL_LEVEL_COLORS = {
  [SKILL_LEVELS.BEGINNER]: 'green',
  [SKILL_LEVELS.INTERMEDIATE]: 'yellow',
  [SKILL_LEVELS.ADVANCED]: 'orange',
  [SKILL_LEVELS.EXPERT]: 'red',
};

// Experience levels
export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  PRINCIPAL: 'principal',
  EXECUTIVE: 'executive',
};

export const EXPERIENCE_YEARS = {
  [EXPERIENCE_LEVELS.ENTRY]: '0-1 years',
  [EXPERIENCE_LEVELS.JUNIOR]: '1-3 years',
  [EXPERIENCE_LEVELS.MID]: '3-5 years',
  [EXPERIENCE_LEVELS.SENIOR]: '5-8 years',
  [EXPERIENCE_LEVELS.LEAD]: '8-12 years',
  [EXPERIENCE_LEVELS.PRINCIPAL]: '12+ years',
  [EXPERIENCE_LEVELS.EXECUTIVE]: '15+ years',
};

// Work preferences
export const WORK_TYPES = {
  REMOTE: 'remote',
  HYBRID: 'hybrid',
  ONSITE: 'onsite',
};

export const AVAILABILITY_STATUS = {
  OPEN_TO_WORK: 'open-to-work',
  NETWORKING: 'networking',
  NOT_AVAILABLE: 'not-available',
  CASUAL: 'casual',
};

// Content types and statuses
export const CONTENT_TYPES = {
  BLOG_POST: 'blog_post',
  TUTORIAL: 'tutorial',
  NEWS: 'news',
  CASE_STUDY: 'case_study',
  OPINION: 'opinion',
  RESOURCE: 'resource',
};

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  SCHEDULED: 'scheduled',
};

// Connection and endorsement status
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
};

export const ENDORSEMENT_STATUS = {
  ACTIVE: 'active',
  RETRACTED: 'retracted',
  DISPUTED: 'disputed',
};

// Notification types
export const NOTIFICATION_TYPES = {
  // Profile & Connections
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  PROFILE_VIEW: 'profile_view',

  // Skills & Endorsements
  SKILL_ENDORSED: 'skill_endorsed',
  ENDORSEMENT_REQUEST: 'endorsement_request',
  SKILL_TRENDING: 'skill_trending',

  // Content
  BLOG_POST_LIKED: 'blog_post_liked',
  BLOG_POST_COMMENT: 'blog_post_comment',
  CONTENT_FEATURED: 'content_featured',

  // System
  SYSTEM_UPDATE: 'system_update',
  MAINTENANCE: 'maintenance',
  SECURITY_ALERT: 'security_alert',

  // Job related
  JOB_MATCH: 'job_match',
  JOB_APPLICATION_UPDATE: 'job_application_update',

  // Mentorship
  MENTORSHIP_REQUEST: 'mentorship_request',
  SESSION_SCHEDULED: 'session_scheduled',
  SESSION_REMINDER: 'session_reminder',
};

// File types and sizes
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
  AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg'],
};

export const FILE_SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
};

// Time constants
export const TIME_FORMATS = {
  DATE_SHORT: 'MMM d, yyyy',
  DATE_LONG: 'MMMM d, yyyy',
  DATE_TIME: 'MMM d, yyyy h:mm a',
  TIME_SHORT: 'h:mm a',
  TIME_LONG: 'h:mm:ss a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

export const DURATION = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Search constants
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 10,
  MAX_RECENT_SEARCHES: 5,
};

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const THEME_COLORS = {
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    900: '#312e81',
  },
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Breakpoints (Tailwind CSS defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// API constants
export const API_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH: 'upskill-auth',
  THEME: 'upskill-theme',
  USER: 'upskill-user',
  PREFERENCES: 'upskill-preferences',
  SEARCH_HISTORY: 'upskill-search-history',
  ONBOARDING: 'upskill-onboarding',
  TOUR: 'upskill-tour',
};

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  GITHUB_USERNAME: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
  LINKEDIN_URL: /^https:\/\/[a-z]{2,3}\.linkedin\.com\/.*$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};

// Error codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',

  // Business logic
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  SKILL_ADDED: 'Skill added successfully',
  SKILL_ENDORSED: 'Skill endorsed successfully',
  CONNECTION_SENT: 'Connection request sent',
  CONNECTION_ACCEPTED: 'Connection request accepted',
  POST_SAVED: 'Post saved successfully',
  POST_LIKED: 'Post liked',
  SETTINGS_UPDATED: 'Settings updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
};

// Feature flags
export const FEATURE_FLAGS = {
  DARK_MODE: 'dark_mode',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  SOCIAL_AUTH: 'social_auth',
  BETA_FEATURES: 'beta_features',
  MENTORSHIP: 'mentorship',
  JOB_BOARD: 'job_board',
  SKILLS_TEST: 'skills_test',
  CHAT: 'chat',
  VIDEO_CALLS: 'video_calls',
};

// Social platforms
export const SOCIAL_PLATFORMS = {
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  DISCORD: 'discord',
  SLACK: 'slack',
};

// Job related constants
export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  FREELANCE: 'freelance',
  INTERNSHIP: 'internship',
  TEMPORARY: 'temporary',
};

export const SALARY_RANGES = {
  entry: '$30k - $50k',
  junior: '$50k - $70k',
  mid: '$70k - $100k',
  senior: '$100k - $150k',
  lead: '$150k - $200k',
  principal: '$200k+',
};

// Default values
export const DEFAULTS = {
  AVATAR_URL: '/images/default-avatar.png',
  COMPANY_LOGO: '/images/default-company.png',
  PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  NOTIFICATION_DURATION: 4000,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

export default {
  USER_ROLES,
  PERMISSIONS,
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_LEVEL_COLORS,
  EXPERIENCE_LEVELS,
  EXPERIENCE_YEARS,
  WORK_TYPES,
  AVAILABILITY_STATUS,
  CONTENT_TYPES,
  CONTENT_STATUS,
  CONNECTION_STATUS,
  ENDORSEMENT_STATUS,
  NOTIFICATION_TYPES,
  FILE_TYPES,
  FILE_SIZE_LIMITS,
  TIME_FORMATS,
  DURATION,
  PAGINATION,
  SEARCH,
  THEMES,
  THEME_COLORS,
  BREAKPOINTS,
  API_STATES,
  HTTP_METHODS,
  STORAGE_KEYS,
  REGEX,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  SOCIAL_PLATFORMS,
  JOB_TYPES,
  SALARY_RANGES,
  DEFAULTS,
};
