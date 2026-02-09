import { PAGINATION } from '../config/constants.js';

/**
 * Build pagination object for mongoose queries
 * @param {Object} query - Request query object
 * @returns {Object} Pagination config
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build pagination response
 * @param {number} total - Total documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination response
 */
export const paginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

/**
 * Build sort object for mongoose
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order (asc/desc)
 * @returns {Object} Sort object
 */
export const getSortOption = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  return { [sortBy]: order };
};

/**
 * Build filter object from query params
 * @param {Object} query - Query params
 * @param {Array} allowedFields - Allowed filter fields
 * @returns {Object} Filter object
 */
export const buildFilter = (query, allowedFields = []) => {
  const filter = {};
  
  for (const field of allowedFields) {
    if (query[field] !== undefined && query[field] !== '') {
      filter[field] = query[field];
    }
  }
  
  return filter;
};

/**
 * Build search query for text fields
 * @param {string} search - Search term
 * @param {Array} fields - Fields to search
 * @returns {Object} Search query
 */
export const buildSearchQuery = (search, fields = []) => {
  if (!search || !fields.length) return {};
  
  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: 'i' },
    })),
  };
};