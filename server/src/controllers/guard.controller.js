import Guard from '../models/Guard.js';
import Deployment from '../models/Deployment.js';
import Attendance from '../models/Attendance.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse, getSortOption, buildSearchQuery } from '../utils/pagination.js';
import { deleteFile } from '../services/fileService.js';

/**
 * @desc    Get all guards
 * @route   GET /api/v1/guards
 * @access  Private
 */
export const getGuards = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSortOption(req.query.sortBy, req.query.sortOrder);
  
  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.designation) {
    filter.designation = req.query.designation;
  }
  
  if (req.query.client) {
    filter['currentDeployment.client'] = req.query.client;
  }
  
  if (req.query.deployed === 'true') {
    filter['currentDeployment.client'] = { $ne: null };
  } else if (req.query.deployed === 'false') {
    filter['currentDeployment.client'] = null;
  }
  
  if (req.query.search) {
    const searchQuery = buildSearchQuery(req.query.search, ['firstName', 'lastName', 'guardId', 'phone']);
    Object.assign(filter, searchQuery);
  }

  const [guards, total] = await Promise.all([
    Guard.find(filter)
      .select('guardId firstName lastName phone designation status currentDeployment photo dateOfJoining')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('currentDeployment.client', 'clientId companyName'),
    Guard.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, guards, paginationResponse(total, page, limit));
});

/**
 * @desc    Get single guard
 * @route   GET /api/v1/guards/:id
 * @access  Private
 */
export const getGuard = asyncHandler(async (req, res) => {
  const guard = await Guard.findById(req.params.id)
    .populate('currentDeployment.client', 'clientId companyName contactPerson')
    .populate('reportingTo', 'guardId firstName lastName')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  return ApiResponse.success(res, guard);
});

/**
 * @desc    Create guard
 * @route   POST /api/v1/guards
 * @access  Private
 */
export const createGuard = asyncHandler(async (req, res) => {
  // Check for duplicate phone
  const existingGuard = await Guard.findOne({ phone: req.body.phone });
  if (existingGuard) {
    throw ApiError.conflict('Guard with this phone number already exists');
  }

  // Check for duplicate Aadhar
  if (req.body.documents?.aadhar?.number) {
    const aadharExists = await Guard.findOne({
      'documents.aadhar.number': req.body.documents.aadhar.number,
    });
    if (aadharExists) {
      throw ApiError.conflict('Guard with this Aadhar number already exists');
    }
  }

  const guard = await Guard.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'guard',
    moduleId: guard._id,
    description: `Created guard: ${guard.fullName} (${guard.guardId})`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.created(res, guard, 'Guard created successfully');
});

/**
 * @desc    Update guard
 * @route   PUT /api/v1/guards/:id
 * @access  Private
 */
export const updateGuard = asyncHandler(async (req, res) => {
  let guard = await Guard.findById(req.params.id);

  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  // Check for duplicate phone if changed
  if (req.body.phone && req.body.phone !== guard.phone) {
    const existingGuard = await Guard.findOne({ phone: req.body.phone });
    if (existingGuard) {
      throw ApiError.conflict('Guard with this phone number already exists');
    }
  }

  const oldData = guard.toObject();

  guard = await Guard.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  );

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'guard',
    moduleId: guard._id,
    description: `Updated guard: ${guard.fullName}`,
    changes: { before: oldData, after: guard.toObject() },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, guard, 'Guard updated successfully');
});

/**
 * @desc    Delete guard
 * @route   DELETE /api/v1/guards/:id
 * @access  Private
 */
export const deleteGuard = asyncHandler(async (req, res) => {
  const guard = await Guard.findById(req.params.id);

  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  // Check for active deployment
  const activeDeployment = await Deployment.findOne({
    guard: guard._id,
    status: 'active',
  });

  if (activeDeployment) {
    throw ApiError.badRequest('Cannot delete guard with active deployment');
  }

  // Delete associated photo if exists
  if (guard.photo) {
    await deleteFile(guard.photo);
  }

  await guard.deleteOne();

  await ActivityLog.log({
    user: req.user._id,
    action: 'delete',
    module: 'guard',
    moduleId: guard._id,
    description: `Deleted guard: ${guard.fullName} (${guard.guardId})`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Guard deleted successfully');
});

/**
 * @desc    Update guard status
 * @route   PATCH /api/v1/guards/:id/status
 * @access  Private
 */
export const updateGuardStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  const guard = await Guard.findById(req.params.id);

  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  // If terminating, end active deployment
  if (status === 'terminated' || status === 'inactive') {
    await Deployment.updateMany(
      { guard: guard._id, status: 'active' },
      {
        status: 'completed',
        'schedule.endDate': new Date(),
        'terminationDetails.date': new Date(),
        'terminationDetails.reason': `Guard status changed to ${status}`,
        updatedBy: req.user._id,
      }
    );

    // Clear current deployment
    guard.currentDeployment = {
      client: null,
      site: null,
      shift: null,
      deployedAt: null,
    };
  }

  guard.status = status;
  if (remarks) guard.remarks = remarks;
  if (status === 'terminated') guard.dateOfLeaving = new Date();
  guard.updatedBy = req.user._id;
  await guard.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'guard',
    moduleId: guard._id,
    description: `Changed guard status to ${status}: ${guard.fullName}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, guard, 'Guard status updated successfully');
});

/**
 * @desc    Upload guard photo
 * @route   POST /api/v1/guards/:id/photo
 * @access  Private
 */
export const uploadPhoto = asyncHandler(async (req, res) => {
  const guard = await Guard.findById(req.params.id);

  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  if (!req.file) {
    throw ApiError.badRequest('Please upload a file');
  }

  // Delete old photo if exists
  if (guard.photo) {
    await deleteFile(guard.photo);
  }

  guard.photo = req.file.path;
  guard.updatedBy = req.user._id;
  await guard.save();

  return ApiResponse.success(res, { photo: guard.photo }, 'Photo uploaded successfully');
});

/**
 * @desc    Upload guard document
 * @route   POST /api/v1/guards/:id/documents
 * @access  Private
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  const { documentType } = req.body;

  const guard = await Guard.findById(req.params.id);

  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  if (!req.file) {
    throw ApiError.badRequest('Please upload a file');
  }

  const validDocTypes = ['aadhar', 'pan', 'voterId', 'drivingLicense', 'passport'];
  if (!validDocTypes.includes(documentType)) {
    throw ApiError.badRequest('Invalid document type');
  }

  // Delete old document if exists
  if (guard.documents[documentType]?.file) {
    await deleteFile(guard.documents[documentType].file);
  }

  guard.documents[documentType] = {
    ...guard.documents[documentType],
    file: req.file.path,
  };
  guard.updatedBy = req.user._id;
  await guard.save();

  return ApiResponse.success(res, { document: guard.documents[documentType] }, 'Document uploaded successfully');
});

/**
 * @desc    Get guard attendance history
 * @route   GET /api/v1/guards/:id/attendance
 * @access  Private
 */
export const getGuardAttendance = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { month, year, startDate, endDate } = req.query;

  const filter = { guard: req.params.id };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  } else if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const [attendance, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('client', 'clientId companyName'),
    Attendance.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, attendance, paginationResponse(total, page, limit));
});

/**
 * @desc    Get guard deployment history
 * @route   GET /api/v1/guards/:id/deployments
 * @access  Private
 */
export const getGuardDeployments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [deployments, total] = await Promise.all([
    Deployment.find({ guard: req.params.id })
      .sort({ 'schedule.startDate': -1 })
      .skip(skip)
      .limit(limit)
      .populate('client', 'clientId companyName'),
    Deployment.countDocuments({ guard: req.params.id }),
  ]);

  return ApiResponse.paginated(res, deployments, paginationResponse(total, page, limit));
});

/**
 * @desc    Get available guards (not deployed)
 * @route   GET /api/v1/guards/available
 * @access  Private
 */
export const getAvailableGuards = asyncHandler(async (req, res) => {
  const guards = await Guard.find({
    status: 'active',
    'currentDeployment.client': null,
  }).select('guardId firstName lastName phone designation');

  return ApiResponse.success(res, guards);
});

/**
 * @desc    Get guards statistics
 * @route   GET /api/v1/guards/stats
 * @access  Private
 */
export const getGuardStats = asyncHandler(async (req, res) => {
  const stats = await Guard.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byDesignation: [
          { $group: { _id: '$designation', count: { $sum: 1 } } },
        ],
        deployed: [
          {
            $match: { 'currentDeployment.client': { $ne: null } },
          },
          { $count: 'count' },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const result = {
    total: stats[0].total[0]?.count || 0,
    deployed: stats[0].deployed[0]?.count || 0,
    available: (stats[0].total[0]?.count || 0) - (stats[0].deployed[0]?.count || 0),
    byStatus: stats[0].byStatus,
    byDesignation: stats[0].byDesignation,
  };

  return ApiResponse.success(res, result);
});

/**
 * @desc    Bulk import guards
 * @route   POST /api/v1/guards/import
 * @access  Private
 */
export const importGuards = asyncHandler(async (req, res) => {
  const { guards } = req.body;

  if (!guards || !Array.isArray(guards) || guards.length === 0) {
    throw ApiError.badRequest('Please provide guards data');
  }

  const results = {
    success: [],
    failed: [],
  };

  for (const guardData of guards) {
    try {
      // Check for duplicate
      const existing = await Guard.findOne({
        $or: [
          { phone: guardData.phone },
          { 'documents.aadhar.number': guardData.documents?.aadhar?.number },
        ],
      });

      if (existing) {
        results.failed.push({
          data: guardData,
          error: 'Duplicate phone or Aadhar number',
        });
        continue;
      }

      const guard = await Guard.create({
        ...guardData,
        createdBy: req.user._id,
      });

      results.success.push(guard);
    } catch (error) {
      results.failed.push({
        data: guardData,
        error: error.message,
      });
    }
  }

  await ActivityLog.log({
    user: req.user._id,
    action: 'import',
    module: 'guard',
    description: `Imported ${results.success.length} guards, ${results.failed.length} failed`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, results, `Imported ${results.success.length} guards`);
});