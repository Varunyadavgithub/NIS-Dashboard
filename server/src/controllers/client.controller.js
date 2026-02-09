import Client from '../models/Client.js';
import Deployment from '../models/Deployment.js';
import Guard from '../models/Guard.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse, getSortOption, buildSearchQuery } from '../utils/pagination.js';

/**
 * @desc    Get all clients
 * @route   GET /api/v1/clients
 * @access  Private
 */
export const getClients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSortOption(req.query.sortBy, req.query.sortOrder);
  
  const filter = {};
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.industryType) {
    filter.industryType = req.query.industryType;
  }
  
  // Filter clients with contracts expiring soon
  if (req.query.contractExpiring === 'true') {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    filter['contract.endDate'] = {
      $gte: new Date(),
      $lte: thirtyDaysFromNow,
    };
  }
  
  if (req.query.search) {
    const searchQuery = buildSearchQuery(req.query.search, ['companyName', 'clientId', 'contactPerson.name']);
    Object.assign(filter, searchQuery);
  }

  const [clients, total] = await Promise.all([
    Client.find(filter)
      .select('clientId companyName contactPerson status contract.endDate requirements sites')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Client.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, clients, paginationResponse(total, page, limit));
});

/**
 * @desc    Get single client
 * @route   GET /api/v1/clients/:id
 * @access  Private
 */
export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .populate('notes.addedBy', 'name');

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  return ApiResponse.success(res, client);
});

/**
 * @desc    Create client
 * @route   POST /api/v1/clients
 * @access  Private
 */
export const createClient = asyncHandler(async (req, res) => {
  // Check for duplicate GST if provided
  if (req.body.gstNumber) {
    const existingClient = await Client.findOne({ gstNumber: req.body.gstNumber });
    if (existingClient) {
      throw ApiError.conflict('Client with this GST number already exists');
    }
  }

  const client = await Client.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'client',
    moduleId: client._id,
    description: `Created client: ${client.companyName} (${client.clientId})`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.created(res, client, 'Client created successfully');
});

/**
 * @desc    Update client
 * @route   PUT /api/v1/clients/:id
 * @access  Private
 */
export const updateClient = asyncHandler(async (req, res) => {
  let client = await Client.findById(req.params.id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  const oldData = client.toObject();

  client = await Client.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  );

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'client',
    moduleId: client._id,
    description: `Updated client: ${client.companyName}`,
    changes: { before: oldData, after: client.toObject() },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, client, 'Client updated successfully');
});

/**
 * @desc    Delete client
 * @route   DELETE /api/v1/clients/:id
 * @access  Private
 */
export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Check for active deployments
  const activeDeployments = await Deployment.countDocuments({
    client: client._id,
    status: 'active',
  });

  if (activeDeployments > 0) {
    throw ApiError.badRequest(`Cannot delete client with ${activeDeployments} active deployments`);
  }

  await client.deleteOne();

  await ActivityLog.log({
    user: req.user._id,
    action: 'delete',
    module: 'client',
    moduleId: client._id,
    description: `Deleted client: ${client.companyName} (${client.clientId})`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Client deleted successfully');
});

/**
 * @desc    Add site to client
 * @route   POST /api/v1/clients/:id/sites
 * @access  Private
 */
export const addSite = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  await client.addSite(req.body);

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'client',
    moduleId: client._id,
    description: `Added site "${req.body.name}" to client: ${client.companyName}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, client, 'Site added successfully');
});

/**
 * @desc    Update site
 * @route   PUT /api/v1/clients/:id/sites/:siteId
 * @access  Private
 */
export const updateSite = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  const site = client.sites.id(req.params.siteId);
  if (!site) {
    throw ApiError.notFound('Site not found');
  }

  Object.assign(site, req.body);
  client.updatedBy = req.user._id;
  await client.save();

  return ApiResponse.success(res, client, 'Site updated successfully');
});

/**
 * @desc    Delete site
 * @route   DELETE /api/v1/clients/:id/sites/:siteId
 * @access  Private
 */
export const deleteSite = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  // Check for active deployments at this site
  const activeDeployments = await Deployment.countDocuments({
    client: client._id,
    'site.siteId': req.params.siteId,
    status: 'active',
  });

  if (activeDeployments > 0) {
    throw ApiError.badRequest('Cannot delete site with active deployments');
  }

  client.sites.pull(req.params.siteId);
  client.updatedBy = req.user._id;
  await client.save();

  return ApiResponse.success(res, client, 'Site deleted successfully');
});

/**
 * @desc    Get client deployed guards
 * @route   GET /api/v1/clients/:id/guards
 * @access  Private
 */
export const getClientGuards = asyncHandler(async (req, res) => {
  const guards = await Guard.find({
    'currentDeployment.client': req.params.id,
    status: 'active',
  }).select('guardId firstName lastName phone designation currentDeployment');

  return ApiResponse.success(res, guards);
});

/**
 * @desc    Get client deployments
 * @route   GET /api/v1/clients/:id/deployments
 * @access  Private
 */
export const getClientDeployments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const filter = { client: req.params.id };
  if (status) filter.status = status;

  const [deployments, total] = await Promise.all([
    Deployment.find(filter)
      .sort({ 'schedule.startDate': -1 })
      .skip(skip)
      .limit(limit)
      .populate('guard', 'guardId firstName lastName phone'),
    Deployment.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, deployments, paginationResponse(total, page, limit));
});

/**
 * @desc    Add note to client
 * @route   POST /api/v1/clients/:id/notes
 * @access  Private
 */
export const addNote = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const client = await Client.findById(req.params.id);

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  client.notes.push({
    content,
    addedBy: req.user._id,
    addedAt: new Date(),
  });
  client.updatedBy = req.user._id;
  await client.save();

  return ApiResponse.success(res, client, 'Note added successfully');
});

/**
 * @desc    Get clients with expiring contracts
 * @route   GET /api/v1/clients/expiring-contracts
 * @access  Private
 */
export const getExpiringContracts = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const clients = await Client.getExpiringContracts(days);
  return ApiResponse.success(res, clients);
});

/**
 * @desc    Get client statistics
 * @route   GET /api/v1/clients/stats
 * @access  Private
 */
export const getClientStats = asyncHandler(async (req, res) => {
  const stats = await Client.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byIndustry: [
          { $group: { _id: '$industryType', count: { $sum: 1 } } },
        ],
        totalGuardsRequired: [
          { $group: { _id: null, total: { $sum: '$requirements.totalGuards' } } },
        ],
        totalGuardsDeployed: [
          { $group: { _id: null, total: { $sum: '$requirements.currentStrength' } } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const result = {
    total: stats[0].total[0]?.count || 0,
    totalGuardsRequired: stats[0].totalGuardsRequired[0]?.total || 0,
    totalGuardsDeployed: stats[0].totalGuardsDeployed[0]?.total || 0,
    byStatus: stats[0].byStatus,
    byIndustry: stats[0].byIndustry,
  };

  return ApiResponse.success(res, result);
});