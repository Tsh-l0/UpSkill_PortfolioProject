const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // ===== CORE RELATIONSHIPS =====
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient ID is required"],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // ===== NOTIFICATION CONTENT =====
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "endorsement",
        "connection_request",
        "connection_accepted",
        "profile_view",
        "skill_trending",
        "project_liked",
        "mention",
        "achievement",
        "system",
        "other",
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title too long"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message too long"],
    },
    actionUrl: {
      type: String,
      trim: true,
      maxlength: [200, "Action URL too long"],
    },

    // ===== RELATED OBJECTS =====
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    relatedType: {
      type: String,
      enum: [
        "user",
        "skill",
        "project",
        "experience",
        "connection",
        "endorsement",
        "other",
      ],
    },
    relatedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ===== STATUS =====
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
    },

    // ===== DELIVERY =====
    deliveryMethod: {
      type: String,
      enum: ["in-app", "email", "push", "sms"],
      default: "in-app",
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    deliveryError: {
      type: String,
      trim: true,
    },

    // ===== PRIORITY & CATEGORIZATION =====
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    category: {
      type: String,
      enum: ["social", "professional", "system", "marketing", "security"],
      default: "social",
    },

    // ===== EXPIRATION =====
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },

    // ===== AGGREGATION =====
    groupKey: {
      type: String, // For grouping similar notifications
      index: true,
    },
    isGrouped: {
      type: Boolean,
      default: false,
    },
    groupCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ senderId: 1, createdAt: -1 });
notificationSchema.index({ isArchived: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, isRead: 1 });

// ===== VIRTUAL FIELDS =====
notificationSchema.virtual("sender", {
  ref: "User",
  localField: "senderId",
  foreignField: "_id",
  justOne: true,
});

notificationSchema.virtual("recipient", {
  ref: "User",
  localField: "recipientId",
  foreignField: "_id",
  justOne: true,
});

notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// ===== INSTANCE METHODS =====
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save({ validateBeforeSave: false });
};

notificationSchema.methods.archive = function () {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// ===== STATIC METHODS =====
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    recipientId: userId,
    isRead: false,
    isArchived: false,
  });
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    {
      recipientId: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

// ===== MIDDLEWARE =====
// Set expiration date for notifications
notificationSchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    // Expire notifications after 30 days by default
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);
