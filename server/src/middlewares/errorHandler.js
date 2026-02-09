import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error
  logger.error(`${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
    stack: err.stack,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = ApiError.badRequest(message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value '${value}' entered for '${field}' field`;
    error = ApiError.conflict(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Your session has expired. Please log in again.');
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ApiError.badRequest('File size too large');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = ApiError.badRequest('Too many files');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = ApiError.badRequest(`Unexpected file field: ${err.field}`);
  }

  // Syntax error (invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Invalid JSON in request body');
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const status = error.status || 'error';
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    status,
    message,
    ...(error.errors?.length && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

export default errorHandler;