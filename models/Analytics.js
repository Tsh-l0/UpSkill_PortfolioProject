const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    // ===== CORE RELATIONSHIPS =====
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // ===== EVENT DETAILS =====
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: [
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
        "other",
      ],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      maxlength: [100, "Action description too long"],
    },

    // ===== TARGET INFORMATION =====
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    targetType: {
      type: String,
      enum: [
        "user",
        "skill",
        "blog_post",
        "project",
        "experience",
        "connection",
        "other",
      ],
      index: true,
    },
    targetDetails: {
      name: String,
      category: String,
      type: String,
    },

    // ===== SESSION & CONTEXT =====
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      index: true,
    },
    ipAddress: {
      type: String,
      required: [true, "IP address is required"],
    },
    userAgent: {
      type: String,
      required: [true, "User agent is required"],
    },
    referrer: {
      type: String,
      trim: true,
    },

    // ===== DEVICE & BROWSER INFO =====
    device: {
      type: {
        type: String,
        enum: ["desktop", "mobile", "tablet"],
      },
      os: String,
      browser: String,
      version: String,
    },
    geolocation: {
      country: String,
      region: String,
      city: String,
      timezone: String,
    },

    // ===== EVENT METADATA =====
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    duration: {
      type: Number, // in milliseconds
      min: 0,
    },

    // ===== PERFORMANCE METRICS =====
    pageLoadTime: {
      type: Number, // in milliseconds
      min: 0,
    },
    apiResponseTime: {
      type: Number, // in milliseconds
      min: 0,
    },

    // ===== STATUS =====
    isProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
    processingError: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    // Don't include virtuals in JSON to save space
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

// ===== INDEXES =====
analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ eventType: 1, createdAt: -1 });
analyticsSchema.index({ targetId: 1, targetType: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1, createdAt: -1 });
analyticsSchema.index({ createdAt: -1 }); // For time-based queries
analyticsSchema.index({ isProcessed: 1, createdAt: 1 }); // For batch processing

// ===== STATIC METHODS =====
analyticsSchema.statics.getUserStats = function (userId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$eventType",
        count: { $sum: 1 },
        lastEvent: { $max: "$createdAt" },
      },
    },
  ]);
};

analyticsSchema.statics.getTrendingContent = function (
  contentType,
  limit = 10
) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        targetType: contentType,
        createdAt: { $gte: oneDayAgo },
      },
    },
    {
      $group: {
        _id: "$targetId",
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        views: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        score: { $multiply: ["$views", { $size: "$uniqueUsers" }] },
      },
    },
    { $sort: { score: -1 } },
    { $limit: limit },
  ]);
};

module.exports = mongoose.model("Analytics", analyticsSchema);
