import Guard from '../models/Guard.js';
import Client from '../models/Client.js';
import Deployment from '../models/Deployment.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getMonthDateRange } from '../utils/helpers.js';
import ExcelJS from 'xlsx';

/**
 * @desc    Get attendance report
 * @route   GET /api/v1/reports/attendance
 * @access  Private
 */
export const getAttendanceReport = asyncHandler(async (req, res) => {
  const { month, year, client, guard, format } = req.query;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const { startDate, endDate } = getMonthDateRange(m, y);
  const filter = { date: { $gte: startDate, $lte: endDate } };

  if (client) filter.client = client;
  if (guard) filter.guard = guard;

  const attendance = await Attendance.find(filter)
    .populate('guard', 'guardId firstName lastName designation')
    .populate('client', 'clientId companyName')
    .sort({ date: 1, guard: 1 });

  // Aggregate by guard
  const guardSummary = {};
  attendance.forEach(record => {
    const guardId = record.guard._id.toString();
    if (!guardSummary[guardId]) {
      guardSummary[guardId] = {
        guard: record.guard,
        present: 0,
        absent: 0,
        halfDay: 0,
        late: 0,
        leave: 0,
        totalHours: 0,
        overtimeHours: 0,
      };
    }
    if (record.status === 'present') guardSummary[guardId].present++;
    if (record.status === 'absent') guardSummary[guardId].absent++;
    if (record.status === 'half_day') guardSummary[guardId].halfDay++;
    if (record.status === 'on_leave') guardSummary[guardId].leave++;
    if (record.lateDetails?.isLate) guardSummary[guardId].late++;
    guardSummary[guardId].totalHours += record.workHours?.effectiveHours || 0;
    guardSummary[guardId].overtimeHours += record.workHours?.overtime || 0;
  });

  const report = {
    period: { month: m, year: y, startDate, endDate },
    summary: Object.values(guardSummary),
    totalRecords: attendance.length,
  };

  if (format === 'excel') {
    const workbook = ExcelJS.utils.book_new();
    const wsData = [
      ['Guard ID', 'Name', 'Present', 'Absent', 'Half Day', 'Late', 'Leave', 'Total Hours', 'Overtime'],
      ...Object.values(guardSummary).map(g => [
        g.guard.guardId,
        `${g.guard.firstName} ${g.guard.lastName}`,
        g.present, g.absent, g.halfDay, g.late, g.leave,
        g.totalHours.toFixed(2), g.overtimeHours.toFixed(2),
      ]),
    ];
    const ws = ExcelJS.utils.aoa_to_sheet(wsData);
    ExcelJS.utils.book_append_sheet(workbook, ws, 'Attendance Report');
    const buffer = ExcelJS.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${m}_${y}.xlsx`);
    return res.send(buffer);
  }

  return ApiResponse.success(res, report);
});

/**
 * @desc    Get payroll report
 * @route   GET /api/v1/reports/payroll
 * @access  Private
 */
export const getPayrollReport = asyncHandler(async (req, res) => {
  const { month, year, status, format } = req.query;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const filter = { month: m, year: y };
  if (status) filter.status = status;

  const payrolls = await Payroll.find(filter)
    .populate('guard', 'guardId firstName lastName designation bankDetails')
    .sort({ 'guard.guardId': 1 });

  const summary = {
    totalPayrolls: payrolls.length,
    totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
    totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
    totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
    byStatus: {},
  };

  payrolls.forEach(p => {
    summary.byStatus[p.status] = (summary.byStatus[p.status] || 0) + 1;
  });

  const report = {
    period: { month: m, year: y },
    summary,
    payrolls,
  };

  if (format === 'excel') {
    const workbook = ExcelJS.utils.book_new();
    const wsData = [
      ['Payroll ID', 'Guard ID', 'Name', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'],
      ...payrolls.map(p => [
        p.payrollId,
        p.guard.guardId,
        `${p.guard.firstName} ${p.guard.lastName}`,
        p.grossSalary, p.totalDeductions, p.netSalary, p.status,
      ]),
    ];
    const ws = ExcelJS.utils.aoa_to_sheet(wsData);
    ExcelJS.utils.book_append_sheet(workbook, ws, 'Payroll Report');
    const buffer = ExcelJS.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_report_${m}_${y}.xlsx`);
    return res.send(buffer);
  }

  return ApiResponse.success(res, report);
});

/**
 * @desc    Get guard report
 * @route   GET /api/v1/reports/guards
 * @access  Private
 */
export const getGuardReport = asyncHandler(async (req, res) => {
  const { status, designation, format } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (designation) filter.designation = designation;

  const guards = await Guard.find(filter)
    .select('guardId firstName lastName phone designation status dateOfJoining currentDeployment salary')
    .populate('currentDeployment.client', 'clientId companyName')
    .sort({ guardId: 1 });

  const summary = {
    total: guards.length,
    byStatus: {},
    byDesignation: {},
    deployed: guards.filter(g => g.currentDeployment?.client).length,
  };

  guards.forEach(g => {
    summary.byStatus[g.status] = (summary.byStatus[g.status] || 0) + 1;
    summary.byDesignation[g.designation] = (summary.byDesignation[g.designation] || 0) + 1;
  });

  const report = { summary, guards };

  if (format === 'excel') {
    const workbook = ExcelJS.utils.book_new();
    const wsData = [
      ['Guard ID', 'Name', 'Phone', 'Designation', 'Status', 'Date of Joining', 'Current Client'],
      ...guards.map(g => [
        g.guardId,
        `${g.firstName} ${g.lastName}`,
        g.phone, g.designation, g.status,
        g.dateOfJoining?.toLocaleDateString(),
        g.currentDeployment?.client?.companyName || 'Not Deployed',
      ]),
    ];
    const ws = ExcelJS.utils.aoa_to_sheet(wsData);
    ExcelJS.utils.book_append_sheet(workbook, ws, 'Guards Report');
    const buffer = ExcelJS.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=guards_report.xlsx');
    return res.send(buffer);
  }

  return ApiResponse.success(res, report);
});

/**
 * @desc    Get client report
 * @route   GET /api/v1/reports/clients
 * @access  Private
 */
export const getClientReport = asyncHandler(async (req, res) => {
  const { status, format } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const clients = await Client.find(filter)
    .select('clientId companyName contactPerson status contract requirements sites')
    .sort({ clientId: 1 });

  const summary = {
    total: clients.length,
    byStatus: {},
    totalGuardsRequired: clients.reduce((sum, c) => sum + (c.requirements?.totalGuards || 0), 0),
    totalGuardsDeployed: clients.reduce((sum, c) => sum + (c.requirements?.currentStrength || 0), 0),
  };

  clients.forEach(c => {
    summary.byStatus[c.status] = (summary.byStatus[c.status] || 0) + 1;
  });

  const report = { summary, clients };

  if (format === 'excel') {
    const workbook = ExcelJS.utils.book_new();
    const wsData = [
      ['Client ID', 'Company Name', 'Contact Person', 'Phone', 'Status', 'Guards Required', 'Guards Deployed', 'Contract End'],
      ...clients.map(c => [
        c.clientId, c.companyName,
        c.contactPerson?.name, c.contactPerson?.phone,
        c.status, c.requirements?.totalGuards, c.requirements?.currentStrength,
        c.contract?.endDate?.toLocaleDateString(),
      ]),
    ];
    const ws = ExcelJS.utils.aoa_to_sheet(wsData);
    ExcelJS.utils.book_append_sheet(workbook, ws, 'Clients Report');
    const buffer = ExcelJS.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=clients_report.xlsx');
    return res.send(buffer);
  }

  return ApiResponse.success(res, report);
});

/**
 * @desc    Get deployment report
 * @route   GET /api/v1/reports/deployments
 * @access  Private
 */
export const getDeploymentReport = asyncHandler(async (req, res) => {
  const { status, client, format } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (client) filter.client = client;

  const deployments = await Deployment.find(filter)
    .populate('guard', 'guardId firstName lastName')
    .populate('client', 'clientId companyName')
    .sort({ 'schedule.startDate': -1 });

  const summary = {
    total: deployments.length,
    byStatus: {},
    byShiftType: {},
  };

  deployments.forEach(d => {
    summary.byStatus[d.status] = (summary.byStatus[d.status] || 0) + 1;
    summary.byShiftType[d.shift?.type] = (summary.byShiftType[d.shift?.type] || 0) + 1;
  });

  const report = { summary, deployments };

  if (format === 'excel') {
    const workbook = ExcelJS.utils.book_new();
    const wsData = [
      ['Deployment ID', 'Guard', 'Client', 'Site', 'Shift', 'Start Date', 'Status'],
      ...deployments.map(d => [
        d.deploymentId,
        `${d.guard?.firstName} ${d.guard?.lastName}`,
        d.client?.companyName,
        d.site?.name,
        `${d.shift?.startTime} - ${d.shift?.endTime}`,
        d.schedule?.startDate?.toLocaleDateString(),
        d.status,
      ]),
    ];
    const ws = ExcelJS.utils.aoa_to_sheet(wsData);
    ExcelJS.utils.book_append_sheet(workbook, ws, 'Deployments Report');
    const buffer = ExcelJS.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=deployments_report.xlsx');
    return res.send(buffer);
  }

  return ApiResponse.success(res, report);
});

/**
 * @desc    Get financial report
 * @route   GET /api/v1/reports/financial
 * @access  Private
 */
export const getFinancialReport = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const y = parseInt(year) || new Date().getFullYear();

  const monthlyPayroll = await Payroll.aggregate([
    { $match: { year: y, status: 'paid' } },
    {
      $group: {
        _id: '$month',
        totalGross: { $sum: '$grossSalary' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalNet: { $sum: '$netSalary' },
        count: { $sum: 1 },
        totalPF: { $sum: '$deductions.pf' },
        totalESI: { $sum: '$deductions.esi' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const yearlyTotal = monthlyPayroll.reduce((acc, m) => ({
    totalGross: acc.totalGross + m.totalGross,
    totalDeductions: acc.totalDeductions + m.totalDeductions,
    totalNet: acc.totalNet + m.totalNet,
    totalPF: acc.totalPF + m.totalPF,
    totalESI: acc.totalESI + m.totalESI,
  }), { totalGross: 0, totalDeductions: 0, totalNet: 0, totalPF: 0, totalESI: 0 });

  return ApiResponse.success(res, {
    year: y,
    monthly: monthlyPayroll,
    yearly: yearlyTotal,
  });
});

/**
 * @desc    Get PF/ESI report
 * @route   GET /api/v1/reports/pf-esi
 * @access  Private
 */
export const getPFESIReport = asyncHandler(async (req, res) => {
  const { month, year, format } = req.query;
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const payrolls = await Payroll.find({
    month: m,
    year: y,
    $or: [
      { 'deductions.pf': { $gt: 0 } },
      { 'deductions.esi': { $gt: 0 } },
    ],
  }).populate('guard', 'guardId firstName lastName pfDetails esiDetails');

  const report = {
    period: { month: m, year: y },
    pfContributions: payrolls.filter(p => p.deductions.pf > 0).map(p => ({
      guard: p.guard,
      pfNumber: p.guard.pfDetails?.pfNumber,
      uanNumber: p.guard.pfDetails?.uanNumber,
      basicSalary: p.earnings.basicSalary,
      pfAmount: p.deductions.pf,
      employerPF: Math.round(p.earnings.basicSalary * 0.12),
    })),
    esiContributions: payrolls.filter(p => p.deductions.esi > 0).map(p => ({
      guard: p.guard,
      esiNumber: p.guard.esiDetails?.esiNumber,
      grossSalary: p.grossSalary,
      esiAmount: p.deductions.esi,
      employerESI: Math.round(p.grossSalary * 0.0325),
    })),
    totals: {
      totalPFEmployee: payrolls.reduce((sum, p) => sum + (p.deductions.pf || 0), 0),
      totalPFEmployer: payrolls.reduce((sum, p) => sum + Math.round(p.earnings.basicSalary * 0.12), 0),
      totalESIEmployee: payrolls.reduce((sum, p) => sum + (p.deductions.esi || 0), 0),
      totalESIEmployer: payrolls.reduce((sum, p) => sum + Math.round(p.grossSalary * 0.0325), 0),
    },
  };

  if (format === 'excel') {
    const workbook = ExcelJS.utils.book_new();
    
    // PF Sheet
    const pfData = [
      ['Guard ID', 'Name', 'PF Number', 'UAN', 'Basic Salary', 'Employee PF', 'Employer PF'],
      ...report.pfContributions.map(p => [
        p.guard.guardId, `${p.guard.firstName} ${p.guard.lastName}`,
        p.pfNumber, p.uanNumber, p.basicSalary, p.pfAmount, p.employerPF,
      ]),
    ];
    const pfWs = ExcelJS.utils.aoa_to_sheet(pfData);
    ExcelJS.utils.book_append_sheet(workbook, pfWs, 'PF Contributions');
    
    // ESI Sheet
    const esiData = [
      ['Guard ID', 'Name', 'ESI Number', 'Gross Salary', 'Employee ESI', 'Employer ESI'],
      ...report.esiContributions.map(p => [
        p.guard.guardId, `${p.guard.firstName} ${p.guard.lastName}`,
        p.esiNumber, p.grossSalary, p.esiAmount, p.employerESI,
      ]),
    ];
    const esiWs = ExcelJS.utils.aoa_to_sheet(esiData);
    ExcelJS.utils.book_append_sheet(workbook, esiWs, 'ESI Contributions');
    
    const buffer = ExcelJS.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=pf_esi_report_${m}_${y}.xlsx`);
    return res.send(buffer);
  }

  return ApiResponse.success(res, report);
});