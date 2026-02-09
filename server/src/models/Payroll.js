import mongoose from 'mongoose';
import { PAYROLL_STATUS } from '../config/constants.js';

const payrollSchema = new mongoose.Schema(
  {
    payrollId: {
      type: String,
      unique: true,
    },
    guard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guard',
      required: [true, 'Guard is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    period: {
      startDate: Date,
      endDate: Date,
    },
    attendance: {
      totalDays: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      absentDays: { type: Number, default: 0 },
      lateDays: { type: Number, default: 0 },
      halfDays: { type: Number, default: 0 },
      leaveDays: { type: Number, default: 0 },
      totalHoursWorked: { type: Number, default: 0 },
      overtimeHours: { type: Number, default: 0 },
    },
    earnings: {
      basicSalary: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      travelAllowance: { type: Number, default: 0 },
      foodAllowance: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      overtimePay: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      incentive: { type: Number, default: 0 },
      arrears: { type: Number, default: 0 },
      otherEarnings: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      incomeTax: { type: Number, default: 0 },
      loanDeduction: { type: Number, default: 0 },
      advanceDeduction: { type: Number, default: 0 },
      absentDeduction: { type: Number, default: 0 },
      lateDeduction: { type: Number, default: 0 },
      uniformDeduction: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
      remarks: String,
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(PAYROLL_STATUS),
      default: PAYROLL_STATUS.DRAFT,
    },
    payment: {
      method: {
        type: String,
        enum: ['bank_transfer', 'cash', 'cheque', 'upi'],
      },
      transactionId: String,
      paidAt: Date,
      paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      bankDetails: {
        accountNumber: String,
        bankName: String,
        ifscCode: String,
      },
      chequeDetails: {
        chequeNumber: String,
        chequeDate: Date,
        bankName: String,
      },
    },
    adjustments: [
      {
        type: { type: String, enum: ['addition', 'deduction'] },
        category: String,
        amount: Number,
        reason: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    approvals: {
      generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      generatedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rejectedAt: Date,
      rejectionReason: String,
    },
    remarks: String,
    isLocked: {
      type: Boolean,
      default: false,
    },
    revision: {
      type: Number,
      default: 1,
    },
    previousVersions: [
      {
        revision: Number,
        data: mongoose.Schema.Types.Mixed,
        changedAt: Date,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
payrollSchema.index({ guard: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ 'payment.paidAt': -1 });
payrollSchema.index({ createdAt: -1 });

// Virtuals
payrollSchema.virtual('periodLabel').get(function () {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[this.month - 1]} ${this.year}`;
});

payrollSchema.virtual('isPaid').get(function () {
  return this.status === PAYROLL_STATUS.PAID;
});

// Pre-save middleware
payrollSchema.pre('save', async function (next) {
  // Generate payroll ID
  if (!this.payrollId) {
    const count = await this.constructor.countDocuments();
    this.payrollId = `PAY-${this.year}${String(this.month).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
  }

  // Set period dates
  if (!this.period.startDate) {
    this.period.startDate = new Date(this.year, this.month - 1, 1);
  }
  if (!this.period.endDate) {
    this.period.endDate = new Date(this.year, this.month, 0);
  }

  // Calculate gross salary
  const earnings = this.earnings;
  this.grossSalary =
    (earnings.basicSalary || 0) +
    (earnings.hra || 0) +
    (earnings.travelAllowance || 0) +
    (earnings.foodAllowance || 0) +
    (earnings.medicalAllowance || 0) +
    (earnings.specialAllowance || 0) +
    (earnings.overtimePay || 0) +
    (earnings.bonus || 0) +
    (earnings.incentive || 0) +
    (earnings.arrears || 0) +
    (earnings.otherEarnings || 0);

  // Calculate total deductions
  const deductions = this.deductions;
  this.totalDeductions =
    (deductions.pf || 0) +
    (deductions.esi || 0) +
    (deductions.professionalTax || 0) +
    (deductions.incomeTax || 0) +
    (deductions.loanDeduction || 0) +
    (deductions.advanceDeduction || 0) +
    (deductions.absentDeduction || 0) +
    (deductions.lateDeduction || 0) +
    (deductions.uniformDeduction || 0) +
    (deductions.otherDeductions || 0);

  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;

  next();
});

// Static methods
payrollSchema.statics.getByPeriod = function (month, year, options = {}) {
  const query = { month, year };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('guard', 'guardId firstName lastName designation bankDetails')
    .populate('createdBy', 'name email')
    .populate('payment.paidBy', 'name email')
    .sort({ createdAt: -1 });
};

payrollSchema.statics.getGuardPayrollHistory = function (guardId, limit = 12) {
  return this.find({ guard: guardId })
    .sort({ year: -1, month: -1 })
    .limit(limit)
    .select('payrollId month year grossSalary netSalary status payment.paidAt');
};

payrollSchema.statics.getPendingPayrolls = function () {
  return this.find({ 
    status: { $in: [PAYROLL_STATUS.DRAFT, PAYROLL_STATUS.PENDING] } 
  })
    .populate('guard', 'guardId firstName lastName designation')
    .sort({ year: -1, month: -1 });
};

payrollSchema.statics.getPayrollSummary = async function (month, year) {
  const summary = await this.aggregate([
    { $match: { month, year } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalGross: { $sum: '$grossSalary' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalNet: { $sum: '$netSalary' },
      },
    },
  ]);

  const totals = await this.aggregate([
    { $match: { month, year } },
    {
      $group: {
        _id: null,
        totalPayrolls: { $sum: 1 },
        totalGrossSalary: { $sum: '$grossSalary' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalNetSalary: { $sum: '$netSalary' },
        avgNetSalary: { $avg: '$netSalary' },
        totalOvertimeHours: { $sum: '$attendance.overtimeHours' },
        totalOvertimePay: { $sum: '$earnings.overtimePay' },
      },
    },
  ]);

  return {
    byStatus: summary,
    totals: totals[0] || {},
  };
};

payrollSchema.statics.getDashboardStats = async function (year) {
  const monthlyStats = await this.aggregate([
    { $match: { year } },
    {
      $group: {
        _id: '$month',
        totalPayroll: { $sum: '$netSalary' },
        totalEmployees: { $sum: 1 },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', PAYROLL_STATUS.PAID] }, 1, 0] },
        },
        pendingCount: {
          $sum: { $cond: [{ $in: ['$status', [PAYROLL_STATUS.DRAFT, PAYROLL_STATUS.PENDING]] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return monthlyStats;
};

payrollSchema.statics.bulkUpdateStatus = function (payrollIds, status, userId) {
  return this.updateMany(
    { _id: { $in: payrollIds } },
    {
      $set: {
        status,
        updatedBy: userId,
        ...(status === PAYROLL_STATUS.PAID && { 'payment.paidAt': new Date() }),
      },
    }
  );
};

// Instance methods
payrollSchema.methods.verify = async function (userId) {
  if (this.status !== PAYROLL_STATUS.PENDING) {
    throw new Error('Only pending payrolls can be verified');
  }
  
  this.status = PAYROLL_STATUS.VERIFIED;
  this.approvals.verifiedBy = userId;
  this.approvals.verifiedAt = new Date();
  this.updatedBy = userId;
  
  return this.save();
};

payrollSchema.methods.approve = async function (userId) {
  if (this.status !== PAYROLL_STATUS.VERIFIED) {
    throw new Error('Only verified payrolls can be approved');
  }
  
  this.status = PAYROLL_STATUS.APPROVED;
  this.approvals.approvedBy = userId;
  this.approvals.approvedAt = new Date();
  this.updatedBy = userId;
  
  return this.save();
};

payrollSchema.methods.reject = async function (reason, userId) {
  this.status = PAYROLL_STATUS.CANCELLED;
  this.approvals.rejectedBy = userId;
  this.approvals.rejectedAt = new Date();
  this.approvals.rejectionReason = reason;
  this.updatedBy = userId;
  
  return this.save();
};

payrollSchema.methods.markAsPaid = async function (paymentDetails, userId) {
  if (this.status !== PAYROLL_STATUS.APPROVED) {
    throw new Error('Only approved payrolls can be marked as paid');
  }
  
  this.status = PAYROLL_STATUS.PAID;
  this.payment = {
    ...this.payment,
    ...paymentDetails,
    paidAt: new Date(),
    paidBy: userId,
  };
  this.isLocked = true;
  this.updatedBy = userId;
  
  return this.save();
};

payrollSchema.methods.addAdjustment = async function (adjustment, userId) {
  if (this.isLocked) {
    throw new Error('Cannot modify locked payroll');
  }
  
  this.adjustments.push({
    ...adjustment,
    addedBy: userId,
    addedAt: new Date(),
  });
  
  // Update earnings or deductions based on adjustment type
  if (adjustment.type === 'addition') {
    this.earnings.otherEarnings = (this.earnings.otherEarnings || 0) + adjustment.amount;
  } else {
    this.deductions.otherDeductions = (this.deductions.otherDeductions || 0) + adjustment.amount;
  }
  
  this.updatedBy = userId;
  return this.save();
};

payrollSchema.methods.createRevision = async function (reason, userId) {
  // Store current version
  this.previousVersions.push({
    revision: this.revision,
    data: {
      earnings: this.earnings.toObject(),
      deductions: this.deductions.toObject(),
      grossSalary: this.grossSalary,
      totalDeductions: this.totalDeductions,
      netSalary: this.netSalary,
    },
    changedAt: new Date(),
    changedBy: userId,
    reason,
  });
  
  this.revision += 1;
  this.updatedBy = userId;
  
  return this.save();
};

payrollSchema.methods.generatePayslip = function () {
  return {
    payrollId: this.payrollId,
    period: this.periodLabel,
    employee: {
      id: this.guard.guardId,
      name: `${this.guard.firstName} ${this.guard.lastName}`,
    },
    attendance: this.attendance,
    earnings: this.earnings,
    deductions: this.deductions,
    grossSalary: this.grossSalary,
    totalDeductions: this.totalDeductions,
    netSalary: this.netSalary,
    payment: this.payment,
    generatedAt: new Date(),
  };
};

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll