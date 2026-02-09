import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { hashToken } from '../utils/helpers.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password -refreshTokens');

    if (!user) {
      throw ApiError.unauthorized('The user belonging to this token no longer exists.');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw ApiError.unauthorized('Your account has been deactivated. Please contact support.');
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        throw ApiError.unauthorized('Password was recently changed. Please log in again.');
      }
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token. Please log in again.');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Your session has expired. Please log in again.');
    }
    throw error;
  }
});

/**
 * Optional authentication - doesn't throw error if no token
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch (error) {
      // Silently ignore token errors for optional auth
    }
  }

  next();
});

/**
 * Verify refresh token
 */
export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.badRequest('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Check if refresh token exists in user's tokens
    const hashedToken = hashToken(refreshToken);
    const tokenExists = user.refreshTokens.find(
      (t) => t.token === hashedToken && t.expires > Date.now()
    );

    if (!tokenExists) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Attach user to request
    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
    throw error;
  }
});