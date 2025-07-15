const mongoose = require("mongoose");

const endorsementSchema = new mongoose.Schema(
  {
    // ===== CORE RELATIONSHIPS =====
    endorserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Endorser ID is required"],
      index: true,
    },
    endorseeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Endorsee ID is required"],
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill ID is required"],
      index: true,
    },
    userSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSkill",
      required: [true, "UserSkill ID is required"],
      index: true,
    },

    // ===== ENDORSEMENT CONTENT =====
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },

    // ===== RELATIONSHIP CONTEXT =====
    relationship: {
      type: String,
      enum: [
        "colleague",
        "manager",
        "direct_report",
        "client",
        "peer",
        "mentor",
        "mentee",
        "other",
      ],
      required: [true, "Relationship type is required"],
    },
    workContext: {
      type: String,
      enum: [
        "current_job",
        "previous_job",
        "project",
        "freelance",
        "education",
        "open_source",
        "other",
      ],
      default: "other",
    },

    // ===== VERIFICATION & TRUST =====
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    mutualConnections: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===== VISIBILITY & STATUS =====
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ===== REPORTING & MODERATION =====
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isReported: {
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

    // ===== ADDITIONAL METADATA =====
    endorsementSource: {
      type: String,
      enum: ["direct", "linkedin_import", "system_suggested", "bulk_import"],
      default: "direct",
    },
    helpfulnessScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ===== INTERACTION TRACKING =====
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastViewed: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== COMPOUND INDEXES FOR PERFORMANCE =====
// Prevent duplicate endorsements
endorsementSchema.index({ endorserId: 1, userSkillId: 1 }, { unique: true });

// Query optimization indexes
endorsementSchema.index({ endorseeId: 1, createdAt: -1 });
endorsementSchema.index({ endorserId: 1, createdAt: -1 });
endorsementSchema.index({ skillId: 1, rating: -1 });
endorsementSchema.index({ userSkillId: 1, createdAt: -1 });
endorsementSchema.index({ isPublic: 1, moderationStatus: 1 });
endorsementSchema.index({ verificationScore: -1, rating: -1 });

// ===== VIRTUAL FIELDS =====
// Populate endorser details
endorsementSchema.virtual("endorser", {
  ref: "User",
  localField: "endorserId",
  foreignField: "_id",
  justOne: true,
});

// Populate endorsee details
endorsementSchema.virtual("endorsee", {
  ref: "User",
  localField: "endorseeId",
  foreignField: "_id",
  justOne: true,
});

// Populate skill details
endorsementSchema.virtual("skill", {
  ref: "Skill",
  localField: "skillId",
  foreignField: "_id",
  justOne: true,
});

// Populate user skill details
endorsementSchema.virtual("userSkill", {
  ref: "UserSkill",
  localField: "userSkillId",
  foreignField: "_id",
  justOne: true,
});

// Calculate trust score
endorsementSchema.virtual("trustScore").get(function () {
  let score = this.verificationScore || 0;

  // Boost score for verified endorsements
  if (this.isVerified) score += 20;

  // Boost score for mutual connections
  score += Math.min(this.mutualConnections * 5, 30);

  // Reduce score for low ratings without context
  if (this.rating <= 2 && !this.comment) score -= 15;

  // Boost score for detailed comments
  if (this.comment && this.comment.length > 100) score += 10;

  return Math.max(0, Math.min(100, score));
});

// Calculate time ago string
endorsementSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
});

// ===== INSTANCE METHODS =====
// Mark as verified
endorsementSchema.methods.verify = function (score = 80) {
  this.isVerified = true;
  this.verificationScore = score;
  this.moderationStatus = "approved";
  return this.save();
};

// Report endorsement
endorsementSchema.methods.report = function (reason = "") {
  this.reportCount += 1;
  this.isReported = true;
  this.moderationStatus = "flagged";

  // Auto-hide if too many reports
  if (this.reportCount >= 3) {
    this.isPublic = false;
  }

  return this.save();
};

// Archive endorsement
endorsementSchema.methods.archive = function () {
  this.isArchived = true;
  this.isPublic = false;
  return this.save();
};

// Track view
endorsementSchema.methods.trackView = function () {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

// ===== STATIC METHODS =====
// Get endorsements for a user
endorsementSchema.statics.getEndorsementsForUser = function (
  userId,
  options = {}
) {
  const { skillId = null, limit = 10, page = 1, sortBy = "recent" } = options;

  const query = {
    endorseeId: mongoose.Types.ObjectId(userId),
    isPublic: true,
    moderationStatus: "approved",
  };

  if (skillId) {
    query.skillId = mongoose.Types.ObjectId(skillId);
  }

  let sort = {};
  switch (sortBy) {
    case "rating":
      sort = { rating: -1, createdAt: -1 };
      break;
    case "trust":
      sort = { verificationScore: -1, rating: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate("endorser", "fullName profileImage title currentCompany")
    .populate("skill", "name icon category")
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Get endorsements given by a user
endorsementSchema.statics.getEndorsementsGivenByUser = function (
  userId,
  options = {}
) {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;

  return this.find({
    endorserId: mongoose.Types.ObjectId(userId),
    isPublic: true,
    moderationStatus: "approved",
  })
    .populate("endorsee", "fullName profileImage title currentCompany")
    .populate("skill", "name icon category")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Get recent endorsements for a skill
endorsementSchema.statics.getRecentEndorsements = function (
  userSkillId,
  limit = 5
) {
  return this.find({
    userSkillId: mongoose.Types.ObjectId(userSkillId),
    isPublic: true,
    moderationStatus: "approved",
  })
    .populate("endorser", "fullName profileImage title currentCompany")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Get endorsement statistics
endorsementSchema.statics.getEndorsementStats = function (userId) {
  return this.aggregate([
    {
      $match: {
        endorseeId: mongoose.Types.ObjectId(userId),
        isPublic: true,
        moderationStatus: "approved",
      },
    },
    {
      $group: {
        _id: null,
        totalEndorsements: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        verifiedEndorsements: {
          $sum: { $cond: ["$isVerified", 1, 0] },
        },
        recentEndorsements: {
          $sum: {
            $cond: [
              {
                $gte: [
                  "$createdAt",
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalEndorsements: 1,
        averageRating: { $round: ["$averageRating", 1] },
        verifiedEndorsements: 1,
        verificationRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$verifiedEndorsements", "$totalEndorsements"] },
                100,
              ],
            },
            1,
          ],
        },
        recentEndorsements: 1,
      },
    },
  ]);
};

// Get top endorsed skills
endorsementSchema.statics.getTopEndorsedSkills = function (userId, limit = 5) {
  return this.aggregate([
    {
      $match: {
        endorseeId: mongoose.Types.ObjectId(userId),
        isPublic: true,
        moderationStatus: "approved",
      },
    },
    {
      $group: {
        _id: "$skillId",
        endorsementCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        recentEndorsement: { $max: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "skills",
        localField: "_id",
        foreignField: "_id",
        as: "skill",
      },
    },
    { $unwind: "$skill" },
    {
      $project: {
        skill: 1,
        endorsementCount: 1,
        averageRating: { $round: ["$averageRating", 1] },
        recentEndorsement: 1,
        score: {
          $add: [{ $multiply: ["$endorsementCount", 2] }, "$averageRating"],
        },
      },
    },
    { $sort: { score: -1 } },
    { $limit: limit },
  ]);
};

// ===== MIDDLEWARE =====
// Calculate verification score before saving
endorsementSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Calculate mutual connections (simplified)
    const mutualConnections = await mongoose
      .model("Connection")
      .countDocuments({
        $or: [
          {
            $and: [
              { requesterId: this.endorserId },
              { recipientId: { $ne: this.endorseeId } },
              { status: "accepted" },
            ],
          },
          {
            $and: [
              { recipientId: this.endorserId },
              { requesterId: { $ne: this.endorseeId } },
              { status: "accepted" },
            ],
          },
        ],
      });

    this.mutualConnections = mutualConnections;

    // Calculate initial verification score
    let score = 50; // Base score

    if (mutualConnections > 0) score += Math.min(mutualConnections * 5, 30);
    if (this.comment && this.comment.length > 50) score += 10;
    if (this.rating >= 4) score += 10;

    this.verificationScore = Math.min(score, 100);
  }

  next();
});

// Update UserSkill endorsement count after save
endorsementSchema.post("save", async function (doc) {
  if (this.isNew) {
    await mongoose.model("UserSkill").findByIdAndUpdate(doc.userSkillId, {
      $inc: { endorsementCount: 1 },
      $set: { lastEndorsed: new Date() },
    });
  }
});

// Update UserSkill endorsement count after delete
endorsementSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose
      .model("UserSkill")
      .findByIdAndUpdate(doc.userSkillId, { $inc: { endorsementCount: -1 } });
  }
});

// ===== ERROR HANDLING =====
endorsementSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("You have already endorsed this skill for this user"));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("Endorsement", endorsementSchema);
