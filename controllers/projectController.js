const Project = require("../models/Project");
const User = require("../models/User");
const { validationResult } = require("express-validator");

/**
 * @desc    Get user projects
 * @route   GET /api/projects
 * @access  Private
 */
const getUserProjects = async (req, res, next) => {
  try {
    const { userId, category, status, featured } = req.query;
    const targetUserId = userId || req.user.userId;

    // Build query
    const query = { userId: targetUserId };

    // If viewing another user's projects, only show public ones
    if (targetUserId !== req.user.userId) {
      const user = await User.findById(targetUserId);
      if (!user || !user.isProfilePublic) {
        return res.status(403).json({
          success: false,
          error: "This profile is private",
        });
      }
      query.isPublic = true;
    }

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured === "true") query.isFeatured = true;

    const projects = await Project.find(query)
      .sort({ isFeatured: -1, completionDate: -1, createdAt: -1 })
      .populate("collaborators.userId", "fullName profileImage");

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get user projects error:", error);
    next(error);
  }
};

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate([
      { path: "userId", select: "fullName profileImage title" },
      { path: "collaborators.userId", select: "fullName profileImage title" },
    ]);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Check if project is public or user is owner
    if (
      !project.isPublic &&
      project.userId._id.toString() !== req.user?.userId
    ) {
      return res.status(403).json({
        success: false,
        error: "This project is private",
      });
    }

    // Increment view count if viewing someone else's project
    if (project.userId._id.toString() !== req.user?.userId) {
      project.viewCount += 1;
      await project.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project by ID error:", error);
    next(error);
  }
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
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

    const projectData = {
      ...req.body,
      userId: req.user.userId,
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOne({ _id: id, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found or you don't have permission to update it",
      });
    }

    // Remove protected fields
    delete req.body.viewCount;
    delete req.body.likeCount;
    delete req.body.starCount;

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        project[key] = req.body[key];
      }
    });

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOneAndDelete({ _id: id, userId });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    next(error);
  }
};

/**
 * @desc    Like/unlike project
 * @route   POST /api/projects/:id/like
 * @access  Private
 */
const toggleProjectLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (!project.isPublic) {
      return res.status(403).json({
        success: false,
        error: "Cannot like a private project",
      });
    }

    // Toggle like (implement like tracking in a separate collection if needed)
    project.likeCount += 1;
    await project.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Project liked successfully",
      data: { likeCount: project.likeCount },
    });
  } catch (error) {
    console.error("Toggle project like error:", error);
    next(error);
  }
};

module.exports = {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectLike,
};
