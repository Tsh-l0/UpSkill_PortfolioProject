const express = require("express");
const { body, query, param } = require("express-validator");
const skillController = require("../controllers/skillController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");
const cache = require("../middlewares/cache");

const router = express.Router();

/**
 * @desc    Get all skills with filtering and pagination
 * @route   GET /api/skills
 * @access  Public
 */
router.get(
  "/",
  [
    query("category")
      .optional()
      .isIn([
        "frontend",
        "backend",
        "mobile",
        "devops",
        "database",
        "design",
        "management",
        "data",
        "other",
      ])
      .withMessage("Invalid category"),
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
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be 1-100"),
    query("sortBy")
      .optional()
      .isIn(["usageCount", "name", "trending", "newest"])
      .withMessage("Invalid sort option"),
  ],
  validateRequest,
  cache(1800), // 30 minutes cache
  skillController.getAllSkills
);

/**
 * @desc    Get trending skills
 * @route   GET /api/skills/trending
 * @access  Public
 */
router.get(
  "/trending",
  [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be 1-50"),
    query("days")
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage("Days must be 1-365"),
  ],
  validateRequest,
  cache(3600), // 1 hour cache
  skillController.getTrendingSkills
);

/**
 * @desc    Get skill categories
 * @route   GET /api/skills/categories
 * @access  Public
 */
router.get(
  "/categories",
  cache(7200), // 2 hours cache
  skillController.getSkillCategories
);

/**
 * @desc    Search skills
 * @route   GET /api/skills/search
 * @access  Public
 */
router.get(
  "/search",
  [
    query("q")
      .notEmpty()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Search query required (min 2 chars)"),
    query("category")
      .optional()
      .isIn([
        "frontend",
        "backend",
        "mobile",
        "devops",
        "database",
        "design",
        "management",
        "data",
        "other",
      ])
      .withMessage("Invalid category"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be 1-50"),
  ],
  validateRequest,
  cache(600), // 10 minutes cache
  skillController.searchSkills
);

/**
 * @desc    Create new skill (Admin only)
 * @route   POST /api/skills
 * @access  Private (Admin)
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  [
    body("name")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name required (2-50 chars)"),
    body("category")
      .notEmpty()
      .isIn([
        "frontend",
        "backend",
        "mobile",
        "devops",
        "database",
        "design",
        "management",
        "data",
        "other",
      ])
      .withMessage("Valid category required"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description too long (max 500 chars)"),
    body("subcategory")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Subcategory too long"),
    body("tags").optional().isArray().withMessage("Tags must be array"),
    body("icon").optional().isURL().withMessage("Icon must be valid URL"),
    body("color")
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage("Invalid color format"),
    body("officialUrl")
      .optional()
      .isURL()
      .withMessage("Official URL must be valid"),
    body("difficulty")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Invalid difficulty"),
  ],
  validateRequest,
  skillController.createSkill
);

/**
 * @desc    Update skill (Admin only)
 * @route   PUT /api/skills/:id
 * @access  Private (Admin)
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  [
    param("id").isMongoId().withMessage("Invalid skill ID"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be 2-50 chars"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description too long"),
    body("category")
      .optional()
      .isIn([
        "frontend",
        "backend",
        "mobile",
        "devops",
        "database",
        "design",
        "management",
        "data",
        "other",
      ])
      .withMessage("Invalid category"),
  ],
  validateRequest,
  skillController.updateSkill
);

module.exports = router;
