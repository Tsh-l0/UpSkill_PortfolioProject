const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    // ===== EXTERNAL API DATA =====
    externalId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      enum: ["rapidapi", "dev.to", "hashnode", "medium", "internal", "other"],
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, "Original URL is required"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid URL",
      },
    },

    // ===== CONTENT =====
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      maxlength: [500, "Excerpt too long"],
      trim: true,
    },
    content: {
      type: String,
      maxlength: [50000, "Content too long"],
    },

    // ===== AUTHOR INFO =====
    author: {
      name: {
        type: String,
        required: [true, "Author name is required"],
        trim: true,
      },
      bio: String,
      avatar: String,
      socialLinks: {
        twitter: String,
        github: String,
        linkedin: String,
        website: String,
      },
    },

    // ===== CATEGORIZATION =====
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "career",
        "technical",
        "industry",
        "skills",
        "tutorial",
        "news",
        "other",
      ],
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Tag too long"],
      },
    ],
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],

    // ===== MEDIA =====
    imageUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid image URL",
      },
    },
    thumbnailUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid thumbnail URL",
      },
    },

    // ===== ENGAGEMENT METRICS =====
    views: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarkCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    // ===== CONTENT METADATA =====
    readTime: {
      type: Number, // in minutes
      min: 1,
      max: 120,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    language: {
      type: String,
      default: "en",
      maxlength: [5, "Language code too long"],
    },

    // ===== TIMESTAMPS =====
    publishedAt: {
      type: Date,
      required: [true, "Published date is required"],
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastUpdated: {
      type: Date,
    },

    // ===== STATUS & MODERATION =====
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
    moderationStatus: {
      type: String,
      enum: ["approved", "pending", "rejected", "flagged"],
      default: "approved",
      index: true,
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },

    // ===== ANALYTICS =====
    clickThroughRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    engagementScore: {
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
blogPostSchema.index({ title: "text", excerpt: "text", tags: "text" });
blogPostSchema.index({ category: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ isActive: 1, moderationStatus: 1, publishedAt: -1 });
blogPostSchema.index({ views: -1, bookmarkCount: -1 });
blogPostSchema.index({ isFeatured: 1, qualityScore: -1 });

// ===== VIRTUAL FIELDS =====
blogPostSchema.virtual("isBookmarkedBy").get(function () {
  return (userId) => this.bookmarks.includes(userId);
});

blogPostSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.publishedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
});

// ===== INSTANCE METHODS =====
blogPostSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

blogPostSchema.methods.addBookmark = function (userId) {
  if (!this.bookmarks.includes(userId)) {
    this.bookmarks.push(userId);
    this.bookmarkCount += 1;
  }
  return this.save({ validateBeforeSave: false });
};

blogPostSchema.methods.removeBookmark = function (userId) {
  const index = this.bookmarks.indexOf(userId);
  if (index > -1) {
    this.bookmarks.splice(index, 1);
    this.bookmarkCount -= 1;
  }
  return this.save({ validateBeforeSave: false });
};

// ===== MIDDLEWARE =====
blogPostSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Calculate read time based on content length
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  next();
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
