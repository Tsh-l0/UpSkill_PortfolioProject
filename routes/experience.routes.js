const express = require("express");
const { body, query, param } = require("express-validator");
const experienceController = require("../controllers/experienceController");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

/**
 * @desc    Get user experiences
 * @route   GET /api/experience
 * @access  Private
 */
router.get(
  "/",
  verifyToken,
  [query("userId").optional().isMongoId().withMessage("Invalid user ID")],
  validateRequest,
  experienceController.getUserExperiences
);

/**
 * @desc    Create new experience
 * @route   POST /api/experience
 * @access  Private
 */
router.post(
  "/",
  verifyToken,
  [
    body("jobTitle")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Job title required (2-100 chars)"),
    body("company")
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Company required (2-100 chars)"),
    body("companyWebsite")
      .optional()
      .isURL()
      .withMessage("Invalid company website"),
    body("companySize")
      .optional()
      .isIn(["startup", "small", "medium", "large", "enterprise"])
      .withMessage("Invalid company size"),
    body("industry")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Industry too long"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location too long"),
    body("isRemote")
      .optional()
      .isBoolean()
      .withMessage("Remote must be boolean"),
    body("employmentType")
      .isIn(["full-time", "part-time", "contract", "internship", "freelance"])
      .withMessage("Valid employment type required"),
    body("startDate").isISO8601().withMessage("Valid start date required"),
    body("endDate").optional().isISO8601().withMessage("Invalid end date"),
    body("isCurrent")
      .optional()
      .isBoolean()
      .withMessage("Current must be boolean"),
    body("description")
      .notEmpty()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Description required (10-2000 chars)"),
    body("achievements")
      .optional()
      .isArray()
      .withMessage("Achievements must be array"),
    body("responsibilities")
      .optional()
      .isArray()
      .withMessage("Responsibilities must be array"),
    body("technologies")
      .optional()
      .isArray()
      .withMessage("Technologies must be array"),
    body("teamSize")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("Team size must be 1-1000"),
    body("isVisible")
      .optional()
      .isBoolean()
      .withMessage("Visibility must be boolean"),
  ],
  validateRequest,
  experienceController.createExperience
);

/**
 * @desc    Update experience
 * @route   PUT /api/experience/:id
 * @access  Private
 */
router.put(
  "/:id",
  verifyToken,
  [
    param("id").isMongoId().withMessage("Invalid experience ID"),
    body("jobTitle")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Job title must be 2-100 chars"),
    body("company")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Company must be 2-100 chars"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Description must be 10-2000 chars"),
    body("startDate").optional().isISO8601().withMessage("Invalid start date"),
    body("endDate").optional().isISO8601().withMessage("Invalid end date"),
    body("isCurrent")
      .optional()
      .isBoolean()
      .withMessage("Current must be boolean"),
  ],
  validateRequest,
  experienceController.updateExperience
);

/**
 * @desc    Delete experience
 * @route   DELETE /api/experience/:id
 * @access  Private
 */
router.delete(
  "/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid experience ID")],
  validateRequest,
  experienceController.deleteExperience
);

module.exports = router;