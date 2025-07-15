const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    // ===== CORE RELATIONSHIPS =====
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester ID is required"],
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient ID is required"],
      index: true,
    },

    // ===== CONNECTION STATUS =====
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked", "cancelled"],
      default: "pending",
      required: [true, "Status is required"],
      index: true,
    },

    // ===== CONNECTION DETAILS =====
    message: {
      type: String,
      maxlength: [500, "Connection message too long"],
      trim: true,
    },
    connectionType: {
      type: String,
      enum: ["professional", "mentor", "collaboration", "networking", "other"],
      default: "professional",
    },

    // ===== TIMESTAMPS =====
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    respondedAt: {
      type: Date,
      index: true,
    },
    connectedAt: {
      type: Date,
      index: true,
    },

    // ===== MUTUAL CONTEXT =====
    mutualConnections: {
      type: Number,
      default: 0,
      min: 0,
    },
    commonSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    meetingContext: {
      type: String,
      enum: ["work", "event", "online", "referral", "education", "other"],
    },

    // ===== INTERACTION TRACKING =====
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
    interactionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },

    // ===== NOTES & TAGS =====
    notes: {
      type: String,
      maxlength: [1000, "Notes too long"],
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

    // ===== PRIVACY & SETTINGS =====
    isVisible: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
connectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
connectionSchema.index({ requesterId: 1, status: 1 });
connectionSchema.index({ recipientId: 1, status: 1 });
connectionSchema.index({ status: 1, connectedAt: -1 });
connectionSchema.index({ lastInteraction: -1 });

// ===== VIRTUAL FIELDS =====
connectionSchema.virtual("requester", {
  ref: "User",
  localField: "requesterId",
  foreignField: "_id",
  justOne: true,
});

connectionSchema.virtual("recipient", {
  ref: "User",
  localField: "recipientId",
  foreignField: "_id",
  justOne: true,
});

connectionSchema.virtual("duration").get(function () {
  if (!this.connectedAt) return null;
  return Math.floor((Date.now() - this.connectedAt) / (1000 * 60 * 60 * 24));
});

// ===== INSTANCE METHODS =====
connectionSchema.methods.accept = async function () {
  this.status = "accepted";
  this.respondedAt = new Date();
  this.connectedAt = new Date();

  // Update both users' connection counts
  await mongoose
    .model("User")
    .updateMany(
      { _id: { $in: [this.requesterId, this.recipientId] } },
      { $inc: { totalConnections: 1 } }
    );

  return this.save();
};

connectionSchema.methods.decline = function () {
  this.status = "declined";
  this.respondedAt = new Date();
  return this.save();
};

// ===== MIDDLEWARE =====
connectionSchema.pre("save", function (next) {
  // Prevent self-connection
  if (this.requesterId.toString() === this.recipientId.toString()) {
    return next(new Error("Users cannot connect to themselves"));
  }
  next();
});

module.exports = mongoose.model("Connection", connectionSchema);
