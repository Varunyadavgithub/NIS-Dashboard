import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  handler: (req, res, next, options) => {
    throw ApiError.tooManyRequests(options.message.message);
  },
});

// Strict limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    throw ApiError.tooManyRequests(options.message.message);
  },
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: {
    status: 'error',
    message: 'Too many password reset requests. Please try again after an hour.',
  },
  handler: (req, res, next, options) => {
    throw ApiError.tooManyRequests(options.message.message);
  },
});

// Account creation limiter
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 accounts per hour per IP
  message: {
    status: 'error',
    message: 'Too many accounts created from this IP. Please try again after an hour.',
  },
  handler: (req, res, next, options) => {
    throw ApiError.tooManyRequests(options.message.message);
  },
});

// File upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    status: 'error',
    message: 'Too many file uploads. Please try again later.',
  },
  handler: (req, res, next, options) => {
    throw ApiError.tooManyRequests(options.message.message);
  },
});

// Export limiter
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 exports per hour
  message: {
    status: 'error',
    message: 'Too many export requests. Please try again later.',
  },
  handler: (req, res, next, options) => {
    throw ApiError.tooManyRequests(options.message.message);
  },
});