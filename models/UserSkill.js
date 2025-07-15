const mongoose = require("mongoose");

const userSkillSchema = new mongoose.Schema(
  {
    // ===== CORE RELATIONSHIPS =====
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill ID is required"],
      index: true,
    },

    // ===== SKILL PROFICIENCY =====
    proficiencyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      required: [true, "Proficiency level is required"],
      default: "beginner",
      index: true,
    },
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative"],
      max: [50, "Years of experience seems unrealistic"],
      default: 0,
    },

    // ===== ENDORSEMENT TRACKING =====
    endorsementCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // For sorting by popularity
    },
    lastEndorsed: {
      type: Date,
      default: null,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    // ===== VISIBILITY & SETTINGS =====
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true, // For highlighting top skills
    },

    // ===== ADDITIONAL INFO =====
    description: {
      type: String,
      maxlength: [500, "Skill description cannot exceed 500 characters"],
      trim: true,
    },
    categories: [
      {
        type: String,
        enum: [
          "frontend",
          "backend",
          "mobile",
          "devops",
          "database",
          "design",
          "management",
          "other",
        ],
      },
    ],

    // ===== LEARNING & DEVELOPMENT =====
    learningGoals: {
      type: String,
      maxlength: [300, "Learning goals too long"],
      trim: true,
    },
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialUrl: String,
      },
    ],

    // ===== USAGE TRACKING =====
    lastUsed: {
      type: Date,
      default: Date.now,
    },
    usageFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "rarely"],
      default: "weekly",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== COMPOUND INDEXES FOR PERFORMANCE =====
// Unique constraint - one skill per user
userSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

// Query optimization indexes
userSkillSchema.index({ userId: 1, isVisible: 1 });
userSkillSchema.index({ skillId: 1, proficiencyLevel: 1 });
userSkillSchema.index({ userId: 1, endorsementCount: -1 });
userSkillSchema.index({ endorsementCount: -1, lastEndorsed: -1 });
userSkillSchema.index({ proficiencyLevel: 1, yearsOfExperience: -1 });
userSkillSchema.index({ isFeatured: 1, endorsementCount: -1 });

// ===== VIRTUAL FIELDS =====
// Populate skill details
userSkillSchema.virtual("skill", {
  ref: "Skill",
  localField: "skillId",
  foreignField: "_id",
  justOne: true,
});

// Populate user details
userSkillSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Get recent endorsements for this skill
userSkillSchema.virtual("recentEndorsements", {
  ref: "Endorsement",
  localField: "_id",
  foreignField: "userSkillId",
  options: { sort: { createdAt: -1 }, limit: 5 },
});

// Calculate skill strength score
userSkillSchema.virtual("skillStrength").get(function () {
  const proficiencyWeight = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  const proficiency = proficiencyWeight[this.proficiencyLevel] || 1;
  const experience = Math.min(this.yearsOfExperience / 5, 2); // Cap at 2 points for 5+ years
  const endorsements = Math.min(this.endorsementCount / 10, 2); // Cap at 2 points for 10+ endorsements

  return Math.round((proficiency + experience + endorsements) * 10) / 10;
});

// ===== INSTANCE METHODS =====
// Add endorsement to this skill
userSkillSchema.methods.addEndorsement = async function (rating = null) {
  this.endorsementCount += 1;
  this.lastEndorsed = new Date();

  // Update average rating if provided
  if (rating && this.averageRating) {
    this.averageRating =
      (this.averageRating * (this.endorsementCount - 1) + rating) /
      this.endorsementCount;
  } else if (rating && !this.averageRating) {
    this.averageRating = rating;
  }

  // Update user's total endorsement count
  await mongoose
    .model("User")
    .findByIdAndUpdate(this.userId, { $inc: { totalEndorsements: 1 } });

  return this.save();
};

// Remove endorsement from this skill
userSkillSchema.methods.removeEndorsement = async function () {
  if (this.endorsementCount > 0) {
    this.endorsementCount -= 1;

    // Update user's total endorsement count
    await mongoose
      .model("User")
      .findByIdAndUpdate(this.userId, { $inc: { totalEndorsements: -1 } });

    return this.save();
  }
};

// Update proficiency level
userSkillSchema.methods.updateProficiency = function (
  level,
  experience = null
) {
  this.proficiencyLevel = level;
  if (experience !== null) {
    this.yearsOfExperience = experience;
  }
  this.lastUsed = new Date();
  return this.save();
};

// ===== STATIC METHODS =====
// Get user's top skills
userSkillSchema.statics.getTopUserSkills = function (userId, limit = 5) {
  return this.find({
    userId: mongoose.Types.ObjectId(userId),
    isVisible: true,
  })
    .populate("skill", "name category icon description")
    .sort({
      isFeatured: -1,
      endorsementCount: -1,
      proficiencyLevel: -1,
      yearsOfExperience: -1,
    })
    .limit(limit);
};

// Find users with similar skills
userSkillSchema.statics.findUsersWithSimilarSkills = function (
  userId,
  limit = 10
) {
  return this.aggregate([
    // Get current user's skills
    { $match: { userId: mongoose.Types.ObjectId(userId), isVisible: true } },
    { $group: { _id: null, skillIds: { $push: "$skillId" } } },

    // Find other users with these skills
    {
      $lookup: {
        from: "userskills",
        let: {
          userSkills: "$skillIds",
          currentUser: mongoose.Types.ObjectId(userId),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$skillId", "$$userSkills"] },
                  { $ne: ["$userId", "$$currentUser"] },
                  { $eq: ["$isVisible", true] },
                ],
              },
            },
          },
          {
            $group: {
              _id: "$userId",
              commonSkills: { $sum: 1 },
              totalEndorsements: { $sum: "$endorsementCount" },
              skills: {
                $push: {
                  skillId: "$skillId",
                  level: "$proficiencyLevel",
                  endorsements: "$endorsementCount",
                },
              },
            },
          },
          { $sort: { commonSkills: -1, totalEndorsements: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $match: {
              "user.isProfilePublic": true,
              "user.isActive": true,
            },
          },
        ],
        as: "similarUsers",
      },
    },
    { $unwind: "$similarUsers" },
    { $replaceRoot: { newRoot: "$similarUsers" } },
  ]);
};

// Get trending skills
userSkillSchema.statics.getTrendingSkills = function (days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    { $match: { createdAt: { $gte: startDate }, isVisible: true } },
    {
      $group: {
        _id: "$skillId",
        userCount: { $sum: 1 },
        avgEndorsements: { $avg: "$endorsementCount" },
        totalEndorsements: { $sum: "$endorsementCount" },
        avgExperience: { $avg: "$yearsOfExperience" },
      },
    },
    {
      $lookup: {
        from: "skills",
        localField: "_id",
        foreignField: "_id",
        as: "skillInfo",
      },
    },
    { $unwind: "$skillInfo" },
    {
      $project: {
        skill: "$skillInfo",
        userCount: 1,
        avgEndorsements: { $round: ["$avgEndorsements", 1] },
        totalEndorsements: 1,
        avgExperience: { $round: ["$avgExperience", 1] },
        trendScore: {
          $add: [
            { $multiply: ["$userCount", 3] }, // User adoption weight
            { $multiply: ["$totalEndorsements", 2] }, // Quality weight
            "$avgExperience", // Experience weight
          ],
        },
      },
    },
    { $sort: { trendScore: -1 } },
    { $limit: limit },
  ]);
};

// Get skill distribution by category
userSkillSchema.statics.getSkillDistribution = function (userId) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        isVisible: true,
      },
    },
    {
      $lookup: {
        from: "skills",
        localField: "skillId",
        foreignField: "_id",
        as: "skill",
      },
    },
    { $unwind: "$skill" },
    {
      $group: {
        _id: "$skill.category",
        count: { $sum: 1 },
        totalEndorsements: { $sum: "$endorsementCount" },
        avgProficiency: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$proficiencyLevel", "beginner"] }, then: 1 },
                {
                  case: { $eq: ["$proficiencyLevel", "intermediate"] },
                  then: 2,
                },
                { case: { $eq: ["$proficiencyLevel", "advanced"] }, then: 3 },
                { case: { $eq: ["$proficiencyLevel", "expert"] }, then: 4 },
              ],
              default: 1,
            },
          },
        },
      },
    },
    {
      $project: {
        category: "$_id",
        count: 1,
        totalEndorsements: 1,
        avgProficiency: { $round: ["$avgProficiency", 1] },
        percentage: {
          $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100],
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// ===== MIDDLEWARE =====
// Update user's skill count after save
userSkillSchema.post("save", async function (doc) {
  if (this.isNew) {
    await mongoose
      .model("User")
      .findByIdAndUpdate(doc.userId, { $inc: { totalSkills: 1 } });
  }
});

// Update user's skill count after delete
userSkillSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose
      .model("User")
      .findByIdAndUpdate(doc.userId, { $inc: { totalSkills: -1 } });
  }
});

// ===== ERROR HANDLING =====
userSkillSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("You already have this skill in your profile"));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("UserSkill", userSkillSchema);
