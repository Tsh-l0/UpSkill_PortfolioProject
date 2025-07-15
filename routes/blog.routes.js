const express = require("express");
const { query, param } = require("express-validator");
const blogController = require("../controllers/blogController");
const { verifyToken, optionalAuth } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const cache = require("../middlewares/cache");

const router = express.Router();

/**
 * @desc    Get blog posts
 * @route   GET /api/blog/posts
 * @access  Public
 */
router.get(
  "/posts",
  [
    query("category")
      .optional()
      .isIn([
        "career",
        "technical",
        "industry",
        "skills",
        "tutorial",
        "news",
        "other",
      ])
      .withMessage("Invalid category"),
    query("tags")
      .optional()
      .isString()
      .withMessage("Tags must be comma-separated string"),
    query("search")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Search query too short"),
    query("featured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be boolean"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be 1-50"),
    query("sortBy")
      .optional()
      .isIn(["recent", "popular", "trending", "quality"])
      .withMessage("Invalid sort option"),
  ],
  validateRequest,
  cache(900), // 15 minutes cache
  blogController.getBlogPosts
);

/**
 * @desc    Get blog post by ID
 * @route   GET /api/blog/posts/:id
 * @access  Public
 */
router.get(
  "/posts/:id",
  [param("id").isMongoId().withMessage("Invalid blog post ID")],
  validateRequest,
  cache(3600), // 1 hour cache
  blogController.getBlogPostById
);

/**
 * @desc    Get blog categories
 * @route   GET /api/blog/categories
 * @access  Public
 */
router.get(
  "/categories",
  cache(7200), // 2 hours cache
  blogController.getBlogCategories
);

/**
 * @desc    Bookmark/unbookmark blog post
 * @route   POST /api/blog/posts/:id/bookmark
 * @access  Private
 */
router.post(
  "/posts/:id/bookmark",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid blog post ID")],
  validateRequest,
  blogController.toggleBookmark
);

/**
 * @desc    Get user bookmarks
 * @route   GET /api/blog/bookmarks
 * @access  Private
 */
router.get(
  "/bookmarks",
  verifyToken,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be 1-50"),
  ],
  validateRequest,
  blogController.getUserBookmarks
);

module.exports = router;
