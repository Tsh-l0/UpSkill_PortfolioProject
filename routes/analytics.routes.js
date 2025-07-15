const express = require("express");
const { body, query } = require("express-validator");
const analyticsController = require("../controllers/analyticsController");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const cache = require("../middlewares/cache");

const router = express.Router();

/**
 * @desc    Track user event
 * @route   POST /api/analytics/track
 * @access  Private
 */
router.post(
  "/track",
  verifyToken,
  [
    body("eventType")
      .isIn([
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
      ])
      .withMessage("Invalid event type"),
    body("action")
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Action required (max 100 chars)"),
    body("targetId").optional().isMongoId().withMessage("Invalid target ID"),
    body("targetType")
      .optional()
      .isIn([
        "user",
        "skill",
        "blog_post",
        "project",
        "experience",
        "connection",
        "other",
      ])
      .withMessage("Invalid target type"),
    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be object"),
    body("duration")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Duration must be positive integer"),
  ],
  validateRequest,
  analyticsController.trackEvent
);

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
router.get(
  "/dashboard",
  verifyToken,
  [
    query("timeframe")
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage("Timeframe must be 1-365 days"),
  ],
  validateRequest,
  cache(900), // 15 minutes cache
  analyticsController.getDashboardAnalytics
);

/**
 * @desc    Get skills analytics
 * @route   GET /api/analytics/skills
 * @access  Private
 */
router.get(
  "/skills",
  verifyToken,
  cache(1800), // 30 minutes cache
  analyticsController.getSkillsAnalytics
);

/**
 * @desc    Get trending analytics
 * @route   GET /api/analytics/trending
 * @access  Public
 */
router.get(
  "/trending",
  [
    query("type")
      .optional()
      .isIn(["skills", "users", "content"])
      .withMessage("Invalid trending type"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be 1-50"),
  ],
  validateRequest,
  cache(3600), // 1 hour cache
  analyticsController.getTrendingAnalytics
);

module.exports = router;
