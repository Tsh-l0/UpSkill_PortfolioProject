const Endorsement = require("../models/Endorsement");
const UserSkill = require("../models/UserSkill");
const User = require("../models/User");
const { validationResult } = require("express-validator");

/**
 * @desc    Create endorsement
 * @route   POST /api/endorsements
 * @access  Private
 */
const createEndorsement = async (req, res, next) => {
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

    const {
      endorseeId,
      skillId,
      userSkillId,
      rating,
      comment,
      relationship,
      workContext,
    } = req.body;
    const endorserId = req.user.userId;

    // Prevent self-endorsement
    if (endorserId === endorseeId) {
      return res.status(400).json({
        success: false,
        error: "You cannot endorse yourself",
      });
    }

    // Check if endorsee exists and allows endorsements
    const endorsee = await User.findById(endorseeId);
    if (!endorsee) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!endorsee.allowEndorsements) {
      return res.status(403).json({
        success: false,
        error: "This user does not accept endorsements",
      });
    }

    // Check if UserSkill exists
    const userSkill = await UserSkill.findOne({
      _id: userSkillId,
      userId: endorseeId,
      skillId: skillId,
    });

    if (!userSkill) {
      return res.status(404).json({
        success: false,
        error: "User skill not found",
      });
    }

    // Check for duplicate endorsement
    const existingEndorsement = await Endorsement.findOne({
      endorserId,
      userSkillId,
    });

    if (existingEndorsement) {
      return res.status(409).json({
        success: false,
        error: "You have already endorsed this skill for this user",
      });
    }

    // Create endorsement
    const endorsement = await Endorsement.create({
      endorserId,
      endorseeId,
      skillId,
      userSkillId,
      rating,
      comment,
      relationship,
      workContext,
    });

    // Populate endorsement data
    await endorsement.populate([
      {
        path: "endorser",
        select: "fullName profileImage title currentCompany",
      },
      { path: "skill", select: "name icon category" },
    ]);

    res.status(201).json({
      success: true,
      message: "Endorsement created successfully",
      data: endorsement,
    });
  } catch (error) {
    console.error("Create endorsement error:", error);
    next(error);
  }
};

/**
 * @desc    Get endorsements received by user
 * @route   GET /api/endorsements/received
 * @access  Private
 */
const getReceivedEndorsements = async (req, res, next) => {
  try {
    const { skillId, page = 1, limit = 10, sortBy = "recent" } = req.query;
    const userId = req.user.userId;

    const endorsements = await Endorsement.getEndorsementsForUser(userId, {
      skillId,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
    });

    // Get total count
    const query = {
      endorseeId: userId,
      isPublic: true,
      moderationStatus: "approved",
    };
    if (skillId) query.skillId = skillId;
    const total = await Endorsement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: endorsements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get received endorsements error:", error);
    next(error);
  }
};

/**
 * @desc    Get endorsements given by user
 * @route   GET /api/endorsements/given
 * @access  Private
 */
const getGivenEndorsements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    const endorsements = await Endorsement.getEndorsementsGivenByUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    // Get total count
    const total = await Endorsement.countDocuments({
      endorserId: userId,
      isPublic: true,
      moderationStatus: "approved",
    });

    res.status(200).json({
      success: true,
      data: endorsements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get given endorsements error:", error);
    next(error);
  }
};

/**
 * @desc    Update endorsement
 * @route   PUT /api/endorsements/:id
 * @access  Private
 */
const updateEndorsement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, relationship } = req.body;
    const userId = req.user.userId;

    const endorsement = await Endorsement.findOne({
      _id: id,
      endorserId: userId,
    });

    if (!endorsement) {
      return res.status(404).json({
        success: false,
        error:
          "Endorsement not found or you don't have permission to update it",
      });
    }

    // Update allowed fields
    if (rating) endorsement.rating = rating;
    if (comment !== undefined) endorsement.comment = comment;
    if (relationship) endorsement.relationship = relationship;

    await endorsement.save();

    await endorsement.populate([
      {
        path: "endorser",
        select: "fullName profileImage title currentCompany",
      },
      { path: "skill", select: "name icon category" },
    ]);

    res.status(200).json({
      success: true,
      message: "Endorsement updated successfully",
      data: endorsement,
    });
  } catch (error) {
    console.error("Update endorsement error:", error);
    next(error);
  }
};

/**
 * @desc    Delete endorsement
 * @route   DELETE /api/endorsements/:id
 * @access  Private
 */
const deleteEndorsement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const endorsement = await Endorsement.findOne({
      _id: id,
      endorserId: userId,
    });

    if (!endorsement) {
      return res.status(404).json({
        success: false,
        error:
          "Endorsement not found or you don't have permission to delete it",
      });
    }

    await Endorsement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Endorsement deleted successfully",
    });
  } catch (error) {
    console.error("Delete endorsement error:", error);
    next(error);
  }
};

/**
 * @desc    Get endorsement statistics for user
 * @route   GET /api/endorsements/stats
 * @access  Private
 */
const getEndorsementStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [stats, topSkills] = await Promise.all([
      Endorsement.getEndorsementStats(userId),
      Endorsement.getTopEndorsedSkills(userId, 5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {},
        topSkills,
      },
    });
  } catch (error) {
    console.error("Get endorsement stats error:", error);
    next(error);
  }
};

module.exports = {
  createEndorsement,
  getReceivedEndorsements,
  getGivenEndorsements,
  updateEndorsement,
  deleteEndorsement,
  getEndorsementStats,
};
