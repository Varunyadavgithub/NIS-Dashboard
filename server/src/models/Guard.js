import mongoose from "mongoose";
import { GUARD_STATUS } from "../config/constants.js";

const guardSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Guard name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    photo: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    fatherName: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    permanentAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    aadharNumber: {
      type: String,
      required: [true, "Aadhar number is required"],
      unique: true,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      accountHolderName: String,
      branch: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    },
    height: Number, // in cm
    weight: Number, // in kg
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    previousEmployment: [
      {
        company: String,
        designation: String,
        duration: String,
        salary: Number,
        reasonForLeaving: String,
      },
    ],
    qualifications: [
      {
        degree: String,
        institution: String,
        year: Number,
        percentage: Number,
      },
    ],
    certifications: [
      {
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        documentUrl: String,
      },
    ],
    skills: [String],
    languages: [String],
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    salaryType: {
      type: String,
      enum: ["monthly", "daily", "hourly"],
      default: "monthly",
    },
    allowances: {
      hra: { type: Number, default: 0 },
      travel: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    confirmationDate: Date,
    terminationDate: Date,
    terminationReason: String,
    status: {
      type: String,
      enum: Object.values(GUARD_STATUS),
      default: GUARD_STATUS.ACTIVE,
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
      },
    ],
    currentDeployment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
    },
    documents: [
      {
        name: String,
        type: {
          type: String,
          enum: ["aadhar", "pan", "photo", "certificate", "other"],
        },
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notes: [
      {
        content: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    policeVerification: {
      status: {
        type: String,
        enum: ["pending", "verified", "failed", "not_applicable"],
        default: "pending",
      },
      verifiedAt: Date,
      documentUrl: String,
      remarks: String,
    },
    medicalFitness: {
      status: {
        type: String,
        enum: ["fit", "unfit", "pending"],
        default: "pending",
      },
      lastCheckup: Date,
      nextCheckup: Date,
      documentUrl: String,
      remarks: String,
    },
    training: [
      {
        name: String,
        completedAt: Date,
        certificateUrl: String,
        score: Number,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
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

// Indexes
guardSchema.index({ employeeId: 1 });
guardSchema.index({ name: "text", phone: "text", email: "text" });
guardSchema.index({ status: 1 });
guardSchema.index({ aadharNumber: 1 });
guardSchema.index({ "address.city": 1, "address.state": 1 });
guardSchema.index({ salary: 1 });
guardSchema.index({ joiningDate: -1 });
guardSchema.index({ createdAt: -1 });
guardSchema.index({ currentDeployment: 1 });

// Virtuals
guardSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  if (!addr) return "";
  return [addr.street, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(", ");
});

guardSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

guardSchema.virtual("tenure").get(function () {
  const start = this.joiningDate;
  if (!start) return 0;
  const end = this.terminationDate || new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return months;
});

guardSchema.virtual("grossSalary").get(function () {
  const allowances = this.allowances || {};
  return (
    this.salary +
    (allowances.hra || 0) +
    (allowances.travel || 0) +
    (allowances.food || 0) +
    (allowances.medical || 0) +
    (allowances.other || 0)
  );
});

guardSchema.virtual("netSalary").get(function () {
  const deductions = this.deductions || {};
  const totalDeductions =
    (deductions.pf || 0) +
    (deductions.esi || 0) +
    (deductions.tax || 0) +
    (deductions.other || 0);
  return this.grossSalary - totalDeductions;
});

// Pre-save middleware - Generate employee ID
guardSchema.pre("save", async function (next) {
  if (!this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `GRD-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Pre-save middleware - Track status changes
guardSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.updatedBy,
      changedAt: new Date(),
    });
  }
  next();
});

// Static methods
guardSchema.statics.getAvailable = function () {
  return this.find({
    status: GUARD_STATUS.ACTIVE,
    currentDeployment: null,
  });
};

guardSchema.statics.getByStatus = function (status) {
  return this.find({ status });
};

guardSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgSalary: { $avg: "$salary" },
      },
    },
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      avgSalary: Math.round(stat.avgSalary),
    };
    return acc;
  }, {});
};

// Instance methods
guardSchema.methods.updateRating = function (newRating) {
  const totalScore = this.rating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.rating = Math.round((totalScore / this.totalRatings) * 10) / 10;
  return this.save();
};

const Guard = mongoose.model("Guard", guardSchema);

export default Guard;
