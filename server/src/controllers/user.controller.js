import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse, getSortOption, buildSearchQuery } from '../utils/pagination.js';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSortOption(req.query.sortBy, req.query.sortOrder);
  
  const filter = {};
  
  if (req.query.role) {
    filter.role = req.query.role;
  }
  
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  
  if (req.query.search) {
    const searchQuery = buildSearchQuery(req.query.search, ['name', 'email']);
    Object.assign(filter, searchQuery);
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name'),
    User.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, users, paginationResponse(total, page, limit));
});

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('createdBy', 'name');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return ApiResponse.success(res, user);
});

/**
 * @desc    Create user
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  const user = await User.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'user',
    moduleId: user._id,
    description: `Created user: ${user.name}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return ApiResponse.created(res, userResponse, 'User created successfully');
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent updating super_admin by non-super_admin
  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    throw ApiError.forbidden('Cannot modify super admin');
  }

  // Don't allow password update through this route
  delete req.body.password;

  const oldData = user.toObject();

  user = await User.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  ).select('-password');

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'user',
    moduleId: user._id,
    description: `Updated user: ${user.name}`,
    changes: { before: oldData, after: user.toObject() },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, user, 'User updated successfully');
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'super_admin') {
    throw ApiError.forbidden('Cannot delete super admin');
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.forbidden('Cannot delete your own account');
  }

  await user.deleteOne();

  await ActivityLog.log({
    user: req.user._id,
    action: 'delete',
    module: 'user',
    moduleId: user._id,
    description: `Deleted user: ${user.name}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'User deleted successfully');
});

/**
 * @desc    Toggle user status
 * @route   PATCH /api/v1/users/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'super_admin') {
    throw ApiError.forbidden('Cannot deactivate super admin');
  }

  user.isActive = !user.isActive;
  await user.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'user',
    moduleId: user._id,
    description: `${user.isActive ? 'Activated' : 'Deactivated'} user: ${user.name}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, user, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
});

/**
 * @desc    Update user permissions
 * @route   PUT /api/v1/users/:id/permissions
 * @access  Private/Admin
 */
export const updatePermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'super_admin') {
    throw ApiError.forbidden('Cannot modify super admin permissions');
  }

  user.permissions = permissions;
  await user.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'user',
    moduleId: user._id,
    description: `Updated permissions for user: ${user.name}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, user, 'Permissions updated successfully');
});

/**
 * @desc    Reset user password
 * @route   POST /api/v1/users/:id/reset-password
 * @access  Private/Admin
 */
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    throw ApiError.forbidden('Cannot reset super admin password');
  }

  user.password = newPassword;
  await user.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'user',
    moduleId: user._id,
    description: `Reset password for user: ${user.name}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Password reset successfully');
});

/**
 * @desc    Get user activity logs
 * @route   GET /api/v1/users/:id/activity
 * @access  Private/Admin
 */
export const getUserActivity = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [activities, total] = await Promise.all([
    ActivityLog.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments({ user: req.params.id }),
  ]);

  return ApiResponse.paginated(res, activities, paginationResponse(total, page, limit));
});