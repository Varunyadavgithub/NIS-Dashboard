import mongoose from 'mongoose';
import { ACTIVITY_TYPES, MODULES } from '../config/constants.js';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true,
    },
    module: {
      type: String,
      enum: Object.values(MODULES),
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      type: String,
      required: true,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      ip: String,
      userAgent: String,
      browser: String,
      os: String,
      device: String,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ moduleId: 1 });

// Static methods
activityLogSchema.statics.log = async function (logData) {
  try {
    return await this.create(logData);
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

activityLogSchema.statics.getUserActivity = function (userId, options = {}) {
  const query = { user: userId };
  
  if (options.module) {
    query.module = options.module;
  }
  
  if (options.action) {
    query.action = options.action;
  }
  
  if (options.startDate && options.endDate) {
    query.createdAt = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate),
    };
  }
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

activityLogSchema.statics.getModuleActivity = function (module, moduleId, limit = 20) {
  return this.find({ module, moduleId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

activityLogSchema.statics.getRecentActivity = function (limit = 50) {
  return this.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

activityLogSchema.statics.getActivityStats = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          action: '$action',
          module: '$module',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.module',
        actions: {
          $push: {
            action: '$_id.action',
            count: '$count',
          },
        },
        totalCount: { $sum: '$count' },
      },
    },
  ]);
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;