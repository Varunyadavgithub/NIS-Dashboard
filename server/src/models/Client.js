import mongoose from "mongoose";
import { CLIENT_TYPES, PAYMENT_STATUS } from "../config/constants.js";

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: Object.values(CLIENT_TYPES),
      required: [true, "Client type is required"],
    },
    logo: String,
    contactPerson: {
      name: {
        type: String,
        required: [true, "Contact person name is required"],
      },
      designation: String,
      phone: {
        type: String,
        required: [true, "Contact phone is required"],
      },
      alternatePhone: String,
      email: String,
    },
    additionalContacts: [
      {
        name: String,
        designation: String,
        phone: String,
        email: String,
      },
    ],
    address: {
      street: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
      sameAsAddress: { type: Boolean, default: true },
    },
    locations: [
      {
        name: String,
        address: String,
        city: String,
        guardsRequired: Number,
        shifts: [String],
      },
    ],
    gstNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    panNumber: String,
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      accountHolderName: String,
    },
    guardsRequired: {
      type: Number,
      required: [true, "Guards required is mandatory"],
      min: [1, "At least 1 guard required"],
    },
    guardsDeployed: {
      type: Number,
      default: 0,
    },
    contract: {
      startDate: {
        type: Date,
        required: [true, "Contract start date is required"],
      },
      endDate: {
        type: Date,
        required: [true, "Contract end date is required"],
      },
      renewalDate: Date,
      documentUrl: String,
      terms: String,
      autoRenewal: { type: Boolean, default: false },
    },
    billing: {
      type: {
        type: String,
        enum: ["monthly", "quarterly", "yearly", "custom"],
        default: "monthly",
      },
      ratePerGuard: Number,
      monthlyRate: {
        type: Number,
        required: [true, "Monthly rate is required"],
      },
      billingDay: { type: Number, default: 1, min: 1, max: 28 },
      paymentTerms: { type: Number, default: 30 }, // Days
      gstApplicable: { type: Boolean, default: true },
      gstRate: { type: Number, default: 18 },
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    paymentHistory: [
      {
        amount: Number,
        date: Date,
        mode: {
          type: String,
          enum: ["cash", "cheque", "bank_transfer", "upi", "other"],
        },
        reference: String,
        remarks: String,
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "terminated"],
      default: "active",
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
      },
    ],
    requirements: {
      uniformRequired: { type: Boolean, default: true },
      weaponsRequired: { type: Boolean, default: false },
      vehicleRequired: { type: Boolean, default: false },
      specialTraining: [String],
      minimumExperience: Number,
      ageRange: {
        min: Number,
        max: Number,
      },
      other: String,
    },
    documents: [
      {
        name: String,
        type: String,
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
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
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
clientSchema.index({ clientId: 1 });
clientSchema.index({ name: "text", "contactPerson.name": "text" });
clientSchema.index({ type: 1, status: 1 });
clientSchema.index({ "address.city": 1, "address.state": 1 });
clientSchema.index({ "contract.endDate": 1 });
clientSchema.index({ paymentStatus: 1 });
clientSchema.index({ createdAt: -1 });

// Virtuals
clientSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  if (!addr) return "";
  return [addr.street, addr.landmark, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(", ");
});

clientSchema.virtual("isContractExpiring").get(function () {
  if (!this.contract?.endDate) return false;
  const daysUntilExpiry = Math.ceil(
    (new Date(this.contract.endDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
});

clientSchema.virtual("isContractExpired").get(function () {
  if (!this.contract?.endDate) return false;
  return new Date(this.contract.endDate) < new Date();
});

clientSchema.virtual("guardsFulfillmentRate").get(function () {
  if (!this.guardsRequired) return 0;
  return Math.round((this.guardsDeployed / this.guardsRequired) * 100);
});

// Pre-save middleware - Generate client ID
clientSchema.pre("save", async function (next) {
  if (!this.clientId) {
    const prefix =
      this.type === "company" ? "CMP" : this.type === "society" ? "SOC" : "IND";
    const count = await this.constructor.countDocuments({ type: this.type });
    this.clientId = `${prefix}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Pre-save middleware - Track status changes
clientSchema.pre("save", function (next) {
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
clientSchema.statics.getExpiringContracts = function (days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: "active",
    "contract.endDate": {
      $gte: new Date(),
      $lte: futureDate,
    },
  });
};

clientSchema.statics.getStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$billing.monthlyRate" },
        totalGuardsRequired: { $sum: "$guardsRequired" },
        totalGuardsDeployed: { $sum: "$guardsDeployed" },
      },
    },
  ]);
};

const Client = mongoose.model("Client", clientSchema);

export default Client;
