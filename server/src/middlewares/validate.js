import { validationResult, matchedData } from 'express-validator';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

/**
 * Validation middleware for express-validator
 * @param {Array} validations - Array of express-validator validations
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Attach only validated data to request
      req.validatedData = matchedData(req);
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw ApiError.badRequest('Validation failed', extractedErrors);
  };
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      throw ApiError.badRequest(`${paramName} is required`);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(`Invalid ${paramName} format`);
    }

    next();
  };
};

/**
 * Validate multiple ObjectIds
 */
export const validateObjectIds = (...paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName] || req.body[paramName];
      
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.badRequest(`Invalid ${paramName} format`);
      }
    }
    next();
  };
};

/**
 * Validate date range
 */
export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      throw ApiError.badRequest('Invalid start date format');
    }

    if (isNaN(end.getTime())) {
      throw ApiError.badRequest('Invalid end date format');
    }

    if (start > end) {
      throw ApiError.badRequest('Start date cannot be after end date');
    }
  }

  next();
};

/**
 * Sanitize request body - remove unwanted fields
 */
export const sanitizeBody = (...allowedFields) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      const sanitized = {};
      
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          sanitized[field] = req.body[field];
        }
      });

      req.body = sanitized;
    }
    next();
  };
};

export default validate;