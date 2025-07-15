const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// ===== JWT UTILITY FUNCTIONS =====
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );

  return { accessToken, refreshToken };
};

const sanitizeUser = (user) => {
  const userObj = user.toObject();

  // Remove sensitive fields
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.passwordResetToken;
  delete userObj.__v;

  // Add computed fields for frontend compatibility
  return {
    ...userObj,
    id: userObj._id, // Frontend expects 'id' not '_id'
    name: userObj.fullName, // Frontend expects 'name'
    profileCompletionScore: userObj.profileCompletionScore || 0,
  };
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const registerUser = async (req, res, next) => {
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

    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Create new user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: role || "learner",
      joinDate: new Date(),
      profileCompletionScore: 0,
    });

    // Generate tokens
    const { accessToken } = generateTokens(user._id);

    // Prepare response data
    const userData = sanitizeUser(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userData,
      token: accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: `${field} already exists`,
      });
    }

    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
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

    const { email, password } = req.body;

    // Find user and include password for verification
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const { accessToken } = generateTokens(user._id);

    // Prepare response data
    const userData = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
      token: accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update activity
    await user.updateActivity();

    const userData = sanitizeUser(user);

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res, next) => {
  try {
    // In a more sophisticated setup, you'd blacklist the token here
    // For now, we'll just respond successfully

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        error: "Invalid token type",
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "User not found or inactive",
      });
    }

    // Generate new access token
    const { accessToken } = generateTokens(user._id);

    res.status(200).json({
      success: true,
      token: accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired refresh token",
      });
    }

    next(error);
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validation
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Token, password, and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    // Hash the token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastActiveAt = new Date();
    await user.save();

    // Generate new tokens
    const { accessToken } = generateTokens(user._id);

    const userData = sanitizeUser(user);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      user: userData,
      token: accessToken,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
};

/**
 * @desc    Change password (authenticated user)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    user.lastActiveAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};

/**
 * @desc    Verify JWT token
 * @route   GET /api/auth/verify
 * @access  Private
 */
const verifyToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: "User not found or inactive",
      });
    }

    const userData = sanitizeUser(user);

    res.status(200).json({
      success: true,
      valid: true,
      user: userData,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyToken,
};
