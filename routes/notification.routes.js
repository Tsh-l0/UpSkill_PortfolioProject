const express = require("express");
const { query, param } = require("express-validator");
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
router.get(
  "/",
  verifyToken,
  [
    query("type")
      .optional()
      .isIn([
        "endorsement",
        "connection_request",
        "connection_accepted",
        "profile_view",
        "skill_trending",
        "project_liked",
        "mention",
        "achievement",
        "system",
        "other",
      ])
      .withMessage("Invalid notification type"),
    query("isRead")
      .optional()
      .isBoolean()
      .withMessage("isRead must be boolean"),
    query("priority")
      .optional()
      .isIn(["low", "medium", "high", "urgent"])
      .withMessage("Invalid priority"),
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
  notificationController.getNotifications
);

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
router.put(
  "/:id/read",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid notification ID")],
  validateRequest,
  notificationController.markAsRead
);

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
router.put("/read-all", verifyToken, notificationController.markAllAsRead);

/**
 * @desc    Archive notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
router.delete(
  "/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid notification ID")],
  validateRequest,
  notificationController.archiveNotification
);

/**
 * @desc    Get notification counts
 * @route   GET /api/notifications/counts
 * @access  Private
 */
router.get(
  "/counts",
  verifyToken,
  notificationController.getNotificationCounts
);

module.exports = router;
