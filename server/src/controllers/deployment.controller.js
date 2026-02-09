import Deployment from '../models/Deployment.js';
import Guard from '../models/Guard.js';
import Client from '../models/Client.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse, getSortOption } from '../utils/pagination.js';

/**
 * @desc    Get all deployments
 * @route   GET /api/v1/deployments
 * @access  Private
 */
export const getDeployments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSortOption(req.query.sortBy, req.query.sortOrder);
  
  const filter = {};
  
  if (req.query.guard) filter.guard = req.query.guard;
  if (req.query.client) filter.client = req.query.client;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.shiftType) filter['shift.type'] = req.query.shiftType;

  const [deployments, total] = await Promise.all([
    Deployment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('guard', 'guardId firstName lastName phone')
      .populate('client', 'clientId companyName'),
    Deployment.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, deployments, paginationResponse(total, page, limit));
});

/**
 * @desc    Get single deployment
 * @route   GET /api/v1/deployments/:id
 * @access  Private
 */
export const getDeployment = asyncHandler(async (req, res) => {
  const deployment = await Deployment.findById(req.params.id)
    .populate('guard', 'guardId firstName lastName phone designation photo')
    .populate('client', 'clientId companyName contactPerson sites')
    .populate('reportingOfficer', 'guardId firstName lastName')
    .populate('createdBy', 'name')
    .populate('replacements.originalGuard', 'guardId firstName lastName')
    .populate('replacements.replacementGuard', 'guardId firstName lastName');

  if (!deployment) {
    throw ApiError.notFound('Deployment not found');
  }

  return ApiResponse.success(res, deployment);
});

/**
 * @desc    Create deployment
 * @route   POST /api/v1/deployments
 * @access  Private
 */
export const createDeployment = asyncHandler(async (req, res) => {
  const { guard: guardId, client: clientId } = req.body;

  // Check if guard exists and is active
  const guard = await Guard.findById(guardId);
  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }
  if (guard.status !== 'active') {
    throw ApiError.badRequest('Guard is not active');
  }

  // Check if guard already has an active deployment
  const existingDeployment = await Deployment.findOne({
    guard: guardId,
    status: 'active',
  });
  if (existingDeployment) {
    throw ApiError.badRequest('Guard already has an active deployment');
  }

  // Check if client exists and is active
  const client = await Client.findById(clientId);
  if (!client) {
    throw ApiError.notFound('Client not found');
  }
  if (client.status !== 'active') {
    throw ApiError.badRequest('Client is not active');
  }

  const deployment = await Deployment.create({
    ...req.body,
    createdBy: req.user._id,
  });

  // Update guard's current deployment
  guard.currentDeployment = {
    client: clientId,
    site: req.body.site.name,
    shift: `${req.body.shift.startTime} - ${req.body.shift.endTime}`,
    deployedAt: req.body.schedule.startDate,
  };
  await guard.save();

  // Update client site strength
  const site = client.sites.find(s => s.siteId === req.body.site.siteId || s.name === req.body.site.name);
  if (site) {
    site.currentStrength = (site.currentStrength || 0) + 1;
    await client.save();
  }

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'deployment',
    moduleId: deployment._id,
    description: `Created deployment: ${guard.fullName} at ${client.companyName}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.created(res, deployment, 'Deployment created successfully');
});

/**
 * @desc    Update deployment
 * @route   PUT /api/v1/deployments/:id
 * @access  Private
 */
export const updateDeployment = asyncHandler(async (req, res) => {
  let deployment = await Deployment.findById(req.params.id);

  if (!deployment) {
    throw ApiError.notFound('Deployment not found');
  }

  if (deployment.status !== 'active') {
    throw ApiError.badRequest('Cannot update non-active deployment');
  }

  const oldData = deployment.toObject();

  deployment = await Deployment.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  ).populate('guard', 'guardId firstName lastName')
   .populate('client', 'clientId companyName');

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'deployment',
    moduleId: deployment._id,
    description: `Updated deployment: ${deployment.deploymentId}`,
    changes: { before: oldData, after: deployment.toObject() },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, deployment, 'Deployment updated successfully');
});

/**
 * @desc    Terminate deployment
 * @route   POST /api/v1/deployments/:id/terminate
 * @access  Private
 */
export const terminateDeployment = asyncHandler(async (req, res) => {
  const { reason, remarks } = req.body;

  const deployment = await Deployment.findById(req.params.id)
    .populate('guard')
    .populate('client');

  if (!deployment) {
    throw ApiError.notFound('Deployment not found');
  }

  if (deployment.status !== 'active') {
    throw ApiError.badRequest('Deployment is not active');
  }

  // Update deployment
  deployment.status = 'completed';
  deployment.schedule.endDate = new Date();
  deployment.terminationDetails = {
    date: new Date(),
    reason,
    remarks,
    terminatedBy: req.user._id,
  };
  deployment.updatedBy = req.user._id;
  await deployment.save();

  // Clear guard's current deployment
  await Guard.findByIdAndUpdate(deployment.guard._id, {
    currentDeployment: {
      client: null,
      site: null,
      shift: null,
      deployedAt: null,
    },
  });

  // Update client site strength
  const client = await Client.findById(deployment.client._id);
  const site = client.sites.find(s => s.siteId === deployment.site.siteId || s.name === deployment.site.name);
  if (site && site.currentStrength > 0) {
    site.currentStrength -= 1;
    await client.save();
  }

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'deployment',
    moduleId: deployment._id,
    description: `Terminated deployment: ${deployment.deploymentId} - ${reason}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, deployment, 'Deployment terminated successfully');
});

/**
 * @desc    Add replacement to deployment
 * @route   POST /api/v1/deployments/:id/replacement
 * @access  Private
 */
export const addReplacement = asyncHandler(async (req, res) => {
  const { replacementGuardId, date, reason } = req.body;

  const deployment = await Deployment.findById(req.params.id);

  if (!deployment) {
    throw ApiError.notFound('Deployment not found');
  }

  // Check replacement guard
  const replacementGuard = await Guard.findById(replacementGuardId);
  if (!replacementGuard) {
    throw ApiError.notFound('Replacement guard not found');
  }
  if (replacementGuard.status !== 'active') {
    throw ApiError.badRequest('Replacement guard is not active');
  }

  deployment.replacements.push({
    originalGuard: deployment.guard,
    replacementGuard: replacementGuardId,
    date: new Date(date),
    reason,
    approvedBy: req.user._id,
  });
  deployment.updatedBy = req.user._id;
  await deployment.save();

  return ApiResponse.success(res, deployment, 'Replacement added successfully');
});

/**
 * @desc    Transfer deployment to another guard
 * @route   POST /api/v1/deployments/:id/transfer
 * @access  Private
 */
export const transferDeployment = asyncHandler(async (req, res) => {
  const { newGuardId, reason } = req.body;

  const deployment = await Deployment.findById(req.params.id)
    .populate('guard')
    .populate('client');

  if (!deployment) {
    throw ApiError.notFound('Deployment not found');
  }

  if (deployment.status !== 'active') {
    throw ApiError.badRequest('Can only transfer active deployments');
  }

  // Check new guard
  const newGuard = await Guard.findById(newGuardId);
  if (!newGuard) {
    throw ApiError.notFound('New guard not found');
  }
  if (newGuard.status !== 'active') {
    throw ApiError.badRequest('New guard is not active');
  }

  // Check if new guard already has active deployment
  const existingDeployment = await Deployment.findOne({
    guard: newGuardId,
    status: 'active',
  });
  if (existingDeployment) {
    throw ApiError.badRequest('New guard already has an active deployment');
  }

  const oldGuard = deployment.guard;

  // Clear old guard's deployment
  await Guard.findByIdAndUpdate(oldGuard._id, {
    currentDeployment: {
      client: null,
      site: null,
      shift: null,
      deployedAt: null,
    },
  });

  // Update deployment with new guard
  deployment.guard = newGuardId;
  deployment.statusHistory.push({
    status: 'transferred',
    changedAt: new Date(),
    changedBy: req.user._id,
    reason: `Transferred from ${oldGuard.fullName} to ${newGuard.fullName}: ${reason}`,
  });
  deployment.updatedBy = req.user._id;
  await deployment.save();

  // Set new guard's deployment
  newGuard.currentDeployment = {
    client: deployment.client._id,
    site: deployment.site.name,
    shift: `${deployment.shift.startTime} - ${deployment.shift.endTime}`,
    deployedAt: new Date(),
  };
  await newGuard.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'deployment',
    moduleId: deployment._id,
    description: `Transferred deployment from ${oldGuard.fullName} to ${newGuard.fullName}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, deployment, 'Deployment transferred successfully');
});

/**
 * @desc    Get deployment statistics
 * @route   GET /api/v1/deployments/stats
 * @access  Private
 */
export const getDeploymentStats = asyncHandler(async (req, res) => {
  const stats = await Deployment.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byShiftType: [
          { $match: { status: 'active' } },
          { $group: { _id: '$shift.type', count: { $sum: 1 } } },
        ],
        byClient: [
          { $match: { status: 'active' } },
          {
            $group: {
              _id: '$client',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
        total: [{ $count: 'count' }],
        active: [
          { $match: { status: 'active' } },
          { $count: 'count' },
        ],
      },
    },
  ]);

  // Populate client names for top clients
  const topClients = await Client.populate(stats[0].byClient, {
    path: '_id',
    select: 'clientId companyName',
  });

  const result = {
    total: stats[0].total[0]?.count || 0,
    active: stats[0].active[0]?.count || 0,
    byStatus: stats[0].byStatus,
    byShiftType: stats[0].byShiftType,
    topClients: topClients.map(c => ({
      client: c._id,
      count: c.count,
    })),
  };

  return ApiResponse.success(res, result);
});