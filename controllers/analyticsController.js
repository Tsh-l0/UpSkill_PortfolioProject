const Analytics = require("../models/Analytics");
const User = require("../models/User");
const UserSkill = require("../models/UserSkill");
const Connection = require("../models/Connection");
const Endorsement = require("../models/Endorsement");

/**
 * @desc    Track user event
 * @route   POST /api/analytics/track
 * @access  Private
 */
const trackEvent = async (req, res, next) => {
  try {
    const {
      eventType,
      action,
      targetId,
      targetType,
      metadata = {},
      duration,
    } = req.body;

    const analytics = await Analytics.create({
      userId: req.user.userId,
      eventType,
      action,
      targetId,
      targetType,
      sessionId: req.sessionID || req.headers["x-session-id"],
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      referrer: req.get("Referer"),
      metadata,
      duration,
    });

    res.status(201).json({
      success: true,
      message: "Event tracked successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Track event error:", error);
    next(error);
  }
};

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { timeframe = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const [
      profileViews,
      skillsData,
      networkingData,
      recentActivity,
      recommendations,
    ] = await Promise.all([
      getProfileViewsData(userId, startDate),
      getSkillsAnalytics(userId),
      getNetworkingAnalytics(userId),
      getRecentActivity(userId, 10),
      getRecommendations(userId),
    ]);

    const dashboardData = {
      profileViews,
      skills: skillsData,
      networking: networkingData,
      recentActivity,
      recommendations,
      generatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Get dashboard analytics error:", error);
    next(error);
  }
};

/**
 * @desc    Get skills analytics
 * @route   GET /api/analytics/skills
 * @access  Private
 */
const getSkillsAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const skillsData = await UserSkill.getSkillDistribution(userId);
    const topSkills = await UserSkill.getTopUserSkills(userId, 10);

    res.status(200).json({
      success: true,
      data: {
        distribution: skillsData,
        topSkills,
      },
    });
  } catch (error) {
    console.error("Get skills analytics error:", error);
    next(error);
  }
};

/**
 * @desc    Get trending analytics
 * @route   GET /api/analytics/trending
 * @access  Public
 */
const getTrendingAnalytics = async (req, res, next) => {
  try {
    const { type = "skills", limit = 10 } = req.query;

    let trendingData;

    switch (type) {
      case "skills":
        trendingData = await UserSkill.getTrendingSkills(30, parseInt(limit));
        break;
      case "users":
        trendingData = await User.getTrendingUsers(parseInt(limit));
        break;
      case "content":
        trendingData = await Analytics.getTrendingContent("blog_post", parseInt(limit));
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid trending type",
        });
    }

    res.status(200).json({
      success: true,
      data: trendingData,
    });
  } catch (error) {
    console.error("Get trending analytics error:", error);
    next(error);
  }
};

// Helper functions
const getProfileViewsData = async (userId, startDate) => {
  const user = await User.findById(userId);
  const totalViews = user.profileViews || 0;

  // Get recent views from analytics
  const recentViews = await Analytics.countDocuments({
    targetId: userId,
    targetType: "user",
    eventType: "profile_view",
    createdAt: { $gte: startDate },
  });

  return {
    total: totalViews,
    recent: recentViews,
    growth: recentViews > 0 ? Math.round((recentViews / Math.max(totalViews - recentViews, 1)) * 100) : 0,
  };
};

const getNetworkingAnalytics = async (userId) => {
  const [connectionsCount, endorsementsReceived, endorsementsGiven] = await Promise.all([
    Connection.countDocuments({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: "accepted",
    }),
    Endorsement.countDocuments({ endorseeId: userId }),
    Endorsement.countDocuments({ endorserId: userId }),
  ]);

  return {
    totalConnections: connectionsCount,
    endorsementsReceived,
    endorsementsGiven,
    networkStrength: Math.round((connectionsCount * 0.4 + endorsementsReceived * 0.6) / 10) * 10,
  };
};

const getRecentActivity = async (userId, limit) => {
  return Analytics.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("eventType action targetType createdAt metadata");
};

const getRecommendations = (userId) => {
  return [
    { type: "profile", message: "Complete your profile to increase visibility", priority: "medium" },
    { type: "network", message: "Connect with 5 more professionals in your field", priority: "high" },
    { type: "skills", message: "Add 3 more skills to showcase your expertise", priority: "medium" },
    { type: "content", message: "Engage with trending content in your industry", priority: "low" },
  ];
};

module.exports = {
  trackEvent,
  getDashboardAnalytics,
  getSkillsAnalytics,
  getTrendingAnalytics,
};