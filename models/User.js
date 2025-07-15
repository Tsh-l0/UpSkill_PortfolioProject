const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ===== AUTHENTICATION FIELDS =====
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
      // Remove index: true here since we define it separately below
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never include in queries by default
    },
    role: {
      type: String,
      enum: ["admin", "learner"],
      default: "learner",
    },

    // ===== PROFILE INFORMATION =====
    // Basic Info
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
      trim: true,
      lowercase: true,
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      // Remove index: true here since we define it separately below
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    profileImage: {
      type: String,
      default: null,
    },
    // ===== PROFESSIONAL INFO =====
    currentCompany: {
      type: String,
      trim: true,
      maxlength: [100, "Company name too long"],
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead", "executive"],
      default: "junior",
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },
    // ===== SOCIAL LINKS =====
    githubUsername: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [50, "GitHub username too long"],
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z0-9_-]+$/.test(v);
        },
        message: "Invalid GitHub username format",
      },
    },
    linkedinUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https:\/\/(www\.)?linkedin\.com\//.test(v);
        },
        message: "Please enter a valid LinkedIn URL",
      },
    },
    personalWebsite: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid website URL",
      },
    },
    // ===== PRIVACY & SETTINGS =====
    isProfilePublic: {
      type: Boolean,
      default: true,
    },
    allowMessages: {
      type: Boolean,
      default: true,
    },
    allowEndorsements: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // ===== VERIFICATION & SECURITY =====
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // ===== ANALYTICS & METRICS =====
    profileCompletionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    profileViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEndorsements: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalConnections: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===== ACTIVITY TRACKING =====
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },

    // ===== STATUS =====
    isActive: {
      type: Boolean,
      default: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES - Define separately to avoid duplicates =====
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ isProfilePublic: 1, profileCompletionScore: -1 });
userSchema.index({ experienceLevel: 1, location: 1 });
userSchema.index({ totalEndorsements: -1, totalConnections: -1 });
userSchema.index({ isActive: 1, lastActiveAt: -1 });

// Text search index
userSchema.index(
  {
    fullName: "text",
    title: "text",
    bio: "text",
    location: "text",
  },
  {
    weights: {
      fullName: 10,
      title: 5,
      bio: 2,
      location: 1,
    },
  }
);

// ===== VIRTUAL FIELDS =====
userSchema.virtual("name").get(function () {
  return this.fullName;
});

userSchema.virtual("initials").get(function () {
  return this.fullName
    ? this.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";
});

userSchema.virtual("profileUrl").get(function () {
  return `/profile/${this.username || this._id}`;
});

userSchema.virtual("isOnline").get(function () {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.lastActiveAt > fiveMinutesAgo;
});

// ===== MIDDLEWARE =====
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 12; // High security
    this.password = await bcryptjs.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Update profile completion score before saving
userSchema.pre("save", function (next) {
  this.profileCompletionScore = this.calculateProfileCompletion();
  next();
});

// Update lastActiveAt on any update
userSchema.pre(["updateOne", "findOneAndUpdate"], function (next) {
  this.set({ lastActiveAt: new Date() });
  next();
});

// ===== INSTANCE METHODS =====
// Password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Profile completion calculation
userSchema.methods.calculateProfileCompletion = function () {
  const fields = [
    { field: "fullName", weight: 10 },
    { field: "email", weight: 10 },
    { field: "title", weight: 15 },
    { field: "bio", weight: 20 },
    { field: "location", weight: 10 },
    { field: "profileImage", weight: 10 },
    { field: "experienceLevel", weight: 5 },
    { field: "githubUsername", weight: 5 },
    { field: "linkedinUrl", weight: 5 },
    { field: "personalWebsite", weight: 5 },
    { field: "currentCompany", weight: 5 },
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  fields.forEach(({ field, weight }) => {
    totalWeight += weight;
    if (this[field] && this[field].toString().trim()) {
      completedWeight += weight;
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
};

// Generate profile URL
userSchema.methods.getProfileUrl = function () {
  return this.username ? `/profile/${this.username}` : `/profile/${this._id}`;
};

// Update activity timestamp
userSchema.methods.updateActivity = function () {
  this.lastActiveAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Increment view count
userSchema.methods.incrementViews = function () {
  this.profileViews += 1;
  return this.save({ validateBeforeSave: false });
};

// ===== STATIC METHODS =====
// Find users by skill (for future UserSkill integration)
userSchema.statics.findBySkill = function (skillId, options = {}) {
  // This will be updated when we add UserSkill model
  return this.find({
    isProfilePublic: true,
    isActive: true,
    ...options,
  }).sort({ totalEndorsements: -1, profileCompletionScore: -1 });
};

// Search users with filters
userSchema.statics.searchUsers = function (
  query = "",
  filters = {},
  options = {}
) {
  const {
    experienceLevel,
    location,
    isProfilePublic = true,
    limit = 20,
    page = 1,
  } = { ...filters, ...options };

  const searchQuery = {
    isActive: true,
    isProfilePublic,
  };

  // Add text search if query provided
  if (query.trim()) {
    searchQuery.$text = { $search: query };
  }

  // Add filters
  if (experienceLevel) searchQuery.experienceLevel = experienceLevel;
  if (location) searchQuery.location = new RegExp(location, "i");

  const skip = (page - 1) * limit;

  return this.find(searchQuery)
    .select("-password")
    .sort(
      query.trim()
        ? { score: { $meta: "textScore" } }
        : { profileCompletionScore: -1 }
    )
    .skip(skip)
    .limit(limit);
};

// Get trending users
userSchema.statics.getTrendingUsers = function (limit = 10) {
  return this.find({
    isProfilePublic: true,
    isActive: true,
  })
    .select("-password")
    .sort({
      totalEndorsements: -1,
      profileViews: -1,
      totalConnections: -1,
    })
    .limit(limit);
};

// ===== ERROR HANDLING =====
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`${field} already exists`));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
