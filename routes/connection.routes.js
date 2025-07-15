const express = require("express");
const { body, query, param } = require("express-validator");
const connectionController = require("../controllers/connectionController");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

/**
 * @desc    Send connection request
 * @route   POST /api/connections/request
 * @access  Private
 */
router.post(
  "/request",
  verifyToken,
  [
    body("recipientId").isMongoId().withMessage("Valid recipient ID required"),
    body("message")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Message too long (max 500 chars)"),
    body("connectionType")
      .optional()
      .isIn(["professional", "mentor", "collaboration", "networking", "other"])
      .withMessage("Invalid connection type"),
    body("meetingContext")
      .optional()
      .isIn(["work", "event", "online", "referral", "education", "other"])
      .withMessage("Invalid meeting context"),
  ],
  validateRequest,
  connectionController.sendConnectionRequest
);

/**
 * @desc    Respond to connection request
 * @route   PUT /api/connections/:id/respond
 * @access  Private
 */
router.put(
  "/:id/respond",
  verifyToken,
  [
    param("id").isMongoId().withMessage("Invalid connection ID"),
    body("action")
      .isIn(["accept", "decline"])
      .withMessage("Action must be accept or decline"),
  ],
  validateRequest,
  connectionController.respondToConnection
);

/**
 * @desc    Get user connections
 * @route   GET /api/connections
 * @access  Private
 */
router.get(
  "/",
  verifyToken,
  [
    query("status")
      .optional()
      .isIn(["pending", "accepted", "declined", "blocked"])
      .withMessage("Invalid status"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be 1-100"),
  ],
  validateRequest,
  connectionController.getUserConnections
);

/**
 * @desc    Get pending connection requests
 * @route   GET /api/connections/requests
 * @access  Private
 */
router.get(
  "/requests",
  verifyToken,
  [
    query("type")
      .optional()
      .isIn(["received", "sent"])
      .withMessage("Type must be received or sent"),
  ],
  validateRequest,
  connectionController.getPendingRequests
);

/**
 * @desc    Get mutual connections
 * @route   GET /api/connections/mutual/:userId
 * @access  Private
 */
router.get(
  "/mutual/:userId",
  verifyToken,
  [param("userId").isMongoId().withMessage("Invalid user ID")],
  validateRequest,
  connectionController.getMutualConnections
);

/**
 * @desc    Remove connection
 * @route   DELETE /api/connections/:id
 * @access  Private
 */
router.delete(
  "/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid connection ID")],
  validateRequest,
  connectionController.removeConnection
);

module.exports = router;
