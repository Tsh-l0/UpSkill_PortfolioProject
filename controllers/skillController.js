const Skill = require("../models/Skill");
const UserSkill = require("../models/UserSkill");
const { validationResult } = require("express-validator");

/**
 * @desc    Get all skills
 * @route   GET /api/skills
 * @access  Public
 */
const getAllSkills = async (req, res, next) => {
  try {
    const {
      category,
      search,
      featured,
      page = 1,
      limit = 50,
      sortBy = "usageCount",
    } = req.query;

    // Build query
    const query = { isActive: true, moderationStatus: "approved" };

    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;
    if (search) query.$text = { $search: search };

    // Sort options
    const sortOptions = {
      usageCount: { usageCount: -1, name: 1 },
      name: { name: 1 },
      trending: { trendScore: -1, usageCount: -1 },
      newest: { createdAt: -1 },
    };

    const sort = sortOptions[sortBy] || sortOptions.usageCount;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const skills = await Skill.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Skill.countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: skills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all skills error:", error);
    next(error);
  }
};

/**
 * @desc    Get trending skills
 * @route   GET /api/skills/trending
 * @access  Public
 */
const getTrendingSkills = async (req, res, next) => {
  try {
    const { limit = 10, days = 30 } = req.query;

    const skills = await Skill.getTrendingSkills(parseInt(limit));

    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error("Get trending skills error:", error);
    next(error);
  }
};

/**
 * @desc    Get skill categories
 * @route   GET /api/skills/categories
 * @access  Public
 */
const getSkillCategories = async (req, res, next) => {
  try {
    const categories = await Skill.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgUsage: { $avg: "$usageCount" },
          featured: { $sum: { $cond: ["$isFeatured", 1, 0] } },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          avgUsage: { $round: ["$avgUsage", 0] },
          featured: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get skill categories error:", error);
    next(error);
  }
};

/**
 * @desc    Create new skill (Admin only)
 * @route   POST /api/skills
 * @access  Private (Admin)
 */
const createSkill = async (req, res, next) => {
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

    const skillData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const skill = await Skill.create(skillData);

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Create skill error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Skill already exists",
      });
    }

    next(error);
  }
};

/**
 * @desc    Update skill (Admin only)
 * @route   PUT /api/skills/:id
 * @access  Private (Admin)
 */
const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove protected fields
    delete updateData.usageCount;
    delete updateData.createdBy;

    const skill = await Skill.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Update skill error:", error);
    next(error);
  }
};

/**
 * @desc    Search skills
 * @route   GET /api/skills/search
 * @access  Public
 */
const searchSkills = async (req, res, next) => {
  try {
    const { q, category, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const skills = await Skill.searchSkills(q, category).limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error("Search skills error:", error);
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getTrendingSkills,
  getSkillCategories,
  createSkill,
  updateSkill,
  searchSkills,
};
