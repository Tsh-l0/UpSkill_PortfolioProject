import * as yup from 'yup';
import {
  REGEX,
  SKILL_LEVELS,
  SKILL_CATEGORIES,
  WORK_TYPES,
} from './constants.js';

/**
 * Validation schemas using Yup
 */

// Custom validation methods
yup.addMethod(yup.string, 'strongPassword', function (message) {
  return this.test(
    'strong-password',
    message || 'Password must be strong',
    function (value) {
      if (!value) return true; // Let required() handle empty values
      return REGEX.PASSWORD.test(value);
    }
  );
});

yup.addMethod(yup.string, 'githubUsername', function (message) {
  return this.test(
    'github-username',
    message || 'Invalid GitHub username',
    function (value) {
      if (!value) return true;
      return REGEX.GITHUB_USERNAME.test(value);
    }
  );
});

yup.addMethod(yup.string, 'linkedinUrl', function (message) {
  return this.test(
    'linkedin-url',
    message || 'Invalid LinkedIn URL',
    function (value) {
      if (!value) return true;
      return REGEX.LINKEDIN_URL.test(value);
    }
  );
});

// Base schemas
const baseSchemas = {
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .strongPassword(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),

  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),

  bio: yup.string().max(500, 'Bio must be less than 500 characters'),

  title: yup
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters'),

  url: yup.string().url('Please enter a valid URL'),

  phone: yup.string().matches(REGEX.PHONE, 'Please enter a valid phone number'),

  location: yup.string().max(100, 'Location must be less than 100 characters'),
};

// Authentication schemas
export const authSchemas = {
  login: yup.object({
    email: baseSchemas.email,
    password: yup.string().required('Password is required'),
    rememberMe: yup.boolean(),
  }),

  register: yup.object({
    fullName: baseSchemas.name,
    email: baseSchemas.email,
    password: baseSchemas.password,
    confirmPassword: baseSchemas.confirmPassword,
    terms: yup
      .boolean()
      .oneOf([true], 'You must accept the terms and conditions'),
  }),

  forgotPassword: yup.object({
    email: baseSchemas.email,
  }),

  resetPassword: yup.object({
    password: baseSchemas.password,
    confirmPassword: baseSchemas.confirmPassword,
    token: yup.string().required('Reset token is required'),
  }),

  changePassword: yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: baseSchemas.password,
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password'),
  }),
};

// Profile schemas
export const profileSchemas = {
  basicInfo: yup.object({
    name: baseSchemas.name,
    title: baseSchemas.title,
    bio: baseSchemas.bio,
    location: baseSchemas.location,
    phone: baseSchemas.phone.nullable(),
    website: baseSchemas.url.nullable(),
  }),

  socialLinks: yup.object({
    github: yup.string().githubUsername('Invalid GitHub username').nullable(),
    linkedin: yup.string().linkedinUrl('Invalid LinkedIn URL').nullable(),
    twitter: yup
      .string()
      .matches(/^@?[A-Za-z0-9_]{1,15}$/, 'Invalid Twitter handle')
      .nullable(),
    portfolio: baseSchemas.url.nullable(),
  }),

  preferences: yup.object({
    workType: yup
      .string()
      .oneOf(Object.values(WORK_TYPES), 'Invalid work type')
      .nullable(),
    availability: yup
      .string()
      .oneOf(
        ['open-to-work', 'networking', 'not-available'],
        'Invalid availability status'
      )
      .nullable(),
    salaryExpectation: yup
      .string()
      .max(50, 'Salary expectation must be less than 50 characters')
      .nullable(),
    preferredRoles: yup
      .array()
      .of(yup.string().max(50, 'Role must be less than 50 characters'))
      .max(5, 'Maximum 5 preferred roles allowed'),
  }),

  onboarding: yup.object({
    name: baseSchemas.name,
    title: baseSchemas.title,
    location: baseSchemas.location,
    bio: baseSchemas.bio.required('Bio is required'),
    experienceLevel: yup
      .string()
      .oneOf(
        ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'],
        'Invalid experience level'
      )
      .required('Experience level is required'),
    skills: yup
      .array()
      .of(yup.string())
      .min(1, 'Please select at least one skill')
      .max(20, 'Maximum 20 skills allowed'),
    goals: yup.array().of(yup.string()).max(5, 'Maximum 5 goals allowed'),
  }),
};

// Skills schemas
export const skillSchemas = {
  addSkill: yup.object({
    name: yup
      .string()
      .min(2, 'Skill name must be at least 2 characters')
      .max(50, 'Skill name must be less than 50 characters')
      .required('Skill name is required'),
    category: yup
      .string()
      .oneOf(Object.values(SKILL_CATEGORIES), 'Invalid skill category')
      .required('Category is required'),
    proficiency: yup
      .string()
      .oneOf(Object.values(SKILL_LEVELS), 'Invalid proficiency level')
      .required('Proficiency level is required'),
    description: yup
      .string()
      .max(200, 'Description must be less than 200 characters')
      .nullable(),
    yearsOfExperience: yup
      .number()
      .min(0, 'Years of experience cannot be negative')
      .max(50, 'Years of experience cannot exceed 50')
      .nullable(),
  }),

  endorseSkill: yup.object({
    skillId: yup.string().required('Skill ID is required'),
    message: yup
      .string()
      .max(200, 'Endorsement message must be less than 200 characters')
      .nullable(),
  }),
};

// Experience schemas
export const experienceSchemas = {
  addExperience: yup.object({
    company: yup
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name must be less than 100 characters')
      .required('Company name is required'),
    position: yup
      .string()
      .min(2, 'Position must be at least 2 characters')
      .max(100, 'Position must be less than 100 characters')
      .required('Position is required'),
    startDate: yup
      .date()
      .max(new Date(), 'Start date cannot be in the future')
      .required('Start date is required'),
    endDate: yup
      .date()
      .min(yup.ref('startDate'), 'End date must be after start date')
      .nullable(),
    location: yup
      .string()
      .max(100, 'Location must be less than 100 characters')
      .nullable(),
    description: yup
      .string()
      .max(1000, 'Description must be less than 1000 characters'),
    technologies: yup
      .array()
      .of(
        yup.string().max(50, 'Technology name must be less than 50 characters')
      )
      .max(20, 'Maximum 20 technologies allowed'),
    achievements: yup
      .array()
      .of(yup.string().max(200, 'Achievement must be less than 200 characters'))
      .max(10, 'Maximum 10 achievements allowed'),
  }),
};

// Project schemas
export const projectSchemas = {
  addProject: yup.object({
    name: yup
      .string()
      .min(2, 'Project name must be at least 2 characters')
      .max(100, 'Project name must be less than 100 characters')
      .required('Project name is required'),
    description: yup
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be less than 1000 characters')
      .required('Description is required'),
    technologies: yup
      .array()
      .of(
        yup.string().max(50, 'Technology name must be less than 50 characters')
      )
      .min(1, 'Please select at least one technology')
      .max(20, 'Maximum 20 technologies allowed'),
    githubUrl: baseSchemas.url.nullable(),
    liveUrl: baseSchemas.url.nullable(),
    startDate: yup
      .date()
      .max(new Date(), 'Start date cannot be in the future')
      .nullable(),
    endDate: yup
      .date()
      .min(yup.ref('startDate'), 'End date must be after start date')
      .nullable(),
    status: yup
      .string()
      .oneOf(
        ['planning', 'in-progress', 'completed', 'on-hold'],
        'Invalid project status'
      )
      .required('Project status is required'),
    featured: yup.boolean(),
  }),
};

// Contact schemas
export const contactSchemas = {
  contact: yup.object({
    name: baseSchemas.name,
    email: baseSchemas.email,
    subject: yup
      .string()
      .min(5, 'Subject must be at least 5 characters')
      .max(100, 'Subject must be less than 100 characters')
      .required('Subject is required'),
    message: yup
      .string()
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message must be less than 1000 characters')
      .required('Message is required'),
  }),

  newsletter: yup.object({
    email: baseSchemas.email,
    preferences: yup.object({
      weekly: yup.boolean(),
      monthly: yup.boolean(),
      announcements: yup.boolean(),
    }),
  }),
};

// Search schemas
export const searchSchemas = {
  userSearch: yup.object({
    query: yup
      .string()
      .min(2, 'Search query must be at least 2 characters')
      .max(100, 'Search query must be less than 100 characters'),
    skills: yup.array().of(yup.string()),
    location: yup
      .string()
      .max(100, 'Location must be less than 100 characters'),
    experienceLevel: yup
      .string()
      .oneOf(['entry', 'junior', 'mid', 'senior', 'lead', 'principal']),
    availability: yup.string().oneOf(['open-to-work', 'networking']),
  }),

  skillSearch: yup.object({
    query: yup
      .string()
      .min(2, 'Search query must be at least 2 characters')
      .max(100, 'Search query must be less than 100 characters'),
    category: yup.string().oneOf(Object.values(SKILL_CATEGORIES)),
    level: yup.string().oneOf(Object.values(SKILL_LEVELS)),
  }),
};

// File upload schemas
export const uploadSchemas = {
  avatar: yup.object({
    file: yup
      .mixed()
      .required('Please select a file')
      .test('fileSize', 'File size must be less than 2MB', value => {
        return value && value.size <= 2 * 1024 * 1024;
      })
      .test(
        'fileType',
        'Only JPEG, PNG, and WebP images are allowed',
        value => {
          return (
            value &&
            ['image/jpeg', 'image/png', 'image/webp'].includes(value.type)
          );
        }
      ),
  }),

  document: yup.object({
    file: yup
      .mixed()
      .required('Please select a file')
      .test('fileSize', 'File size must be less than 10MB', value => {
        return value && value.size <= 10 * 1024 * 1024;
      })
      .test('fileType', 'Only PDF, DOC, and DOCX files are allowed', value => {
        return (
          value &&
          [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].includes(value.type)
        );
      }),
  }),
};

// Settings schemas
export const settingsSchemas = {
  privacy: yup.object({
    profileVisibility: yup
      .string()
      .oneOf(['public', 'connections', 'private'], 'Invalid visibility setting')
      .required('Profile visibility is required'),
    showEmail: yup.boolean(),
    showPhone: yup.boolean(),
    showLocation: yup.boolean(),
    allowMessaging: yup.boolean(),
    allowEndorsements: yup.boolean(),
  }),

  notifications: yup.object({
    email: yup.object({
      connections: yup.boolean(),
      endorsements: yup.boolean(),
      messages: yup.boolean(),
      blog: yup.boolean(),
      newsletter: yup.boolean(),
    }),
    push: yup.object({
      connections: yup.boolean(),
      endorsements: yup.boolean(),
      messages: yup.boolean(),
    }),
  }),

  account: yup.object({
    email: baseSchemas.email,
    timezone: yup.string(),
    language: yup.string().oneOf(['en', 'es', 'fr', 'de', 'pt', 'zh']),
    dateFormat: yup.string().oneOf(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  }),
};

// Helper functions for validation
export const validateField = async (schema, field, value) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

export const getFieldError = (errors, field) => {
  return errors[field] || null;
};

export const hasFieldError = (errors, field) => {
  return Boolean(errors[field]);
};

// Common validation rules
export const rules = {
  required:
    (message = 'This field is required') =>
    value => {
      return value ? undefined : message;
    },

  minLength: (min, message) => value => {
    return value && value.length >= min
      ? undefined
      : message || `Minimum ${min} characters required`;
  },

  maxLength: (max, message) => value => {
    return value && value.length <= max
      ? undefined
      : message || `Maximum ${max} characters allowed`;
  },

  email:
    (message = 'Please enter a valid email address') =>
    value => {
      return !value || REGEX.EMAIL.test(value) ? undefined : message;
    },

  url:
    (message = 'Please enter a valid URL') =>
    value => {
      return !value || REGEX.URL.test(value) ? undefined : message;
    },

  phone:
    (message = 'Please enter a valid phone number') =>
    value => {
      return !value || REGEX.PHONE.test(value) ? undefined : message;
    },

  strongPassword:
    (message = 'Password must be strong') =>
    value => {
      return !value || REGEX.PASSWORD.test(value) ? undefined : message;
    },

  match: (otherField, message) => (value, allValues) => {
    return value === allValues[otherField]
      ? undefined
      : message || 'Fields must match';
  },

  oneOf: (options, message) => value => {
    return !value || options.includes(value)
      ? undefined
      : message || 'Invalid option selected';
  },

  fileSize: (maxSize, message) => file => {
    return !file || file.size <= maxSize
      ? undefined
      : message || `File size must be less than ${maxSize / 1024 / 1024}MB`;
  },

  fileType: (allowedTypes, message) => file => {
    return !file || allowedTypes.includes(file.type)
      ? undefined
      : message || 'Invalid file type';
  },
};

export default {
  authSchemas,
  profileSchemas,
  skillSchemas,
  experienceSchemas,
  projectSchemas,
  contactSchemas,
  searchSchemas,
  uploadSchemas,
  settingsSchemas,
  validateField,
  validateForm,
  getFieldError,
  hasFieldError,
  rules,
};
