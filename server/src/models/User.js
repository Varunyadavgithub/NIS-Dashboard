import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ROLES } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s-]{10,15}$/, "Please provide a valid phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: "Invalid role",
      },
      default: ROLES.STAFF,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLoginIp: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    refreshTokens: [
      {
        token: String,
        expires: Date,
        userAgent: String,
        ip: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "Asia/Kolkata" },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware - hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d" },
  );

  return refreshToken;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

// Clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function () {
  this.refreshTokens = this.refreshTokens.filter(
    (token) => token.expires > Date.now(),
  );
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select("+password");
  if (!user) return null;

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return null;

  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
