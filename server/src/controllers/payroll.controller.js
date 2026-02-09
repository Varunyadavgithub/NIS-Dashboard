import Payroll from '../models/Payroll.js';
import Guard from '../models/Guard.js';
import Attendance from '../models/Attendance.js';
import Settings from '../models/Settings.js';
import ActivityLog from '../models/ActivityLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, paginationResponse, getSortOption } from '../utils/pagination.js';
import { getMonthDateRange } from '../utils/helpers.js';

/**
 * @desc    Get all payrolls
 * @route   GET /api/v1/payroll
 * @access  Private
 */
export const getPayrolls = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSortOption(req.query.sortBy, req.query.sortOrder);
  
  const filter = {};
  
  if (req.query.guard) filter.guard = req.query.guard;
  if (req.query.month) filter.month = parseInt(req.query.month);
  if (req.query.year) filter.year = parseInt(req.query.year);
  if (req.query.status) filter.status = req.query.status;

  const [payrolls, total] = await Promise.all([
    Payroll.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('guard', 'guardId firstName lastName designation bankDetails')
      .populate('createdBy', 'name'),
    Payroll.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, payrolls, paginationResponse(total, page, limit));
});

/**
 * @desc    Get single payroll
 * @route   GET /api/v1/payroll/:id
 * @access  Private
 */
export const getPayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate('guard', 'guardId firstName lastName designation bankDetails pfDetails esiDetails salary')
    .populate('createdBy', 'name')
    .populate('approvals.generatedBy', 'name')
    .populate('approvals.verifiedBy', 'name')
    .populate('approvals.approvedBy', 'name')
    .populate('payment.paidBy', 'name')
    .populate('adjustments.addedBy', 'name');

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  return ApiResponse.success(res, payroll);
});

/**
 * @desc    Generate payroll for a guard
 * @route   POST /api/v1/payroll/generate
 * @access  Private
 */
export const generatePayroll = asyncHandler(async (req, res) => {
  const { guard: guardId, month, year, earnings, deductions } = req.body;

  // Check if guard exists
  const guard = await Guard.findById(guardId);
  if (!guard) {
    throw ApiError.notFound('Guard not found');
  }

  // Check for existing payroll
  const existingPayroll = await Payroll.findOne({ guard: guardId, month, year });
  if (existingPayroll) {
    throw ApiError.conflict(`Payroll already exists for ${month}/${year}`);
  }

  // Get attendance data
  const { startDate, endDate } = getMonthDateRange(month, year);
  const attendanceRecords = await Attendance.find({
    guard: guardId,
    date: { $gte: startDate, $lte: endDate },
  });

  // Calculate attendance summary
  const attendanceSummary = {
    totalDays: attendanceRecords.length,
    presentDays: attendanceRecords.filter(a => a.status === 'present').length,
    absentDays: attendanceRecords.filter(a => a.status === 'absent').length,
    halfDays: attendanceRecords.filter(a => a.status === 'half_day').length,
    lateDays: attendanceRecords.filter(a => a.lateDetails?.isLate).length,
    leaveDays: attendanceRecords.filter(a => a.status === 'on_leave').length,
    totalHoursWorked: attendanceRecords.reduce((sum, a) => sum + (a.workHours?.effectiveHours || 0), 0),
    overtimeHours: attendanceRecords.reduce((sum, a) => sum + (a.workHours?.overtime || 0), 0),
  };

  // Get settings
  const [pfPercentage, esiPercentage, professionalTax, overtimeMultiplier, lateDeduction] = await Promise.all([
    Settings.get('pf_percentage', 12),
    Settings.get('esi_percentage', 0.75),
    Settings.get('professional_tax', 200),
    Settings.get('overtime_rate_multiplier', 1.5),
    Settings.get('late_deduction_per_day', 50),
  ]);

  // Calculate earnings from guard's salary or provided values
  const guardSalary = guard.salary || {};
  const calculatedEarnings = {
    basicSalary: earnings?.basicSalary ?? guardSalary.basic ?? 0,
    hra: earnings?.hra ?? guardSalary.hra ?? 0,
    travelAllowance: earnings?.travelAllowance ?? guardSalary.travelAllowance ?? 0,
    foodAllowance: earnings?.foodAllowance ?? guardSalary.foodAllowance ?? 0,
    medicalAllowance: earnings?.medicalAllowance ?? guardSalary.medicalAllowance ?? 0,
    specialAllowance: earnings?.specialAllowance ?? guardSalary.specialAllowance ?? 0,
    overtimePay: earnings?.overtimePay ?? (attendanceSummary.overtimeHours * (guardSalary.basic / 26 / 8) * overtimeMultiplier),
    bonus: earnings?.bonus ?? 0,
    incentive: earnings?.incentive ?? 0,
    arrears: earnings?.arrears ?? 0,
    otherEarnings: earnings?.otherEarnings ?? 0,
  };

  // Calculate pro-rated salary based on attendance
  const workingDays = 26; // Standard working days
  const effectiveDays = attendanceSummary.presentDays + (attendanceSummary.halfDays * 0.5);
  const attendanceRatio = effectiveDays / workingDays;

  // Pro-rate basic salary
  calculatedEarnings.basicSalary = Math.round(calculatedEarnings.basicSalary * attendanceRatio);

  // Calculate deductions
  const grossSalary = Object.values(calculatedEarnings).reduce((sum, val) => sum + val, 0);
  
  const calculatedDeductions = {
    pf: deductions?.pf ?? (guard.pfDetails?.isApplicable ? Math.round(calculatedEarnings.basicSalary * pfPercentage / 100) : 0),
    esi: deductions?.esi ?? (guard.esiDetails?.isApplicable && grossSalary <= 21000 ? Math.round(grossSalary * esiPercentage / 100) : 0),
    professionalTax: deductions?.professionalTax ?? professionalTax,
    incomeTax: deductions?.incomeTax ?? 0,
    loanDeduction: deductions?.loanDeduction ?? 0,
    advanceDeduction: deductions?.advanceDeduction ?? 0,
    absentDeduction: deductions?.absentDeduction ?? Math.round(attendanceSummary.absentDays * (guardSalary.basic / 26)),
    lateDeduction: deductions?.lateDeduction ?? (attendanceSummary.lateDays * lateDeduction),
    uniformDeduction: deductions?.uniformDeduction ?? 0,
    otherDeductions: deductions?.otherDeductions ?? 0,
  };

  const payroll = await Payroll.create({
    guard: guardId,
    month,
    year,
    period: { startDate, endDate },
    attendance: attendanceSummary,
    earnings: calculatedEarnings,
    deductions: calculatedDeductions,
    approvals: {
      generatedBy: req.user._id,
      generatedAt: new Date(),
    },
    status: 'pending',
    remarks: req.body.remarks,
    createdBy: req.user._id,
  });

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'payroll',
    moduleId: payroll._id,
    description: `Generated payroll for ${guard.fullName} - ${month}/${year}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.created(res, payroll, 'Payroll generated successfully');
});

/**
 * @desc    Bulk generate payrolls
 * @route   POST /api/v1/payroll/bulk-generate
 * @access  Private
 */
export const bulkGeneratePayroll = asyncHandler(async (req, res) => {
  const { month, year, guards, allActiveGuards } = req.body;

  let guardIds = guards;

  if (allActiveGuards) {
    const activeGuards = await Guard.find({ status: 'active' }).select('_id');
    guardIds = activeGuards.map(g => g._id.toString());
  }

  const results = { success: [], failed: [], skipped: [] };

  for (const guardId of guardIds) {
    try {
      // Check for existing payroll
      const existing = await Payroll.findOne({ guard: guardId, month, year });
      if (existing) {
        results.skipped.push({ guard: guardId, reason: 'Payroll already exists' });
        continue;
      }

      const guard = await Guard.findById(guardId);
      if (!guard) {
        results.failed.push({ guard: guardId, error: 'Guard not found' });
        continue;
      }

      // Get attendance
      const { startDate, endDate } = getMonthDateRange(month, year);
      const attendanceRecords = await Attendance.find({
        guard: guardId,
        date: { $gte: startDate, $lte: endDate },
      });

      const attendanceSummary = {
        totalDays: attendanceRecords.length,
        presentDays: attendanceRecords.filter(a => a.status === 'present').length,
        absentDays: attendanceRecords.filter(a => a.status === 'absent').length,
        halfDays: attendanceRecords.filter(a => a.status === 'half_day').length,
        lateDays: attendanceRecords.filter(a => a.lateDetails?.isLate).length,
        leaveDays: attendanceRecords.filter(a => a.status === 'on_leave').length,
        totalHoursWorked: attendanceRecords.reduce((sum, a) => sum + (a.workHours?.effectiveHours || 0), 0),
        overtimeHours: attendanceRecords.reduce((sum, a) => sum + (a.workHours?.overtime || 0), 0),
      };

      const guardSalary = guard.salary || {};
      const workingDays = 26;
      const effectiveDays = attendanceSummary.presentDays + (attendanceSummary.halfDays * 0.5);
      const attendanceRatio = effectiveDays / workingDays;

      const payroll = await Payroll.create({
        guard: guardId,
        month,
        year,
        period: { startDate, endDate },
        attendance: attendanceSummary,
        earnings: {
          basicSalary: Math.round((guardSalary.basic || 0) * attendanceRatio),
          hra: guardSalary.hra || 0,
          travelAllowance: guardSalary.travelAllowance || 0,
          foodAllowance: guardSalary.foodAllowance || 0,
          medicalAllowance: guardSalary.medicalAllowance || 0,
          specialAllowance: guardSalary.specialAllowance || 0,
        },
        deductions: {
          pf: guard.pfDetails?.isApplicable ? Math.round((guardSalary.basic || 0) * attendanceRatio * 0.12) : 0,
          esi: guard.esiDetails?.isApplicable ? Math.round((guardSalary.grossSalary || 0) * 0.0075) : 0,
          professionalTax: 200,
          absentDeduction: Math.round(attendanceSummary.absentDays * ((guardSalary.basic || 0) / 26)),
        },
        approvals: { generatedBy: req.user._id, generatedAt: new Date() },
        status: 'pending',
        createdBy: req.user._id,
      });

      results.success.push(payroll);
    } catch (error) {
      results.failed.push({ guard: guardId, error: error.message });
    }
  }

  await ActivityLog.log({
    user: req.user._id,
    action: 'create',
    module: 'payroll',
    description: `Bulk generated payroll: ${results.success.length} success, ${results.failed.length} failed, ${results.skipped.length} skipped`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, results, `Processed ${guardIds.length} payrolls`);
});

/**
 * @desc    Update payroll
 * @route   PUT /api/v1/payroll/:id
 * @access  Private
 */
export const updatePayroll = asyncHandler(async (req, res) => {
  let payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  if (payroll.isLocked) {
    throw ApiError.badRequest('Cannot modify locked payroll');
  }

  if (payroll.status === 'paid') {
    throw ApiError.badRequest('Cannot modify paid payroll');
  }

  // Create revision before update
  await payroll.createRevision('Manual update', req.user._id);

  const oldData = payroll.toObject();

  Object.assign(payroll, req.body);
  payroll.updatedBy = req.user._id;
  await payroll.save();

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'payroll',
    moduleId: payroll._id,
    description: `Updated payroll: ${payroll.payrollId}`,
    changes: { before: oldData, after: payroll.toObject() },
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, payroll, 'Payroll updated successfully');
});

/**
 * @desc    Add adjustment to payroll
 * @route   POST /api/v1/payroll/:id/adjustment
 * @access  Private
 */
export const addAdjustment = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  if (payroll.isLocked) {
    throw ApiError.badRequest('Cannot modify locked payroll');
  }

  await payroll.addAdjustment(req.body, req.user._id);

  return ApiResponse.success(res, payroll, 'Adjustment added successfully');
});

/**
 * @desc    Verify payroll
 * @route   PATCH /api/v1/payroll/:id/verify
 * @access  Private
 */
export const verifyPayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  await payroll.verify(req.user._id);

  await ActivityLog.log({
    user: req.user._id,
    action: 'approve',
    module: 'payroll',
    moduleId: payroll._id,
    description: `Verified payroll: ${payroll.payrollId}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, payroll, 'Payroll verified successfully');
});

/**
 * @desc    Approve payroll
 * @route   PATCH /api/v1/payroll/:id/approve
 * @access  Private
 */
export const approvePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  await payroll.approve(req.user._id);

  await ActivityLog.log({
    user: req.user._id,
    action: 'approve',
    module: 'payroll',
    moduleId: payroll._id,
    description: `Approved payroll: ${payroll.payrollId}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, payroll, 'Payroll approved successfully');
});

/**
 * @desc    Reject payroll
 * @route   PATCH /api/v1/payroll/:id/reject
 * @access  Private
 */
export const rejectPayroll = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  await payroll.reject(reason, req.user._id);

  await ActivityLog.log({
    user: req.user._id,
    action: 'reject',
    module: 'payroll',
    moduleId: payroll._id,
    description: `Rejected payroll: ${payroll.payrollId} - ${reason}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, payroll, 'Payroll rejected');
});

/**
 * @desc    Process payment
 * @route   POST /api/v1/payroll/:id/pay
 * @access  Private
 */
export const processPayment = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate('guard');

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  const paymentDetails = {
    method: req.body.method,
    transactionId: req.body.transactionId,
    bankDetails: req.body.bankDetails || payroll.guard.bankDetails,
    chequeDetails: req.body.chequeDetails,
  };

  await payroll.markAsPaid(paymentDetails, req.user._id);

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'payroll',
    moduleId: payroll._id,
    description: `Processed payment for payroll: ${payroll.payrollId}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, payroll, 'Payment processed successfully');
});

/**
 * @desc    Bulk process payments
 * @route   POST /api/v1/payroll/bulk-pay
 * @access  Private
 */
export const bulkProcessPayment = asyncHandler(async (req, res) => {
  const { payrollIds, method, remarks } = req.body;

  const results = { success: [], failed: [] };

  for (const payrollId of payrollIds) {
    try {
      const payroll = await Payroll.findById(payrollId).populate('guard');
      
      if (!payroll) {
        results.failed.push({ payrollId, error: 'Payroll not found' });
        continue;
      }

      if (payroll.status !== 'approved') {
        results.failed.push({ payrollId, error: 'Payroll not approved' });
        continue;
      }

      await payroll.markAsPaid({
        method,
        bankDetails: payroll.guard.bankDetails,
      }, req.user._id);

      results.success.push(payroll);
    } catch (error) {
      results.failed.push({ payrollId, error: error.message });
    }
  }

  await ActivityLog.log({
    user: req.user._id,
    action: 'update',
    module: 'payroll',
    description: `Bulk payment: ${results.success.length} success, ${results.failed.length} failed`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, results, `Processed ${results.success.length} payments`);
});

/**
 * @desc    Get payroll summary
 * @route   GET /api/v1/payroll/summary
 * @access  Private
 */
export const getPayrollSummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const summary = await Payroll.getPayrollSummary(m, y);

  return ApiResponse.success(res, { month: m, year: y, ...summary });
});

/**
 * @desc    Get payroll statistics
 * @route   GET /api/v1/payroll/stats
 * @access  Private
 */
export const getPayrollStats = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const stats = await Payroll.getDashboardStats(year);
  return ApiResponse.success(res, { year, monthlyStats: stats });
});

/**
 * @desc    Get guard payroll history
 * @route   GET /api/v1/payroll/guard/:guardId/history
 * @access  Private
 */
export const getGuardPayrollHistory = asyncHandler(async (req, res) => {
  const history = await Payroll.getGuardPayrollHistory(req.params.guardId, 12);
  return ApiResponse.success(res, history);
});

/**
 * @desc    Generate payslip
 * @route   GET /api/v1/payroll/:id/payslip
 * @access  Private
 */
export const generatePayslip = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate('guard', 'guardId firstName lastName designation bankDetails pfDetails esiDetails');

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  const payslip = payroll.generatePayslip();
  
  // Get company details from settings
  const [companyName, companyAddress] = await Promise.all([
    Settings.get('company_name', 'Neha Industrial Security'),
    Settings.get('company_address', ''),
  ]);

  return ApiResponse.success(res, {
    ...payslip,
    company: { name: companyName, address: companyAddress },
  });
});

/**
 * @desc    Delete payroll
 * @route   DELETE /api/v1/payroll/:id
 * @access  Private
 */
export const deletePayroll = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    throw ApiError.notFound('Payroll not found');
  }

  if (payroll.status === 'paid') {
    throw ApiError.badRequest('Cannot delete paid payroll');
  }

  if (payroll.isLocked) {
    throw ApiError.badRequest('Cannot delete locked payroll');
  }

  await payroll.deleteOne();

  await ActivityLog.log({
    user: req.user._id,
    action: 'delete',
    module: 'payroll',
    moduleId: payroll._id,
    description: `Deleted payroll: ${payroll.payrollId}`,
    metadata: { ip: req.ip, userAgent: req.get('User-Agent') },
  });

  return ApiResponse.success(res, null, 'Payroll deleted successfully');
});