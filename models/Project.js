const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // ===== CORE RELATIONSHIPS =====
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // ===== PROJECT DETAILS =====
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Title too long"],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      maxlength: [500, "Description too long"],
      trim: true,
    },
    longDescription: {
      type: String,
      maxlength: [2000, "Long description too long"],
      trim: true,
    },

    // ===== LINKS & RESOURCES =====
    githubUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https:\/\/github\.com\/.+/.test(v);
        },
        message: "Please enter a valid GitHub URL",
      },
    },
    liveUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid URL",
      },
    },
    documentationUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid documentation URL",
      },
    },

    // ===== MEDIA =====
    images: [
      {
        url: String,
        caption: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    thumbnailImage: {
      type: String,
      default: null,
    },

    // ===== TECHNICAL DETAILS =====
    technologies: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Technology name too long"],
      },
    ],
    frameworks: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Framework name too long"],
      },
    ],
    category: {
      type: String,
      enum: ["web", "mobile", "desktop", "api", "library", "tool", "other"],
      required: [true, "Project category is required"],
      index: true,
    },
    projectType: {
      type: String,
      enum: ["personal", "professional", "open-source", "client", "academic"],
      default: "personal",
      index: true,
    },

    // ===== STATUS & VISIBILITY =====
    status: {
      type: String,
      enum: ["planning", "in-progress", "completed", "maintained", "archived"],
      default: "completed",
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOpenSource: {
      type: Boolean,
      default: false,
    },

    // ===== TIMELINE =====
    startDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v >= this.startDate;
        },
        message: "Completion date must be after start date",
      },
    },

    // ===== METRICS & ENGAGEMENT =====
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    starCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===== COLLABORATION =====
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "contributor", "designer", "tester", "other"],
          default: "contributor",
        },
        contribution: String,
      },
    ],

    // ===== ADDITIONAL INFO =====
    challenges: [
      {
        type: String,
        maxlength: [300, "Challenge description too long"],
      },
    ],
    learnings: [
      {
        type: String,
        maxlength: [300, "Learning description too long"],
      },
    ],
    features: [
      {
        type: String,
        maxlength: [100, "Feature description too long"],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
projectSchema.index({ userId: 1, isFeatured: -1, completionDate: -1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ isPublic: 1, viewCount: -1 });
projectSchema.index({
  title: "text",
  description: "text",
  technologies: "text",
});

// ===== VIRTUAL FIELDS =====
projectSchema.virtual("duration").get(function () {
  if (!this.completionDate) return null;
  const months =
    (this.completionDate.getFullYear() - this.startDate.getFullYear()) * 12 +
    (this.completionDate.getMonth() - this.startDate.getMonth());
  return months;
});

// ===== MIDDLEWARE =====
projectSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
