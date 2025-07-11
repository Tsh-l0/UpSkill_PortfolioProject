const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const User = require("../models/User");

// 🧠 Authenticated user info
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🛡 Admin-only route
router.get("/admin-only", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: `Hello Admin ${req.user.userId}, welcome to the command deck 👨🏽‍✈️`,
  });
});

module.exports = router;

