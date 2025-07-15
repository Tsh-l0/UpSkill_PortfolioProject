const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    // ===== BASIC INFO =====
    name: {
      type: String,
      required: [true, "Skill name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Skill name cannot exceed 50 characters"]
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },

    // ===== CATEGORIZATION =====
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "frontend",
        "backend",
        "mobile",
        "devops",
        "database",
        "design",
        "management",
        "data",
        "other",
      ],
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: [50, "Subcategory too long"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // ===== VISUAL & META =====
    icon: {
      type: String, // URL or icon class
      default: null,
    },
    color: {
      type: String, // Hex color for UI
      default: "#6366f1",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"],
    },
    officialUrl: {
      type: String, // Official documentation/website
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid URL",
      },
    },

    // ===== STATUS & POPULARITY =====
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "intermediate",
    },

    // ===== ANALYTICS =====
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    endorsementCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    trendScore: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    // ===== LEARNING RESOURCES =====
    learningResources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: [
            "documentation",
            "tutorial",
            "course",
            "book",
            "video",
            "other",
          ],
        },
        difficulty: {
          type: String,
          enum: ["beginner", "intermediate", "advanced"],
        },
        isFree: Boolean,
      },
    ],

    // ===== ADMIN INFO =====
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderationStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
skillSchema.index({ name: 1 }, { unique: true });
skillSchema.index({ category: 1, usageCount: -1 });
skillSchema.index({ name: "text", description: "text", tags: "text" });
skillSchema.index({ trendScore: -1, usageCount: -1 });
skillSchema.index({ isFeatured: 1, category: 1 });
skillSchema.index({ isActive: 1, moderationStatus: 1 });

// ===== VIRTUAL FIELDS =====
skillSchema.virtual("popularityRank").get(function () {
  return this.usageCount * 0.6 + this.endorsementCount * 0.4;
});

skillSchema.virtual("userSkills", {
  ref: "UserSkill",
  localField: "_id",
  foreignField: "skillId",
  match: { isVisible: true },
});

// ===== MIDDLEWARE =====
// Generate slug before saving
skillSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// ===== STATIC METHODS =====
skillSchema.statics.getTrendingSkills = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ trendScore: -1, usageCount: -1 })
    .limit(limit);
};

skillSchema.statics.searchSkills = function (query, category = null) {
  const searchQuery = { isActive: true };

  if (query) searchQuery.$text = { $search: query };
  if (category) searchQuery.category = category;

  return this.find(searchQuery).sort(
    query ? { score: { $meta: "textScore" } } : { usageCount: -1 }
  );
};

module.exports = mongoose.model("Skill", skillSchema);
