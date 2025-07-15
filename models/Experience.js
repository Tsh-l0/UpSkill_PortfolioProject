const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    // ===== CORE RELATIONSHIPS =====
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // ===== JOB DETAILS =====
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title too long"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name too long"],
      index: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid website URL",
      },
    },
    companySize: {
      type: String,
      enum: ["startup", "small", "medium", "large", "enterprise"],
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [50, "Industry name too long"],
    },

    // ===== LOCATION & TYPE =====
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location too long"],
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      required: [true, "Employment type is required"],
      index: true,
    },

    // ===== TIMELINE =====
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ===== DESCRIPTION & ACHIEVEMENTS =====
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [2000, "Description too long"],
      trim: true,
    },
    achievements: [
      {
        type: String,
        maxlength: [300, "Achievement description too long"],
        trim: true,
      },
    ],
    responsibilities: [
      {
        type: String,
        maxlength: [300, "Responsibility description too long"],
        trim: true,
      },
    ],

    // ===== TECHNICAL DETAILS =====
    technologies: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Technology name too long"],
      },
    ],
    skills: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
        },
        proficiencyGained: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
      },
    ],

    // ===== VISIBILITY & STATUS =====
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationSource: {
      type: String,
      enum: ["linkedin", "manual", "email", "other"],
    },

    // ===== METRICS =====
    teamSize: {
      type: Number,
      min: 1,
      max: 1000,
    },
    reportsCount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
experienceSchema.index({ userId: 1, startDate: -1 });
experienceSchema.index({ company: 1, jobTitle: 1 });
experienceSchema.index({ isCurrent: 1, endDate: -1 });
experienceSchema.index({ technologies: 1 });
experienceSchema.index({ isVisible: 1, isVerified: 1 });

// ===== VIRTUAL FIELDS =====
experienceSchema.virtual("duration").get(function () {
  const start = this.startDate;
  const end = this.endDate || new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return months;
});

experienceSchema.virtual("durationText").get(function () {
  const months = this.duration;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${months} month${months === 1 ? "" : "s"}`;
  if (remainingMonths === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years} year${years === 1 ? "" : "s"}, ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`;
});

// ===== MIDDLEWARE =====
experienceSchema.pre("save", function (next) {
  // Ensure only one current job per user
  if (this.isCurrent && this.isModified("isCurrent")) {
    this.constructor
      .updateMany(
        { userId: this.userId, _id: { $ne: this._id } },
        { isCurrent: false }
      )
      .exec();
  }

  // Set end date to null if current
  if (this.isCurrent) {
    this.endDate = null;
  }

  next();
});

module.exports = mongoose.model("Experience", experienceSchema);
