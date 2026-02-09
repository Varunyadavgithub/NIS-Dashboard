/**
 * Async handler wrapper to catch errors in async functions
 * Eliminates the need for try-catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;