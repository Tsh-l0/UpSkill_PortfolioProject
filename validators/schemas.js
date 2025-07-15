const Joi = require("joi");

const schemas = {
  // ===== AUTH SCHEMAS =====
  userRegistration: Joi.object({
    fullName: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])")
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  passwordReset: Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])")
      )
      .required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }),

  // ===== USER SCHEMAS =====
  profileUpdate: Joi.object({
    fullName: Joi.string().trim().min(2).max(100),
    username: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_]+$/),
    title: Joi.string().trim().max(100),
    bio: Joi.string().trim().max(1000),
    location: Joi.string().trim().max(100),
    currentCompany: Joi.string().trim().max(100),
    experienceLevel: Joi.string().valid(
      "junior",
      "mid",
      "senior",
      "lead",
      "executive"
    ),
    yearsOfExperience: Joi.number().min(0).max(50),
    githubUsername: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9_-]+$/),
    linkedinUrl: Joi.string()
      .uri()
      .pattern(/^https:\/\/(www\.)?linkedin\.com\//),
    personalWebsite: Joi.string().uri(),
  }),

  // ===== SKILL SCHEMAS =====
  skillCreate: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    category: Joi.string()
      .valid(
        "frontend",
        "backend",
        "mobile",
        "devops",
        "database",
        "design",
        "management",
        "data",
        "other"
      )
      .required(),
    description: Joi.string().trim().max(500),
    subcategory: Joi.string().trim().max(50),
    tags: Joi.array().items(Joi.string().trim()),
    icon: Joi.string().uri(),
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    officialUrl: Joi.string().uri(),
    difficulty: Joi.string().valid(
      "beginner",
      "intermediate",
      "advanced",
      "expert"
    ),
  }),

  addUserSkill: Joi.object({
    skillId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    proficiencyLevel: Joi.string()
      .valid("beginner", "intermediate", "advanced", "expert")
      .required(),
    yearsOfExperience: Joi.number().min(0).max(50),
    description: Joi.string().trim().max(500),
    isVisible: Joi.boolean(),
  }),

  // ===== ENDORSEMENT SCHEMAS =====
  createEndorsement: Joi.object({
    endorseeId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    skillId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    userSkillId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().trim().max(500),
    relationship: Joi.string()
      .valid(
        "colleague",
        "manager",
        "direct_report",
        "client",
        "peer",
        "mentor",
        "mentee",
        "other"
      )
      .required(),
    workContext: Joi.string().valid(
      "current_job",
      "previous_job",
      "project",
      "freelance",
      "education",
      "open_source",
      "other"
    ),
  }),

  // ===== EXPERIENCE SCHEMAS =====
  createExperience: Joi.object({
    jobTitle: Joi.string().trim().min(2).max(100).required(),
    company: Joi.string().trim().min(2).max(100).required(),
    companyWebsite: Joi.string().uri(),
    companySize: Joi.string().valid(
      "startup",
      "small",
      "medium",
      "large",
      "enterprise"
    ),
    industry: Joi.string().trim().max(50),
    location: Joi.string().trim().max(100),
    isRemote: Joi.boolean(),
    employmentType: Joi.string()
      .valid("full-time", "part-time", "contract", "internship", "freelance")
      .required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref("startDate")),
    isCurrent: Joi.boolean(),
    description: Joi.string().trim().min(10).max(2000).required(),
    achievements: Joi.array().items(Joi.string().trim().max(300)),
    responsibilities: Joi.array().items(Joi.string().trim().max(300)),
    technologies: Joi.array().items(Joi.string().trim()),
    teamSize: Joi.number().min(1).max(1000),
    isVisible: Joi.boolean(),
  }),

  // ===== PROJECT SCHEMAS =====
  createProject: Joi.object({
    title: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().min(10).max(500).required(),
    longDescription: Joi.string().trim().max(2000),
    githubUrl: Joi.string().pattern(/^https:\/\/github\.com\/.+/),
    liveUrl: Joi.string().uri(),
    documentationUrl: Joi.string().uri(),
    technologies: Joi.array().items(Joi.string().trim()),
    frameworks: Joi.array().items(Joi.string().trim()),
    category: Joi.string()
      .valid("web", "mobile", "desktop", "api", "library", "tool", "other")
      .required(),
    projectType: Joi.string().valid(
      "personal",
      "professional",
      "open-source",
      "client",
      "academic"
    ),
    status: Joi.string().valid(
      "planning",
      "in-progress",
      "completed",
      "maintained",
      "archived"
    ),
    isPublic: Joi.boolean(),
    isFeatured: Joi.boolean(),
    isOpenSource: Joi.boolean(),
    startDate: Joi.date().iso(),
    completionDate: Joi.date().iso(),
  }),

  // ===== CONNECTION SCHEMAS =====
  connectionRequest: Joi.object({
    recipientId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    message: Joi.string().trim().max(500),
    connectionType: Joi.string().valid(
      "professional",
      "mentor",
      "collaboration",
      "networking",
      "other"
    ),
    meetingContext: Joi.string().valid(
      "work",
      "event",
      "online",
      "referral",
      "education",
      "other"
    ),
  }),

  // ===== ANALYTICS SCHEMAS =====
  trackEvent: Joi.object({
    eventType: Joi.string()
      .valid(
        "profile_view",
        "skill_endorse",
        "connection_request",
        "connection_accept",
        "blog_read",
        "blog_bookmark",
        "project_view",
        "search_query",
        "login",
        "logout",
        "profile_update",
        "skill_add",
        "experience_add",
        "project_add",
        "other"
      )
      .required(),
    action: Joi.string().trim().max(100).required(),
    targetId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    targetType: Joi.string().valid(
      "user",
      "skill",
      "blog_post",
      "project",
      "experience",
      "connection",
      "other"
    ),
    metadata: Joi.object(),
    duration: Joi.number().min(0),
  }),
};

// Validation middleware generator
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    next();
  };
};

module.exports = { schemas, validate };
