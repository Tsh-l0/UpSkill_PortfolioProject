const express = require("express");
const { body, query, param } = require("express-validator");
const endorsementController = require("../controllers/endorsementController");
const { verifyToken } = require("../middlewares/auth.middleware");
const { endorsementLimiter } = require("../middlewares/security");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

/**
 * @desc    Create endorsement
 * @route   POST /api/endorsements
 * @access  Private
 */
router.post(
  "/",
  verifyToken,
  endorsementLimiter, // Rate limit endorsements
  [
    body("endorseeId").isMongoId().withMessage("Valid endorsee ID required"),
    body("skillId").isMongoId().withMessage("Valid skill ID required"),
    body("userSkillId").isMongoId().withMessage("Valid user skill ID required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Comment too long (max 500 chars)"),
    body("relationship")
      .isIn([
        "colleague",
        "manager",
        "direct_report",
        "client",
        "peer",
        "mentor",
        "mentee",
        "other",
      ])
      .withMessage("Valid relationship required"),
    body("workContext")
      .optional()
      .isIn([
        "current_job",
        "previous_job",
        "project",
        "freelance",
        "education",
        "open_source",
        "other",
      ])
      .withMessage("Invalid work context"),
  ],
  validateRequest,
  endorsementController.createEndorsement
);

/**
 * @desc    Get endorsements received by user
 * @route   GET /api/endorsements/received
 * @access  Private
 */
router.get(
  "/received",
  verifyToken,
  [
    query("skillId").optional().isMongoId().withMessage("Invalid skill ID"),
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
      .isIn(["recent", "rating", "trust"])
      .withMessage("Invalid sort option"),
  ],
  validateRequest,
  endorsementController.getReceivedEndorsements
);

/**
 * @desc    Get endorsements given by user
 * @route   GET /api/endorsements/given
 * @access  Private
 */
router.get(
  "/given",
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
  endorsementController.getGivenEndorsements
);

/**
 * @desc    Get endorsement statistics
 * @route   GET /api/endorsements/stats
 * @access  Private
 */
router.get("/stats", verifyToken, endorsementController.getEndorsementStats);

/**
 * @desc    Update endorsement
 * @route   PUT /api/endorsements/:id
 * @access  Private
 */
router.put(
  "/:id",
  verifyToken,
  [
    param("id").isMongoId().withMessage("Invalid endorsement ID"),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be 1-5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Comment too long"),
    body("relationship")
      .optional()
      .isIn([
        "colleague",
        "manager",
        "direct_report",
        "client",
        "peer",
        "mentor",
        "mentee",
        "other",
      ])
      .withMessage("Invalid relationship"),
  ],
  validateRequest,
  endorsementController.updateEndorsement
);

/**
 * @desc    Delete endorsement
 * @route   DELETE /api/endorsements/:id
 * @access  Private
 */
router.delete(
  "/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid endorsement ID")],
  validateRequest,
  endorsementController.deleteEndorsement
);

module.exports = router;
