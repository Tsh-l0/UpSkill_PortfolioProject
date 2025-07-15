const express = require("express");
const { body, query, param } = require("express-validator");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middlewares/auth.middleware");
const uploadService = require("../services/uploadService");
const validateRequest = require("../middlewares/validateRequest");
const cache = require("../middlewares/cache");

const router = express.Router();

// Import existing routes
const userSkillRoutes = require("./userSkill.routes");

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
router.get("/profile", verifyToken, userController.getProfile);

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
router.put(
  "/profile",
  verifyToken,
  [
    body("fullName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be 2-100 chars"),
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Invalid username format"),
    body("title")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Title too long"),
    body("bio")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Bio too long"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location too long"),
    body("currentCompany")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Company name too long"),
    body("experienceLevel")
      .optional()
      .isIn(["junior", "mid", "senior", "lead", "executive"])
      .withMessage("Invalid experience level"),
    body("yearsOfExperience")
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage("Years must be 0-50"),
    body("githubUsername")
      .optional()
      .trim()
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("Invalid GitHub username"),
    body("linkedinUrl")
      .optional()
      .matches(/^https:\/\/(www\.)?linkedin\.com\//)
      .withMessage("Invalid LinkedIn URL"),
    body("personalWebsite")
      .optional()
      .isURL()
      .withMessage("Invalid website URL"),
  ],
  validateRequest,
  userController.updateProfile
);

/**
 * @desc    Get user analytics
 * @route   GET /api/users/analytics
 * @access  Private
 */
router.get(
  "/analytics",
  verifyToken,
  [
    query("timeframe")
      .optional()
      .isIn(["7d", "30d", "90d", "1y"])
      .withMessage("Invalid timeframe"),
  ],
  validateRequest,
  cache(900), // 15 minutes cache
  userController.getAnalytics
);

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
router.get(
  "/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validateRequest,
  userController.getUserById
);

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
router.get(
  "/search",
  verifyToken,
  [
    query("q")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Search query too short"),
    query("experienceLevel")
      .optional()
      .isIn(["junior", "mid", "senior", "lead", "executive"])
      .withMessage("Invalid experience level"),
    query("location")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Location too short"),
    query("skills")
      .optional()
      .isString()
      .withMessage("Skills must be comma-separated string"),
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
  cache(600), // 10 minutes cache
  userController.searchUsers
);

/**
 * @desc    Get trending users
 * @route   GET /api/users/trending
 * @access  Private
 */
router.get(
  "/trending",
  verifyToken,
  [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be 1-50"),
  ],
  validateRequest,
  cache(1800), // 30 minutes cache
  userController.getTrendingUsers
);

/**
 * @desc    Upload avatar
 * @route   POST /api/users/upload-avatar
 * @access  Private
 */
router.post(
  "/upload-avatar",
  verifyToken,
  uploadService.getUploadMiddleware("avatar", {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      // Validate file
      const validation = uploadService.validateFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.errors.join(", "),
        });
      }

      // Upload avatar
      const result = await uploadService.uploadAvatar(
        req.file.buffer,
        req.user.userId
      );

      // Update user profile
      const User = require("../models/User");
      await User.findByIdAndUpdate(req.user.userId, {
        profileImage: result.url,
      });

      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        data: {
          profileImage: result.url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @desc    Update user settings
 * @route   PUT /api/users/settings
 * @access  Private
 */
router.put(
  "/settings",
  verifyToken,
  [
    body("isProfilePublic")
      .optional()
      .isBoolean()
      .withMessage("Profile public must be boolean"),
    body("allowMessages")
      .optional()
      .isBoolean()
      .withMessage("Allow messages must be boolean"),
    body("allowEndorsements")
      .optional()
      .isBoolean()
      .withMessage("Allow endorsements must be boolean"),
  ],
  validateRequest,
  userController.updateSettings
);

/**
 * @desc    Get user settings
 * @route   GET /api/users/settings
 * @access  Private
 */
router.get("/settings", verifyToken, userController.getSettings);

// Mount user skill routes
router.use("/", userSkillRoutes);

module.exports = router;
