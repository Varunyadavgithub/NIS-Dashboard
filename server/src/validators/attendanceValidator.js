import Joi from 'joi';
import { ATTENDANCE_STATUS, LEAVE_TYPES } from '../config/constants.js';

const locationSchema = Joi.object({
  latitude: Joi.number(),
  longitude: Joi.number(),
  address: Joi.string().allow(''),
});

export const markAttendanceSchema = {
  body: Joi.object({
    guard: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
      .messages({ 'string.empty': 'Guard is required' }),
    client: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    deployment: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    date: Joi.date().required(),
    status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)).default('present'),
    shift: Joi.object({
      type: Joi.string().valid('day', 'night', 'general', 'rotational'),
      scheduledStart: Joi.string(),
      scheduledEnd: Joi.string(),
    }),
    checkIn: Joi.object({
      time: Joi.date(),
      location: locationSchema,
      method: Joi.string().valid('manual', 'biometric', 'geofence', 'qr_code', 'app'),
      photo: Joi.string(),
      remarks: Joi.string().allow(''),
    }),
    checkOut: Joi.object({
      time: Joi.date(),
      location: locationSchema,
      method: Joi.string().valid('manual', 'biometric', 'geofence', 'qr_code', 'app'),
      photo: Joi.string(),
      remarks: Joi.string().allow(''),
    }),
    workHours: Joi.object({
      scheduled: Joi.number().min(0),
    }),
    leave: Joi.object({
      type: Joi.string().valid(...Object.values(LEAVE_TYPES)),
      reason: Joi.string(),
      document: Joi.string(),
    }),
    site: Joi.object({
      name: Joi.string(),
      location: Joi.string(),
    }),
    remarks: Joi.string().allow(''),
  }),
};

export const updateAttendanceSchema = {
  body: Joi.object({
    status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)),
    checkIn: Joi.object({
      time: Joi.date(),
      location: locationSchema,
      method: Joi.string().valid('manual', 'biometric', 'geofence', 'qr_code', 'app'),
      photo: Joi.string(),
      remarks: Joi.string().allow(''),
    }),
    checkOut: Joi.object({
      time: Joi.date(),
      location: locationSchema,
      method: Joi.string().valid('manual', 'biometric', 'geofence', 'qr_code', 'app'),
      photo: Joi.string(),
      remarks: Joi.string().allow(''),
    }),
    breaks: Joi.array().items(Joi.object({
      startTime: Joi.date(),
      endTime: Joi.date(),
      duration: Joi.number(),
      type: Joi.string().valid('lunch', 'tea', 'personal', 'other'),
    })),
    lateDetails: Joi.object({
      isLate: Joi.boolean(),
      lateBy: Joi.number(),
      reason: Joi.string(),
      isExcused: Joi.boolean(),
    }),
    earlyLeaveDetails: Joi.object({
      isEarlyLeave: Joi.boolean(),
      earlyBy: Joi.number(),
      reason: Joi.string(),
      isApproved: Joi.boolean(),
    }),
    overtimeDetails: Joi.object({
      hours: Joi.number(),
      reason: Joi.string(),
      isApproved: Joi.boolean(),
      rate: Joi.number(),
    }),
    verification: Joi.object({
      isVerified: Joi.boolean(),
      remarks: Joi.string(),
    }),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const bulkAttendanceSchema = {
  body: Joi.object({
    date: Joi.date().required(),
    attendances: Joi.array().items(Joi.object({
      guard: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
      status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)).required(),
      client: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      checkIn: Joi.object({
        time: Joi.date(),
      }),
      checkOut: Joi.object({
        time: Joi.date(),
      }),
      remarks: Joi.string().allow(''),
    })).min(1).required(),
  }),
};

export const getAttendanceSchema = {
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const listAttendanceSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('date', 'createdAt').default('date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    guard: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    client: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)),
    date: Joi.date(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000).max(2100),
    verified: Joi.boolean(),
  }),
};

export const checkInSchema = {
  body: Joi.object({
    guard: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    time: Joi.date().default(Date.now),
    location: locationSchema,
    method: Joi.string().valid('manual', 'biometric', 'geofence', 'qr_code', 'app').default('manual'),
    photo: Joi.string(),
    remarks: Joi.string().allow(''),
  }),
};

export const checkOutSchema = {
  body: Joi.object({
    time: Joi.date().default(Date.now),
    location: locationSchema,
    method: Joi.string().valid('manual', 'biometric', 'geofence', 'qr_code', 'app').default('manual'),
    photo: Joi.string(),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};