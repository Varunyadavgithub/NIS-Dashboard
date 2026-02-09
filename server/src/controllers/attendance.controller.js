import Attendance from '../models/Attendance.js';
import Guard from '../models/Guard.js';
import Deployment from '../models/Deployment.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse, getSortOption } from '../utils/pagination.js';
import { getMonthDateRange } from '../utils/helpers.js';

/**
 * @desc    Get all attendance records
 * @route   GET /api/v1/attendance
 * @access  Private
 */
export const getAttendance = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSortOption(req.query.sortBy || 'date', req.query.sortOrder);
  
  const filter = {};
  
  if (req.query.guard) filter.guard = req.query.guard;
  if (req.query.client) filter.client = req.query.client;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.verified !== undefined) filter['verification.isVerified'] = req.query.verified === 'true';
  
  if (req.query.date) {
    const date = new Date(req.query.date);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    filter.date = { $gte: date, $lt: nextDate };
  } else if (req.query.month && req.query.year) {
    const { startDate, endDate } = getMonthDateRange(parseInt(req.query.month), parseInt(req.query.year));
    filter.date = { $gte: startDate, $lte: endDate };
  } else if (req.query.startDate && req.query.endDate) {
    filter.date = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
  }

  const [attendance, total] = await Promise.all([
    Attendance.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('guard', 'guardId firstName lastName')
      .populate('client', 'clientId companyName'),
    Attendance.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, attendance, paginationResponse(total, page, limit));
});

/**
 * @desc    Get single attendance record
 * @route   GET /api/v1/attendance/:id
 * @access  Private
 */
export const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate('guard', 'guardId firstName lastName phone designation')
    .populate('client', 'clientId companyName')
    .populate('deployment')
    .populate('verification.verifiedBy', 'name')
    .populate('corrections.correctedBy', 'name');

  if (!attendance) {
    throw ApiError.notFound('Attendance record not found');
  }

  return ApiResponse.success(res, attendance);
});

/**
 * @desc    Mark attendance
 * @route   POST /api/v1/attendance
 * @access  Private
 */
export const markAttendance = asyncHandler(async (req, res) => {
  const { guard: guardId, date } = req.body;

  const guard = await Guard.findById(guardId);
  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(attendanceDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const existingAttendance = await Attendance.findOne({
    guard: guardId,
    date: { $gte: attendanceDate, $lt: nextDate },
  });

  if (existingAttendance) {
    throw ApiError.conflict('Attendance already marked for this date');
  }

  const deployment = await Deployment.findOne({ guard: guardId, status: 'active' });

  const attendance = await Attendance.create({
    ...req.body,
    date: attendanceDate,
    deployment: deployment?._id,
    client: deployment?.client || req.body.client,
    createdBy: req.user._id,
  });

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'attendance',
    moduleId: attendance._id,
    description: `Marked attendance for ${guard.fullName} - ${req.body.status}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.created(res, attendance, 'Attendance marked successfully');
});

/**
 * @desc    Update attendance
 * @route   PUT /api/v1/attendance/:id
 * @access  Private
 */
export const updateAttendance = asyncHandler(async (req, res) => {
  let attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw ApiError.notFound('Attendance record not found');
  }

  const oldData = attendance.toObject();

  const changes = [];
  for (const [key, value] of Object.entries(req.body)) {
    if (JSON.stringify(attendance[key]) !== JSON.stringify(value)) {
      changes.push({
        field: key,
        oldValue: attendance[key],
        newValue: value,
        correctedBy: req.user._id,
        correctedAt: new Date(),
        reason: req.body.correctionReason || 'Manual correction',
      });
    }
  }

  if (changes.length > 0) {
    attendance.corrections.push(...changes);
  }

  Object.assign(attendance, req.body);
  attendance.updatedBy = req.user._id;
  await attendance.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'attendance',
    moduleId: attendance._id,
    description: `Updated attendance record`,
    changes: { before: oldData, after: attendance.toObject() },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, attendance, 'Attendance updated successfully');
});

/**
 * @desc    Delete attendance
 * @route   DELETE /api/v1/attendance/:id
 * @access  Private
 */
export const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw ApiError.notFound('Attendance record not found');
  }

  await attendance.deleteOne();

  await ActivityLog.log({
    user: req.user._id,
    action: 'delete',
    module: 'attendance',
    moduleId: attendance._id,
    description: `Deleted attendance record`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Attendance deleted successfully');
});

/**
 * @desc    Bulk mark attendance
 * @route   POST /api/v1/attendance/bulk
 * @access  Private
 */
export const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { date, attendances } = req.body;

  const results = { success: [], failed: [] };
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  for (const record of attendances) {
    try {
      const nextDate = new Date(attendanceDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const existing = await Attendance.findOne({
        guard: record.guard,
        date: { $gte: attendanceDate, $lt: nextDate },
      });

      if (existing) {
        Object.assign(existing, record);
        existing.updatedBy = req.user._id;
        await existing.save();
        results.success.push(existing);
      } else {
        const attendance = await Attendance.create({
          ...record,
          date: attendanceDate,
          createdBy: req.user._id,
        });
        results.success.push(attendance);
      }
    } catch (error) {
      results.failed.push({ guard: record.guard, error: error.message });
    }
  }

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'attendance',
    description: `Bulk attendance: ${results.success.length} success, ${results.failed.length} failed`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, results, `Processed ${results.success.length} records`);
});

/**
 * @desc    Check in guard
 * @route   POST /api/v1/attendance/check-in
 * @access  Private
 */
export const checkIn = asyncHandler(async (req, res) => {
  const { guard: guardId, time, location, method, photo, remarks } = req.body;

  const guard = await Guard.findById(guardId);
  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let attendance = await Attendance.findOne({
    guard: guardId,
    date: { $gte: today, $lt: tomorrow },
  });

  const deployment = await Deployment.findOne({ guard: guardId, status: 'active' });

  if (attendance) {
    if (attendance.checkIn?.time) {
      throw ApiError.badRequest('Already checked in for today');
    }
    attendance.checkIn = { time: time || new Date(), location, method, photo, remarks };
    attendance.status = 'present';
    attendance.updatedBy = req.user._id;
  } else {
    attendance = new Attendance({
      guard: guardId,
      date: today,
      status: 'present',
      deployment: deployment?._id,
      client: deployment?.client,
      checkIn: { time: time || new Date(), location, method, photo, remarks },
      shift: deployment ? {
        type: deployment.shift.type,
        scheduledStart: deployment.shift.startTime,
        scheduledEnd: deployment.shift.endTime,
      } : undefined,
      workHours: { scheduled: 8 },
      createdBy: req.user._id,
    });
  }

  await attendance.save();

  return ApiResponse.success(res, attendance, 'Check-in successful');
});

/**
 * @desc    Check out guard
 * @route   POST /api/v1/attendance/:id/check-out
 * @access  Private
 */
export const checkOut = asyncHandler(async (req, res) => {
  const { time, location, method, photo, remarks } = req.body;

  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw ApiError.notFound('Attendance record not found');
  }

  if (!attendance.checkIn?.time) {
    throw ApiError.badRequest('No check-in record found');
  }

  if (attendance.checkOut?.time) {
    throw ApiError.badRequest('Already checked out');
  }

  attendance.checkOut = { time: time || new Date(), location, method, photo, remarks };
  attendance.updatedBy = req.user._id;
  await attendance.save();

  return ApiResponse.success(res, attendance, 'Check-out successful');
});

/**
 * @desc    Verify attendance
 * @route   PATCH /api/v1/attendance/:id/verify
 * @access  Private
 */
export const verifyAttendance = asyncHandler(async (req, res) => {
  const { remarks } = req.body;

  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    throw ApiError.notFound('Attendance record not found');
  }

  attendance.verification = {
    isVerified: true,
    verifiedBy: req.user._id,
    verifiedAt: new Date(),
    remarks,
  };
  attendance.updatedBy = req.user._id;
  await attendance.save();

  return ApiResponse.success(res, attendance, 'Attendance verified successfully');
});

/**
 * @desc    Bulk verify attendance
 * @route   PATCH /api/v1/attendance/bulk-verify
 * @access  Private
 */
export const bulkVerifyAttendance = asyncHandler(async (req, res) => {
  const { attendanceIds } = req.body;

  const result = await Attendance.updateMany(
    { _id: { $in: attendanceIds } },
    {
      $set: {
        'verification.isVerified': true,
        'verification.verifiedBy': req.user._id,
        'verification.verifiedAt': new Date(),
        updatedBy: req.user._id,
      },
    }
  );

  return ApiResponse.success(res, { modifiedCount: result.modifiedCount }, 'Attendance verified successfully');
});

/**
 * @desc    Get daily attendance summary
 * @route   GET /api/v1/attendance/daily-summary
 * @access  Private
 */
export const getDailySummary = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const stats = await Attendance.aggregate([
    { $match: { date: { $gte: targetDate, $lt: nextDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalGuards = await Guard.countDocuments({ status: 'active' });
  const markedCount = stats.reduce((sum, s) => sum + s.count, 0);

  const summary = {
    date: targetDate,
    totalActiveGuards: totalGuards,
    markedAttendance: markedCount,
    notMarked: totalGuards - markedCount,
    byStatus: stats,
  };

  return ApiResponse.success(res, summary);
});

/**
 * @desc    Get monthly attendance summary
 * @route   GET /api/v1/attendance/monthly-summary
 * @access  Private
 */
export const getMonthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const stats = await Attendance.getMonthlyStats(m, y);

  return ApiResponse.success(res, {
    month: m,
    year: y,
    summary: stats,
  });
});

/**
 * @desc    Get attendance statistics
 * @route   GET /api/v1/attendance/stats
 * @access  Private
 */
export const getAttendanceStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { startDate, endDate } = getMonthDateRange(today.getMonth() + 1, today.getFullYear());

  const [todayStats, monthStats, lateStats] = await Promise.all([
    Attendance.aggregate([
      { $match: { date: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Attendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Attendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate }, 'lateDetails.isLate': true } },
      { $group: { _id: null, count: { $sum: 1 }, totalLateMinutes: { $sum: '$lateDetails.lateBy' } } },
    ]),
  ]);

  return ApiResponse.success(res, {
    today: todayStats,
    month: monthStats,
    lateStats: lateStats[0] || { count: 0, totalLateMinutes: 0 },
  });
});