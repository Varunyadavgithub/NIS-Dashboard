import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'general',
        'company',
        'payroll',
        'attendance',
        'notifications',
        'security',
        'backup',
        'integration',
      ],
      default: 'general',
    },
    description: String,
    isEditable: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
settingsSchema.index({ key: 1 }, { unique: true });
settingsSchema.index({ category: 1 });

// Static methods
settingsSchema.statics.get = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

settingsSchema.statics.set = async function (key, value, userId, options = {}) {
  return this.findOneAndUpdate(
    { key },
    {
      value,
      updatedBy: userId,
      ...options,
    },
    { upsert: true, new: true }
  );
};

settingsSchema.statics.getByCategory = function (category) {
  return this.find({ category }).sort({ key: 1 });
};

settingsSchema.statics.getAll = function () {
  return this.find().sort({ category: 1, key: 1 });
};

settingsSchema.statics.bulkUpdate = async function (settings, userId) {
  const operations = settings.map((setting) => ({
    updateOne: {
      filter: { key: setting.key },
      update: {
        $set: {
          value: setting.value,
          updatedBy: userId,
        },
      },
      upsert: true,
    },
  }));
  
  return this.bulkWrite(operations);
};

// Default settings initialization
settingsSchema.statics.initializeDefaults = async function () {
  const defaults = [
    // Company Settings
    {
      key: 'company_name',
      value: 'Neha Industrial Security',
      category: 'company',
      description: 'Company name',
    },
    {
      key: 'company_address',
      value: '',
      category: 'company',
      description: 'Company address',
    },
    {
      key: 'company_phone',
      value: '',
      category: 'company',
      description: 'Company phone number',
    },
    {
      key: 'company_email',
      value: '',
      category: 'company',
      description: 'Company email',
    },
    {
      key: 'company_gst',
      value: '',
      category: 'company',
      description: 'Company GST number',
    },
    {
      key: 'company_pan',
      value: '',
      category: 'company',
      description: 'Company PAN number',
    },
    {
      key: 'company_logo',
      value: '',
      category: 'company',
      description: 'Company logo URL',
    },
    
    // Payroll Settings
    {
      key: 'payroll_cycle_day',
      value: 1,
      category: 'payroll',
      description: 'Day of month to generate payroll',
    },
    {
      key: 'pf_percentage',
      value: 12,
      category: 'payroll',
      description: 'PF contribution percentage',
    },
    {
      key: 'esi_percentage',
      value: 0.75,
      category: 'payroll',
      description: 'ESI contribution percentage',
    },
    {
      key: 'professional_tax',
      value: 200,
      category: 'payroll',
      description: 'Professional tax amount',
    },
    {
      key: 'overtime_rate_multiplier',
      value: 1.5,
      category: 'payroll',
      description: 'Overtime rate multiplier',
    },
    {
      key: 'late_deduction_per_day',
      value: 50,
      category: 'payroll',
      description: 'Late arrival deduction per day',
    },
    {
      key: 'absent_deduction_per_day',
      value: 0,
      category: 'payroll',
      description: 'Absent deduction per day (0 = auto calculate)',
    },
    
    // Attendance Settings
    {
      key: 'grace_period_minutes',
      value: 15,
      category: 'attendance',
      description: 'Grace period for late marking (minutes)',
    },
    {
      key: 'half_day_hours',
      value: 4,
      category: 'attendance',
      description: 'Minimum hours for half day',
    },
    {
      key: 'full_day_hours',
      value: 8,
      category: 'attendance',
      description: 'Standard working hours per day',
    },
    {
      key: 'weekly_off',
      value: 'sunday',
      category: 'attendance',
      description: 'Weekly off day',
    },
    {
      key: 'auto_checkout_time',
      value: '23:59',
      category: 'attendance',
      description: 'Auto checkout time if not checked out',
    },
    
    // Notification Settings
    {
      key: 'email_notifications',
      value: true,
      category: 'notifications',
      description: 'Enable email notifications',
    },
    {
      key: 'sms_notifications',
      value: false,
      category: 'notifications',
      description: 'Enable SMS notifications',
    },
    {
      key: 'attendance_reminder',
      value: true,
      category: 'notifications',
      description: 'Send attendance reminder',
    },
    {
      key: 'payroll_notification',
      value: true,
      category: 'notifications',
      description: 'Send payroll notifications',
    },
    {
      key: 'contract_expiry_reminder_days',
      value: 30,
      category: 'notifications',
      description: 'Days before contract expiry to send reminder',
    },
    
    // Security Settings
    {
      key: 'session_timeout_minutes',
      value: 480,
      category: 'security',
      description: 'Session timeout in minutes (8 hours)',
    },
    {
      key: 'max_login_attempts',
      value: 5,
      category: 'security',
      description: 'Maximum login attempts before lockout',
    },
    {
      key: 'password_expiry_days',
      value: 90,
      category: 'security',
      description: 'Password expiry in days',
    },
    {
      key: 'two_factor_auth',
      value: false,
      category: 'security',
      description: 'Enable two-factor authentication',
    },
    
    // General Settings
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      category: 'general',
      description: 'Date display format',
    },
    {
      key: 'time_format',
      value: '12h',
      category: 'general',
      description: 'Time display format (12h/24h)',
    },
    {
      key: 'currency',
      value: 'INR',
      category: 'general',
      description: 'Currency code',
    },
    {
      key: 'timezone',
      value: 'Asia/Kolkata',
      category: 'general',
      description: 'Timezone',
    },
    {
      key: 'financial_year_start',
      value: 4,
      category: 'general',
      description: 'Financial year start month (April)',
    },
  ];
  
  for (const setting of defaults) {
    await this.findOneAndUpdate(
      { key: setting.key },
      setting,
      { upsert: true, new: true }
    );
  }
  
  return defaults.length;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;