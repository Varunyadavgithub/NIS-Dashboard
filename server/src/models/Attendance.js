import mongoose from "mongoose";
import { ATTENDANCE_STATUS } from "../config/constants.js";

const attendanceSchema = new mongoose.Schema(
  {
    guard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guard",
      required: [true, "Guard is required"],
    },
    deployment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    shift: {
      type: String,
      enum: ["day", "evening", "night"],
    },
    checkIn: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      photo: String,
      method: {
        type: String,
        enum: ["manual", "biometric", "app", "qr"],
        default: "manual",
      },
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    checkOut: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      photo: String,
      method: {
        type: String,
        enum: ["manual", "biometric", "app", "qr"],
        default: "manual",
      },
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    overtime: {
      hours: { type: Number, default: 0 },
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: Date,
    },
    breaks: [
      {
        startTime: Date,
        endTime: Date,
        duration: Number, // in minutes
        reason: String,
      },
    ],
    leaveType: {
      type: String,
      enum: ["sick", "casual", "earned", "unpaid", "emergency", "other"],
    },
    leaveReason: String,
    leaveApproved: {
      type: Boolean,
      default: false,
    },
    leaveApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lateReason: String,
    earlyLeaveReason: String,
    remarks: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    isLocked: {
      type: Boolean,
      default: false,
    },
    corrections: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index to prevent duplicate attendance
attendanceSchema.index({ guard: 1, date: 1, shift: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ guard: 1, date: -1 });
attendanceSchema.index({ client: 1, date: -1 });
attendanceSchema.index({ status: 1, date: -1 });
attendanceSchema.index({ deployment: 1, date: -1 });

// Virtuals
attendanceSchema.virtual("isLate").get(function () {
  return this.status === ATTENDANCE_STATUS.LATE;
});

attendanceSchema.virtual("totalBreakTime").get(function () {
  if (!this.breaks || this.breaks.length === 0) return 0;
  return this.breaks.reduce((total, b) => total + (b.duration || 0), 0);
});

attendanceSchema.virtual("netWorkingHours").get(function () {
  return Math.max(0, this.hoursWorked - this.totalBreakTime / 60);
});

// Pre-save middleware - Calculate hours worked
attendanceSchema.pre("save", function (next) {
  if (this.checkIn?.time && this.checkOut?.time) {
    const checkIn = new Date(this.checkIn.time);
    const checkOut = new Date(this.checkOut.time);
    const diffMs = checkOut - checkIn;
    const hours = diffMs / (1000 * 60 * 60);
    this.hoursWorked = Math.round(hours * 100) / 100;

    // Calculate overtime (assuming 8-hour standard shift)
    const standardHours = 8;
    if (hours > standardHours) {
      this.overtime.hours = Math.round((hours - standardHours) * 100) / 100;
    }
  }
  next();
});

// Static methods
attendanceSchema.statics.getByDateRange = function (
  startDate,
  endDate,
  filters = {},
) {
  const query = {
    date: { $gte: startDate, $lte: endDate },
    ...filters,
  };
  return this.find(query).populate("guard client").sort({ date: -1 });
};

attendanceSchema.statics.getGuardAttendance = function (guardId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return this.find({
    guard: guardId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });
};

attendanceSchema.statics.getStats = async function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalHours: { $sum: "$hoursWorked" },
        totalOvertime: { $sum: "$overtime.hours" },
      },
    },
  ]);
};

attendanceSchema.statics.getMonthlyReport = async function (
  guardId,
  month,
  year,
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const attendance = await this.find({
    guard: guardId,
    date: { $gte: startDate, $lte: endDate },
  });

  const stats = {
    totalDays: endDate.getDate(),
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    totalHours: 0,
    totalOvertime: 0,
  };

  attendance.forEach((record) => {
    stats[record.status]++;
    stats.totalHours += record.hoursWorked || 0;
    stats.totalOvertime += record.overtime?.hours || 0;
  });

  return stats;
};

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
