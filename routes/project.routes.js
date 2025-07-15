const express = require("express");
const { body, query, param } = require("express-validator");
const projectController = require("../controllers/projectController");
const { verifyToken, optionalAuth } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

/**
 * @desc    Get user projects
 * @route   GET /api/projects
 * @access  Private
 */
router.get(
  "/",
  verifyToken,
  [
    query("userId").optional().isMongoId().withMessage("Invalid user ID"),
    query("category")
      .optional()
      .isIn(["web", "mobile", "desktop", "api", "library", "tool", "other"])
      .withMessage("Invalid category"),
    query("status")
      .optional()
      .isIn(["planning", "in-progress", "completed", "maintained", "archived"])
      .withMessage("Invalid status"),
    query("featured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be boolean"),
  ],
  validateRequest,
  projectController.getUserProjects
);

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Public (with optional auth)
 */
router.get(
  "/:id",
  optionalAuth,
  [param("id").isMongoId().withMessage("Invalid project ID")],
  validateRequest,
  projectController.getProjectById
);

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private
 */
router.post(
  "/",
  verifyToken,
  [
    body("title")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Title required (2-100 chars)"),
    body("description")
      .notEmpty()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description required (10-500 chars)"),
    body("longDescription")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("Long description too long (max 2000 chars)"),
    body("githubUrl")
      .optional()
      .matches(/^https:\/\/github\.com\/.+/)
      .withMessage("Invalid GitHub URL"),
    body("liveUrl").optional().isURL().withMessage("Invalid live URL"),
    body("documentationUrl")
      .optional()
      .isURL()
      .withMessage("Invalid documentation URL"),
    body("technologies")
      .optional()
      .isArray()
      .withMessage("Technologies must be array"),
    body("frameworks")
      .optional()
      .isArray()
      .withMessage("Frameworks must be array"),
    body("category")
      .isIn(["web", "mobile", "desktop", "api", "library", "tool", "other"])
      .withMessage("Valid category required"),
    body("projectType")
      .optional()
      .isIn(["personal", "professional", "open-source", "client", "academic"])
      .withMessage("Invalid project type"),
    body("status")
      .optional()
      .isIn(["planning", "in-progress", "completed", "maintained", "archived"])
      .withMessage("Invalid status"),
    body("isPublic")
      .optional()
      .isBoolean()
      .withMessage("Public must be boolean"),
    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be boolean"),
    body("isOpenSource")
      .optional()
      .isBoolean()
      .withMessage("Open source must be boolean"),
    body("startDate").optional().isISO8601().withMessage("Invalid start date"),
    body("completionDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid completion date"),
  ],
  validateRequest,
  projectController.createProject
);

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
router.put(
  "/:id",
  verifyToken,
  [
    param("id").isMongoId().withMessage("Invalid project ID"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Title must be 2-100 chars"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description must be 10-500 chars"),
    body("githubUrl")
      .optional()
      .matches(/^https:\/\/github\.com\/.+/)
      .withMessage("Invalid GitHub URL"),
    body("liveUrl").optional().isURL().withMessage("Invalid live URL"),
    body("category")
      .optional()
      .isIn(["web", "mobile", "desktop", "api", "library", "tool", "other"])
      .withMessage("Invalid category"),
    body("status")
      .optional()
      .isIn(["planning", "in-progress", "completed", "maintained", "archived"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  projectController.updateProject
);

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
router.delete(
  "/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid project ID")],
  validateRequest,
  projectController.deleteProject
);

/**
 * @desc    Like/unlike project
 * @route   POST /api/projects/:id/like
 * @access  Private
 */
router.post(
  "/:id/like",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid project ID")],
  validateRequest,
  projectController.toggleProjectLike
);

module.exports = router;
