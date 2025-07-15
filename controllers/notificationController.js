const Notification = require("../models/Notification");
const { validationResult } = require("express-validator");

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const {
      type,
      isRead,
      page = 1,
      limit = 20,
      priority,
    } = req.query;

    const userId = req.user.userId;

    // Build query
    const query = { recipientId: userId, isArchived: false };

    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === "true";
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate("senderId", "fullName profileImage")
      .sort({ priority: 1, createdAt: -1 }) // High priority first, then recent
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      _id: id,
      recipientId: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    next(error);
  }
};

/**
 * @desc    Archive notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const archiveNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      _id: id,
      recipientId: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    await notification.archive();

    res.status(200).json({
      success: true,
      message: "Notification archived",
    });
  } catch (error) {
    console.error("Archive notification error:", error);
    next(error);
  }
};

/**
 * @desc    Get notification counts
 * @route   GET /api/notifications/counts
 * @access  Private
 */
const getNotificationCounts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const counts = await Notification.aggregate([
      { $match: { recipientId: mongoose.Types.ObjectId(userId), isArchived: false } },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          unread: { $sum: { $cond: ["$isRead", 0, 1] } },
        },
      },
    ]);

    const totalUnread = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        totalUnread,
        byType: counts,
      },
    });
  } catch (error) {
    console.error("Get notification counts error:", error);
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getNotificationCounts,
};