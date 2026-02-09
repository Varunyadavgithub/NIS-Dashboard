import Settings from '../models/Settings.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all settings
 * @route   GET /api/v1/settings
 * @access  Private
 */
export const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getAll();

  // Group by category
  const grouped = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  return ApiResponse.success(res, grouped);
});

/**
 * @desc    Get settings by category
 * @route   GET /api/v1/settings/category/:category
 * @access  Private
 */
export const getSettingsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const settings = await Settings.getByCategory(category);
  return ApiResponse.success(res, settings);
});

/**
 * @desc    Get single setting
 * @route   GET /api/v1/settings/:key
 * @access  Private
 */
export const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const setting = await Settings.findOne({ key });

  if (!setting) {
    throw ApiError.notFound('Setting not found');
  }

  return ApiResponse.success(res, setting);
});

/**
 * @desc    Update setting
 * @route   PUT /api/v1/settings/:key
 * @access  Private/Admin
 */
export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const setting = await Settings.findOne({ key });

  if (!setting) {
    throw ApiError.notFound('Setting not found');
  }

  if (!setting.isEditable) {
    throw ApiError.badRequest('This setting cannot be modified');
  }

  const oldValue = setting.value;
  setting.value = value;
  setting.updatedBy = req.user._id;
  await setting.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'settings',
    description: `Updated setting: ${key}`,
    changes: { before: { value: oldValue }, after: { value } },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, setting, 'Setting updated successfully');
});

/**
 * @desc    Bulk update settings
 * @route   PUT /api/v1/settings
 * @access  Private/Admin
 */
export const bulkUpdateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  if (!Array.isArray(settings) || settings.length === 0) {
    throw ApiError.badRequest('Please provide settings to update');
  }

  // Validate all settings exist and are editable
  for (const { key } of settings) {
    const existing = await Settings.findOne({ key });
    if (!existing) {
      throw ApiError.notFound(`Setting '${key}' not found`);
    }
    if (!existing.isEditable) {
      throw ApiError.badRequest(`Setting '${key}' cannot be modified`);
    }
  }

  await Settings.bulkUpdate(settings, req.user._id);

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'settings',
    description: `Bulk updated ${settings.length} settings`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Settings updated successfully');
});

/**
 * @desc    Create setting
 * @route   POST /api/v1/settings
 * @access  Private/Admin
 */
export const createSetting = asyncHandler(async (req, res) => {
  const { key, value, category, description, isEditable } = req.body;

  const existing = await Settings.findOne({ key });
  if (existing) {
    throw ApiError.conflict('Setting with this key already exists');
  }

  const setting = await Settings.create({
    key,
    value,
    category,
    description,
    isEditable: isEditable !== false,
    updatedBy: req.user._id,
  });

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'settings',
    description: `Created setting: ${key}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.created(res, setting, 'Setting created successfully');
});

/**
 * @desc    Delete setting
 * @route   DELETE /api/v1/settings/:key
 * @access  Private/Admin
 */
export const deleteSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await Settings.findOne({ key });

  if (!setting) {
    throw ApiError.notFound('Setting not found');
  }

  if (!setting.isEditable) {
    throw ApiError.badRequest('This setting cannot be deleted');
  }

  await setting.deleteOne();

  await ActivityLog.log({
    user: req.user._id,
    action: 'delete',
    module: 'settings',
    description: `Deleted setting: ${key}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Setting deleted successfully');
});

/**
 * @desc    Initialize default settings
 * @route   POST /api/v1/settings/initialize
 * @access  Private/Admin
 */
export const initializeSettings = asyncHandler(async (req, res) => {
  const count = await Settings.initializeDefaults();

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'settings',
    description: `Initialized ${count} default settings`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, { count }, 'Default settings initialized');
});

/**
 * @desc    Get company settings
 * @route   GET /api/v1/settings/company
 * @access  Private
 */
export const getCompanySettings = asyncHandler(async (req, res) => {
  const keys = [
    'company_name',
    'company_address',
    'company_phone',
    'company_email',
    'company_gst',
    'company_pan',
    'company_logo',
  ];

  const settings = {};
  for (const key of keys) {
    settings[key.replace('company_', '')] = await Settings.get(key, '');
  }

  return ApiResponse.success(res, settings);
});

/**
 * @desc    Update company settings
 * @route   PUT /api/v1/settings/company
 * @access  Private/Admin
 */
export const updateCompanySettings = asyncHandler(async (req, res) => {
  const { name, address, phone, email, gst, pan, logo } = req.body;

  const updates = [
    { key: 'company_name', value: name },
    { key: 'company_address', value: address },
    { key: 'company_phone', value: phone },
    { key: 'company_email', value: email },
    { key: 'company_gst', value: gst },
    { key: 'company_pan', value: pan },
    { key: 'company_logo', value: logo },
  ].filter(u => u.value !== undefined);

  await Settings.bulkUpdate(updates, req.user._id);

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'settings',
    description: 'Updated company settings',
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Company settings updated successfully');
});

/**
 * @desc    Get payroll settings
 * @route   GET /api/v1/settings/payroll
 * @access  Private
 */
export const getPayrollSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getByCategory('payroll');
  
  const result = {};
  settings.forEach(s => {
    result[s.key] = s.value;
  });

  return ApiResponse.success(res, result);
});

/**
 * @desc    Get attendance settings
 * @route   GET /api/v1/settings/attendance
 * @access  Private
 */
export const getAttendanceSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getByCategory('attendance');
  
  const result = {};
  settings.forEach(s => {
    result[s.key] = s.value;
  });

  return ApiResponse.success(res, result);
});