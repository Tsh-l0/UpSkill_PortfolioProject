const User = require("../models/User");
const { validationResult } = require("express-validator");

// Utility function to sanitize user data
const sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.passwordResetToken;
  delete userObj.__v;

  return {
    ...userObj,
    id: userObj._id,
    name: userObj.fullName,
  };
};

// Generate mock analytics data (Phase 2 will replace with real data)
const generateMockAnalytics = (user) => {
  const baseViews = user.profileViews || 0;
  const baseEndorsements = user.totalEndorsements || 0;
  const baseConnections = user.totalConnections || 0;

  return {
    profileViews: {
      total: baseViews,
      thisMonth: Math.floor(baseViews * 0.3),
      growth: Math.floor(Math.random() * 30) + 5,
    },
    skillsGrowth: {
      totalSkills: Math.floor(Math.random() * 15) + 5,
      endorsedSkills: Math.floor(Math.random() * 8) + 2,
      trendingSkills: ["React", "TypeScript", "Node.js"],
    },
    networking: {
      totalConnections: baseConnections,
      newConnections: Math.floor(Math.random() * 10) + 1,
      endorsementsReceived: baseEndorsements,
      endorsementsGiven: Math.floor(baseEndorsements * 0.6),
      mutualConnections: Math.floor(baseConnections * 0.4),
    },
    careerProgress: {
      profileCompletion: user.profileCompletionScore || 0,
      recommendedActions: [
        { type: "profile", message: "Add more skills to your profile" },
        { type: "network", message: "Connect with 5 more professionals" },
        { type: "content", message: "Engage with industry content" },
      ],
    },
  };
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update activity
    await user.updateActivity();

    const userData = sanitizeUser(user);

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: errors.array().map((err) => err.msg),
      });
    }

    const userId = req.user.userId;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    const protectedFields = [
      "password",
      "email",
      "role",
      "profileViews",
      "totalEndorsements",
      "totalConnections",
      "joinDate",
      "emailVerificationToken",
      "passwordResetToken",
    ];

    protectedFields.forEach((field) => delete updateData[field]);

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    // Update activity timestamp
    user.lastActiveAt = new Date();

    // Save with validation
    await user.save();

    const userData = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors,
      });
    }

    next(error);
  }
};

/**
 * @desc    Get user analytics for dashboard
 * @route   GET /api/users/analytics
 * @access  Private
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { timeframe = "30d" } = req.query;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate analytics data (Phase 2 will use real analytics)
    const analytics = generateMockAnalytics(user);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    next(error);
  }
};

/**
 * @desc    Get user by ID (for viewing other profiles)
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if profile is public or if it's the user's own profile
    if (!user.isProfilePublic && user._id.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: "This profile is private",
      });
    }

    // Increment profile views if viewing someone else's profile
    if (user._id.toString() !== currentUserId) {
      await user.incrementViews();
    }

    const userData = sanitizeUser(user);

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    next(error);
  }
};

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
const searchUsers = async (req, res, next) => {
  try {
    const {
      q = "",
      experienceLevel,
      location,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};
    if (experienceLevel) filters.experienceLevel = experienceLevel;
    if (location) filters.location = location;

    const users = await User.searchUsers(q, filters, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    // Get total count for pagination
    const searchQuery = {
      isActive: true,
      isProfilePublic: true,
    };

    if (q.trim()) searchQuery.$text = { $search: q };
    if (experienceLevel) searchQuery.experienceLevel = experienceLevel;
    if (location) searchQuery.location = new RegExp(location, "i");

    const total = await User.countDocuments(searchQuery);
    const pages = Math.ceil(total / limit);

    const sanitizedUsers = users.map(sanitizeUser);

    res.status(200).json({
      success: true,
      users: sanitizedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    next(error);
  }
};

/**
 * @desc    Get trending/featured users
 * @route   GET /api/users/trending
 * @access  Private
 */
const getTrendingUsers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const users = await User.getTrendingUsers(parseInt(limit));
    const sanitizedUsers = users.map(sanitizeUser);

    res.status(200).json({
      success: true,
      users: sanitizedUsers,
    });
  } catch (error) {
    console.error("Get trending users error:", error);
    next(error);
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/users/settings
 * @access  Private
 */
const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { isProfilePublic, allowMessages, allowEndorsements } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update settings
    if (typeof isProfilePublic === "boolean") {
      user.isProfilePublic = isProfilePublic;
    }
    if (typeof allowMessages === "boolean") {
      user.allowMessages = allowMessages;
    }
    if (typeof allowEndorsements === "boolean") {
      user.allowEndorsements = allowEndorsements;
    }

    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        isProfilePublic: user.isProfilePublic,
        allowMessages: user.allowMessages,
        allowEndorsements: user.allowEndorsements,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    next(error);
  }
};

/**
 * @desc    Get user settings
 * @route   GET /api/users/settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "isProfilePublic allowMessages allowEndorsements"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      settings: {
        isProfilePublic: user.isProfilePublic,
        allowMessages: user.allowMessages,
        allowEndorsements: user.allowEndorsements,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAnalytics,
  getUserById,
  searchUsers,
  getTrendingUsers,
  updateSettings,
  getSettings,
};
