const Experience = require("../models/Experience");
const { validationResult } = require("express-validator");

/**
 * @desc    Get user experiences
 * @route   GET /api/experience
 * @access  Private
 */
const getUserExperiences = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user.userId;

    // If viewing another user's experiences, check if profile is public
    if (targetUserId !== req.user.userId) {
      const user = await User.findById(targetUserId);
      if (!user || !user.isProfilePublic) {
        return res.status(403).json({
          success: false,
          error: "This profile is private",
        });
      }
    }

    const experiences = await Experience.find({
      userId: targetUserId,
      isVisible: true,
    })
      .sort({ isCurrent: -1, startDate: -1 })
      .populate("skills.skillId", "name icon category");

    res.status(200).json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    console.error("Get user experiences error:", error);
    next(error);
  }
};

/**
 * @desc    Create new experience
 * @route   POST /api/experience
 * @access  Private
 */
const createExperience = async (req, res, next) => {
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

    const experienceData = {
      ...req.body,
      userId: req.user.userId,
    };

    const experience = await Experience.create(experienceData);

    res.status(201).json({
      success: true,
      message: "Experience created successfully",
      data: experience,
    });
  } catch (error) {
    console.error("Create experience error:", error);
    next(error);
  }
};

/**
 * @desc    Update experience
 * @route   PUT /api/experience/:id
 * @access  Private
 */
const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const experience = await Experience.findOne({ _id: id, userId });

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: "Experience not found or you don't have permission to update it",
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        experience[key] = req.body[key];
      }
    });

    await experience.save();

    res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: experience,
    });
  } catch (error) {
    console.error("Update experience error:", error);
    next(error);
  }
};

/**
 * @desc    Delete experience
 * @route   DELETE /api/experience/:id
 * @access  Private
 */
const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const experience = await Experience.findOneAndDelete({ _id: id, userId });

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: "Experience not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error) {
    console.error("Delete experience error:", error);
    next(error);
  }
};

module.exports = {
  getUserExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};
