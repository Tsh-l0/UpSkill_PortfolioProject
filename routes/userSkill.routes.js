const express = require("express");
const { body, query, param } = require("express-validator");
const UserSkill = require("../models/UserSkill");
const { verifyToken } = require("../middlewares/auth.middleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

/**
 * @desc    Get user skills
 * @route   GET /api/users/:userId/skills
 * @access  Private
 */
router.get(
  "/:userId/skills",
  verifyToken,
  [
    param("userId").isMongoId().withMessage("Invalid user ID"),
    query("category")
      .optional()
      .isIn([
        "frontend",
        "backend",
        "mobile",
        "devops",
        "database",
        "design",
        "management",
        "data",
        "other",
      ])
      .withMessage("Invalid category"),
    query("proficiency")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Invalid proficiency"),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { category, proficiency } = req.query;

      // Build query
      const query = { userId, isVisible: true };
      if (category) query["skill.category"] = category;
      if (proficiency) query.proficiencyLevel = proficiency;

      const skills = await UserSkill.find({ userId, isVisible: true })
        .populate("skillId", "name icon category description")
        .sort({ isFeatured: -1, endorsementCount: -1, proficiencyLevel: -1 });

      res.json({
        success: true,
        data: skills,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @desc    Add skill to user
 * @route   POST /api/users/skills
 * @access  Private
 */
router.post(
  "/skills",
  verifyToken,
  [
    body("skillId").isMongoId().withMessage("Valid skill ID required"),
    body("proficiencyLevel")
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Valid proficiency required"),
    body("yearsOfExperience")
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage("Years must be 0-50"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description too long"),
    body("isVisible")
      .optional()
      .isBoolean()
      .withMessage("Visibility must be boolean"),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const {
        skillId,
        proficiencyLevel,
        yearsOfExperience,
        description,
        isVisible = true,
      } = req.body;
      const userId = req.user.userId;

      // Check if user already has this skill
      const existingSkill = await UserSkill.findOne({ userId, skillId });
      if (existingSkill) {
        return res.status(409).json({
          success: false,
          error: "You already have this skill in your profile",
        });
      }

      const userSkill = await UserSkill.create({
        userId,
        skillId,
        proficiencyLevel,
        yearsOfExperience: yearsOfExperience || 0,
        description,
        isVisible,
      });

      await userSkill.populate("skillId", "name icon category");

      res.status(201).json({
        success: true,
        message: "Skill added successfully",
        data: userSkill,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @desc    Update user skill
 * @route   PUT /api/users/skills/:id
 * @access  Private
 */
router.put(
  "/skills/:id",
  verifyToken,
  [
    param("id").isMongoId().withMessage("Invalid skill ID"),
    body("proficiencyLevel")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Invalid proficiency"),
    body("yearsOfExperience")
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage("Years must be 0-50"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description too long"),
    body("isVisible")
      .optional()
      .isBoolean()
      .withMessage("Visibility must be boolean"),
    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be boolean"),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const updateData = req.body;

      const userSkill = await UserSkill.findOne({ _id: id, userId });
      if (!userSkill) {
        return res.status(404).json({
          success: false,
          error: "Skill not found",
        });
      }

      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          userSkill[key] = updateData[key];
        }
      });

      await userSkill.save();
      await userSkill.populate("skillId", "name icon category");

      res.json({
        success: true,
        message: "Skill updated successfully",
        data: userSkill,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @desc    Remove user skill
 * @route   DELETE /api/users/skills/:id
 * @access  Private
 */
router.delete(
  "/skills/:id",
  verifyToken,
  [param("id").isMongoId().withMessage("Invalid skill ID")],
  validateRequest,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const userSkill = await UserSkill.findOneAndDelete({ _id: id, userId });
      if (!userSkill) {
        return res.status(404).json({
          success: false,
          error: "Skill not found",
        });
      }

      res.json({
        success: true,
        message: "Skill removed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
