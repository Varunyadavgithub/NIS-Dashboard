import crypto from "crypto";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Private (Admin)
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("User with this email already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    createdBy: req.user?._id,
  });

  // Log activity
  await ActivityLog.log({
    user: req.user?._id || user._id,
    action: "create",
    module: "user",
    moduleId: user._id,
    description: `User ${user.name} registered`,
    metadata: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return ApiResponse.created(res, userResponse, "User registered successfully");
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // Log failed attempt
    await ActivityLog.log({
      user: user._id,
      action: "login",
      module: "user",
      moduleId: user._id,
      description: `Failed login attempt for ${user.email}`,
      status: "failure",
      metadata: {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    throw ApiError.unauthorized("Invalid credentials");
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.unauthorized("Your account has been deactivated");
  }

  // Generate token
  const token = user.generateAuthToken();

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Log successful login
  await ActivityLog.log({
    user: user._id,
    action: "login",
    module: "user",
    moduleId: user._id,
    description: `User ${user.name} logged in`,
    metadata: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return ApiResponse.success(
    res,
    {
      user: userResponse,
      token,
    },
    "Login successful",
  );
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return ApiResponse.success(res, user);
});

/**
 * @desc    Update profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, avatar },
    { new: true, runValidators: true },
  );

  return ApiResponse.success(res, user, "Profile updated successfully");
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Log activity
  await ActivityLog.log({
    user: user._id,
    action: "update",
    module: "user",
    moduleId: user._id,
    description: "Password changed",
    metadata: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  });

  // Generate new token
  const token = user.generateAuthToken();

  return ApiResponse.success(res, { token }, "Password changed successfully");
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists
    return ApiResponse.success(
      res,
      null,
      "If email exists, reset instructions will be sent",
    );
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - Neha Industrial Security",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return ApiResponse.success(res, null, "Password reset email sent");
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw ApiError.internal("Email could not be sent");
  }
});

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest("Invalid or expired reset token");
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log activity
  await ActivityLog.log({
    user: user._id,
    action: "update",
    module: "user",
    moduleId: user._id,
    description: "Password reset via email link",
    metadata: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  });

  // Generate new token
  const authToken = user.generateAuthToken();

  return ApiResponse.success(
    res,
    { token: authToken },
    "Password reset successful",
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Log activity
  await ActivityLog.log({
    user: req.user._id,
    action: "logout",
    module: "user",
    moduleId: req.user._id,
    description: `User ${req.user.name} logged out`,
    metadata: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  });

  return ApiResponse.success(res, null, "Logged out successfully");
});
