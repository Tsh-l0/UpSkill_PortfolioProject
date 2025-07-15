const Connection = require("../models/Connection");
const User = require("../models/User");
const { validationResult } = require("express-validator");

/**
 * @desc    Send connection request
 * @route   POST /api/connections/request
 * @access  Private
 */
const sendConnectionRequest = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: errors.array().map((err) => err.msg),
      });
    }

    const { recipientId, message, connectionType, meetingContext } = req.body;
    const requesterId = req.user.userId;

    // Check if recipient exists and allows connections
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!recipient.isActive) {
      return res.status(400).json({
        success: false,
        error: "Cannot connect to inactive user",
      });
    }

    // Check for existing connection
    const existingConnection = await Connection.findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });

    if (existingConnection) {
      return res.status(409).json({
        success: false,
        error: "Connection already exists or request already sent",
      });
    }

    // Create connection request
    const connection = await Connection.create({
      requesterId,
      recipientId,
      message,
      connectionType: connectionType || "professional",
      meetingContext,
    });

    await connection.populate([
      {
        path: "requester",
        select: "fullName profileImage title currentCompany",
      },
      {
        path: "recipient",
        select: "fullName profileImage title currentCompany",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      data: connection,
    });
  } catch (error) {
    console.error("Send connection request error:", error);
    next(error);
  }
};

/**
 * @desc    Respond to connection request
 * @route   PUT /api/connections/:id/respond
 * @access  Private
 */
const respondToConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user.userId;

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Action must be 'accept' or 'decline'",
      });
    }

    const connection = await Connection.findOne({
      _id: id,
      recipientId: userId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection request not found",
      });
    }

    if (action === "accept") {
      await connection.accept();
    } else {
      await connection.decline();
    }

    await connection.populate([
      {
        path: "requester",
        select: "fullName profileImage title currentCompany",
      },
      {
        path: "recipient",
        select: "fullName profileImage title currentCompany",
      },
    ]);

    res.status(200).json({
      success: true,
      message: `Connection request ${action}ed successfully`,
      data: connection,
    });
  } catch (error) {
    console.error("Respond to connection error:", error);
    next(error);
  }
};

/**
 * @desc    Get user connections
 * @route   GET /api/connections
 * @access  Private
 */
const getUserConnections = async (req, res, next) => {
  try {
    const { status = "accepted", page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    const query = {
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status,
    };

    const skip = (page - 1) * limit;

    const connections = await Connection.find(query)
      .populate([
        {
          path: "requester",
          select: "fullName profileImage title currentCompany location",
        },
        {
          path: "recipient",
          select: "fullName profileImage title currentCompany location",
        },
      ])
      .sort({ connectedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform data to show the "other" user
    const transformedConnections = connections.map((conn) => {
      const isRequester = conn.requesterId.toString() === userId;
      const otherUser = isRequester ? conn.recipient : conn.requester;

      return {
        ...conn.toObject(),
        connectedUser: otherUser,
        isRequester,
      };
    });

    // Get total count
    const total = await Connection.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transformedConnections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user connections error:", error);
    next(error);
  }
};

/**
 * @desc    Get pending connection requests
 * @route   GET /api/connections/requests
 * @access  Private
 */
const getPendingRequests = async (req, res, next) => {
  try {
    const { type = "received" } = req.query; // 'received' or 'sent'
    const userId = req.user.userId;

    let query;
    if (type === "received") {
      query = { recipientId: userId, status: "pending" };
    } else {
      query = { requesterId: userId, status: "pending" };
    }

    const requests = await Connection.find(query)
      .populate([
        {
          path: "requester",
          select: "fullName profileImage title currentCompany location",
        },
        {
          path: "recipient",
          select: "fullName profileImage title currentCompany location",
        },
      ])
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    next(error);
  }
};

/**
 * @desc    Remove connection
 * @route   DELETE /api/connections/:id
 * @access  Private
 */
const removeConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const connection = await Connection.findOne({
      _id: id,
      $or: [{ requesterId: userId }, { recipientId: userId }],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: "Connection not found",
      });
    }

    // Update user connection counts if connection was accepted
    if (connection.status === "accepted") {
      await User.updateMany(
        { _id: { $in: [connection.requesterId, connection.recipientId] } },
        { $inc: { totalConnections: -1 } }
      );
    }

    await Connection.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Remove connection error:", error);
    next(error);
  }
};

/**
 * @desc    Get mutual connections
 * @route   GET /api/connections/mutual/:userId
 * @access  Private
 */
const getMutualConnections = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.userId;

    // Get current user's connections
    const currentUserConnections = await Connection.find({
      $or: [{ requesterId: currentUserId }, { recipientId: currentUserId }],
      status: "accepted",
    });

    // Get target user's connections
    const targetUserConnections = await Connection.find({
      $or: [{ requesterId: targetUserId }, { recipientId: targetUserId }],
      status: "accepted",
    });

    // Find mutual connections
    const currentUserConnectionIds = new Set();
    currentUserConnections.forEach((conn) => {
      const otherId =
        conn.requesterId.toString() === currentUserId
          ? conn.recipientId.toString()
          : conn.requesterId.toString();
      currentUserConnectionIds.add(otherId);
    });

    const mutualConnectionIds = [];
    targetUserConnections.forEach((conn) => {
      const otherId =
        conn.requesterId.toString() === targetUserId
          ? conn.recipientId.toString()
          : conn.requesterId.toString();
      if (currentUserConnectionIds.has(otherId)) {
        mutualConnectionIds.push(otherId);
      }
    });

    // Get mutual connection user details
    const mutualConnections = await User.find({
      _id: { $in: mutualConnectionIds },
    }).select("fullName profileImage title currentCompany");

    res.status(200).json({
      success: true,
      data: mutualConnections,
      count: mutualConnections.length,
    });
  } catch (error) {
    console.error("Get mutual connections error:", error);
    next(error);
  }
};

module.exports = {
  sendConnectionRequest,
  respondToConnection,
  getUserConnections,
  getPendingRequests,
  removeConnection,
  getMutualConnections,
};
