import mongoose from "mongoose";
import { SHIFT_TYPES } from "../config/constants.js";

const deploymentSchema = new mongoose.Schema(
  {
    deploymentId: {
      type: String,
      unique: true,
    },
    guard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guard",
      required: [true, "Guard is required"],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
    location: {
      name: {
        type: String,
        required: [true, "Location name is required"],
      },
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    post: {
      type: String,
      default: "General",
    },
    shift: {
      type: {
        type: String,
        enum: Object.values(SHIFT_TYPES),
        required: [true, "Shift type is required"],
      },
      startTime: {
        type: String,
        required: [true, "Shift start time is required"],
      },
      endTime: {
        type: String,
        required: [true, "Shift end time is required"],
      },
      breakTime: {
        start: String,
        end: String,
        duration: Number, // in minutes
      },
    },
    schedule: {
      type: String,
      enum: ["daily", "weekdays", "weekends", "custom"],
      default: "daily",
    },
    workingDays: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: Date,
    status: {
      type: String,
      enum: ["active", "inactive", "completed", "cancelled"],
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
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reliefGuard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guard",
    },
    specialInstructions: String,
    equipmentProvided: [
      {
        item: String,
        quantity: Number,
        issuedDate: Date,
        condition: String,
      },
    ],
    uniformProvided: {
      type: Boolean,
      default: false,
    },
    remarks: String,
    replacementHistory: [
      {
        previousGuard: { type: mongoose.Schema.Types.ObjectId, ref: "Guard" },
        replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Guard" },
        date: Date,
        reason: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

// Indexes
deploymentSchema.index({ deploymentId: 1 });
deploymentSchema.index({ guard: 1, status: 1 });
deploymentSchema.index({ client: 1, status: 1 });
deploymentSchema.index({ "shift.type": 1 });
deploymentSchema.index({ startDate: -1 });
deploymentSchema.index({ status: 1 });
deploymentSchema.index({ createdAt: -1 });

// Virtuals
deploymentSchema.virtual("isActive").get(function () {
  return this.status === "active";
});

deploymentSchema.virtual("shiftDuration").get(function () {
  if (!this.shift?.startTime || !this.shift?.endTime) return 0;

  const [startHour, startMin] = this.shift.startTime.split(":").map(Number);
  const [endHour, endMin] = this.shift.endTime.split(":").map(Number);

  let hours = endHour - startHour;
  let mins = endMin - startMin;

  if (hours < 0) hours += 24;
  if (mins < 0) {
    hours -= 1;
    mins += 60;
  }

  return hours + mins / 60;
});

// Pre-save middleware
deploymentSchema.pre("save", async function (next) {
  if (!this.deploymentId) {
    const count = await this.constructor.countDocuments();
    this.deploymentId = `DEP-${String(count + 1).padStart(6, "0")}`;
  }

  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.updatedBy,
      changedAt: new Date(),
    });
  }

  next();
});

// Post-save middleware - Update guard's current deployment
deploymentSchema.post("save", async function () {
  const Guard = mongoose.model("Guard");

  if (this.status === "active") {
    await Guard.findByIdAndUpdate(this.guard, {
      currentDeployment: this._id,
    });
  } else if (["completed", "cancelled", "inactive"].includes(this.status)) {
    await Guard.findByIdAndUpdate(this.guard, {
      currentDeployment: null,
    });
  }
});

// Static methods
deploymentSchema.statics.getActiveByClient = function (clientId) {
  return this.find({ client: clientId, status: "active" }).populate("guard");
};

deploymentSchema.statics.getActiveByGuard = function (guardId) {
  return this.findOne({ guard: guardId, status: "active" }).populate("client");
};

deploymentSchema.statics.getStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

const Deployment = mongoose.model("Deployment", deploymentSchema);

export default Deployment;
