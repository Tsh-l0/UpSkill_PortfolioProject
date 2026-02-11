const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");

const express = require("express");
const { loginUser, registerUser } = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const User = require("../models/User"); // pointing to User model

const router = express.Router();

router.post(
  "/signup",
  [
    body("username").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").notEmpty().withMessage("Role is required"),
  ],
  validateRequest,
  registerUser
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  loginUser
);

// ✅ Protected route to get the authenticated user's info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.sendStatus(404);
    res.json(user);
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;

