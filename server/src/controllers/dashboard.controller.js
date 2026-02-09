import Guard from '../models/Guard.js';
import Client from '../models/Client.js';
import Deployment from '../models/Deployment.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getMonthDateRange } from '../utils/helpers.js';

/**
 * @desc    Get dashboard overview stats
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [
    totalGuards,
    activeGuards,
    deployedGuards,
    totalClients,
    activeClients,
    activeDeployments,
    todayAttendance,
    monthlyPayroll,
  ] = await Promise.all([
    Guard.countDocuments(),
    Guard.countDocuments({ status: 'active' }),
    Guard.countDocuments({ status: 'active', 'currentDeployment.client': { $ne: null } }),
    Client.countDocuments(),
    Client.countDocuments({ status: 'active' }),
    Deployment.countDocuments({ status: 'active' }),
    Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
    Payroll.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      {
        $group: {
          _id: null,
          totalNetSalary: { $sum: '$netSalary' },
          count: { $sum: 1 },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const stats = {
    guards: {
      total: totalGuards,
      active: activeGuards,
      deployed: deployedGuards,
      available: activeGuards - deployedGuards,
    },
    clients: {
      total: totalClients,
      active: activeClients,
    },
    deployments: {
      active: activeDeployments,
    },
    attendance: {
      today: todayAttendance,
      expectedToday: activeGuards,
      attendanceRate: activeGuards > 0 ? Math.round((todayAttendance / activeGuards) * 100) : 0,
    },
    payroll: {
      currentMonth: {
        total: monthlyPayroll[0]?.totalNetSalary || 0,
        count: monthlyPayroll[0]?.count || 0,
        paid: monthlyPayroll[0]?.paidCount || 0,
      },
    },
  };

  return ApiResponse.success(res, stats);
});

/**
 * @desc    Get today's attendance overview
 * @route   GET /api/v1/dashboard/attendance-today
 * @access  Private
 */
export const getTodayAttendance = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [attendanceStats, recentCheckIns] = await Promise.all([
    Attendance.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    Attendance.find({ date: { $gte: today, $lt: tomorrow } })
      .sort({ 'checkIn.time': -1 })
      .limit(10)
      .populate('guard', 'guardId firstName lastName photo')
      .populate('client', 'companyName'),
  ]);

  const totalActive = await Guard.countDocuments({ status: 'active' });
  const markedCount = attendanceStats.reduce((sum, s) => sum + s.count, 0);

  return ApiResponse.success(res, {
    date: today,
    totalActiveGuards: totalActive,
    markedAttendance: markedCount,
    notMarked: totalActive - markedCount,
    byStatus: attendanceStats,
    recentCheckIns,
  });
});

/**
 * @desc    Get monthly trends
 * @route   GET /api/v1/dashboard/trends
 * @access  Private
 */
export const getMonthlyTrends = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const [attendanceTrend, payrollTrend, guardTrend] = await Promise.all([
    // Attendance trend by month
    Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Payroll trend by month
    Payroll.aggregate([
      { $match: { year } },
      {
        $group: {
          _id: '$month',
          totalSalary: { $sum: '$netSalary' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Guard count trend (new joinings by month)
    Guard.aggregate([
      {
        $match: {
          dateOfJoining: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$dateOfJoining' },
          newJoinings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return ApiResponse.success(res, {
    year,
    attendance: attendanceTrend,
    payroll: payrollTrend,
    guards: guardTrend,
  });
});

/**
 * @desc    Get expiring contracts
 * @route   GET /api/v1/dashboard/expiring-contracts
 * @access  Private
 */
export const getExpiringContracts = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const expiringContracts = await Client.find({
    status: 'active',
    'contract.endDate': {
      $gte: new Date(),
      $lte: futureDate,
    },
  })
    .select('clientId companyName contactPerson contract.endDate requirements')
    .sort({ 'contract.endDate': 1 })
    .limit(10);

  return ApiResponse.success(res, expiringContracts);
});

/**
 * @desc    Get pending actions
 * @route   GET /api/v1/dashboard/pending-actions
 * @access  Private
 */
export const getPendingActions = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [
    pendingPayrolls,
    unverifiedAttendance,
    pendingVerifications,
    expiringContracts,
  ] = await Promise.all([
    Payroll.countDocuments({
      month: currentMonth,
      year: currentYear,
      status: { $in: ['draft', 'pending', 'verified'] },
    }),
    Attendance.countDocuments({
      'verification.isVerified': false,
      date: { $lt: today },
    }),
    Guard.countDocuments({
      'policeVerification.status': 'pending',
    }),
    Client.countDocuments({
      status: 'active',
      'contract.endDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return ApiResponse.success(res, {
    pendingPayrolls,
    unverifiedAttendance,
    pendingVerifications,
    expiringContracts,
  });
});

/**
 * @desc    Get recent activities
 * @route   GET /api/v1/dashboard/recent-activities
 * @access  Private
 */
export const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const activities = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email');

  return ApiResponse.success(res, activities);
});

/**
 * @desc    Get client-wise deployment summary
 * @route   GET /api/v1/dashboard/client-deployments
 * @access  Private
 */
export const getClientDeploymentSummary = asyncHandler(async (req, res) => {
  const summary = await Deployment.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$client',
        totalDeployments: { $sum: 1 },
        sites: { $addToSet: '$site.name' },
      },
    },
    {
      $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: '_id',
        as: 'clientDetails',
      },
    },
    { $unwind: '$clientDetails' },
    {
      $project: {
        clientId: '$clientDetails.clientId',
        companyName: '$clientDetails.companyName',
        totalDeployments: 1,
        sitesCount: { $size: '$sites' },
        requiredGuards: '$clientDetails.requirements.totalGuards',
      },
    },
    { $sort: { totalDeployments: -1 } },
    { $limit: 10 },
  ]);

  return ApiResponse.success(res, summary);
});

/**
 * @desc    Get guard availability
 * @route   GET /api/v1/dashboard/guard-availability
 * @access  Private
 */
export const getGuardAvailability = asyncHandler(async (req, res) => {
  const availability = await Guard.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: {
          deployed: { $cond: [{ $ne: ['$currentDeployment.client', null] }, 'Deployed', 'Available'] },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const byDesignation = await Guard.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$designation',
        total: { $sum: 1 },
        deployed: {
          $sum: { $cond: [{ $ne: ['$currentDeployment.client', null] }, 1, 0] },
        },
        available: {
          $sum: { $cond: [{ $eq: ['$currentDeployment.client', null] }, 1, 0] },
        },
      },
    },
  ]);

  return ApiResponse.success(res, {
    summary: availability,
    byDesignation,
  });
});

/**
 * @desc    Get attendance heatmap data
 * @route   GET /api/v1/dashboard/attendance-heatmap
 * @access  Private
 */
export const getAttendanceHeatmap = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const { startDate, endDate } = getMonthDateRange(m, y);

  const heatmapData = await Attendance.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dayOfMonth: '$date' },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return ApiResponse.success(res, {
    month: m,
    year: y,
    data: heatmapData,
  });
});

/**
 * @desc    Get payroll overview
 * @route   GET /api/v1/dashboard/payroll-overview
 * @access  Private
 */
export const getPayrollOverview = asyncHandler(async (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const overview = await Payroll.aggregate([
    { $match: { month: currentMonth, year: currentYear } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$netSalary' },
      },
    },
  ]);

  const totalStats = await Payroll.aggregate([
    { $match: { month: currentMonth, year: currentYear } },
    {
      $group: {
        _id: null,
        totalGross: { $sum: '$grossSalary' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalNet: { $sum: '$netSalary' },
        totalPF: { $sum: '$deductions.pf' },
        totalESI: { $sum: '$deductions.esi' },
        count: { $sum: 1 },
      },
    },
  ]);

  return ApiResponse.success(res, {
    month: currentMonth,
    year: currentYear,
    byStatus: overview,
    totals: totalStats[0] || {},
  });
});