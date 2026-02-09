import Joi from 'joi';
import { DEPLOYMENT_STATUS, SHIFT_TYPES } from '../config/constants.js';

export const createDeploymentSchema = {
  body: Joi.object({
    guard: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
      .messages({ 'string.empty': 'Guard is required' }),
    client: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
      .messages({ 'string.empty': 'Client is required' }),
    site: Joi.object({
      siteId: Joi.string(),
      name: Joi.string().required(),
      address: Joi.string(),
    }).required(),
    shift: Joi.object({
      type: Joi.string().valid(...Object.values(SHIFT_TYPES)).default('general'),
      name: Joi.string(),
      startTime: Joi.string().required().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: Joi.string().required().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      breakDuration: Joi.number().min(0).default(0),
    }).required(),
    schedule: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref('startDate')),
      workingDays: Joi.array().items(
        Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
      ),
      isRotational: Joi.boolean().default(false),
      rotationPattern: Joi.string(),
    }).required(),
    compensation: Joi.object({
      dailyRate: Joi.number().min(0),
      monthlyRate: Joi.number().min(0),
      overtimeRate: Joi.number().min(0),
      allowances: Joi.object({
        travel: Joi.number().min(0),
        food: Joi.number().min(0),
        night: Joi.number().min(0),
        hazard: Joi.number().min(0),
        other: Joi.number().min(0),
      }),
    }),
    duties: Joi.array().items(Joi.string()),
    specialInstructions: Joi.string().allow(''),
    reportingOfficer: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    remarks: Joi.string().allow(''),
  }),
};

export const updateDeploymentSchema = {
  body: Joi.object({
    site: Joi.object({
      siteId: Joi.string(),
      name: Joi.string(),
      address: Joi.string(),
    }),
    shift: Joi.object({
      type: Joi.string().valid(...Object.values(SHIFT_TYPES)),
      name: Joi.string(),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      breakDuration: Joi.number().min(0),
    }),
    schedule: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      workingDays: Joi.array().items(
        Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
      ),
      isRotational: Joi.boolean(),
      rotationPattern: Joi.string(),
    }),
    compensation: Joi.object({
      dailyRate: Joi.number().min(0),
      monthlyRate: Joi.number().min(0),
      overtimeRate: Joi.number().min(0),
      allowances: Joi.object({
        travel: Joi.number().min(0),
        food: Joi.number().min(0),
        night: Joi.number().min(0),
        hazard: Joi.number().min(0),
        other: Joi.number().min(0),
      }),
    }),
    duties: Joi.array().items(Joi.string()),
    specialInstructions: Joi.string().allow(''),
    reportingOfficer: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    status: Joi.string().valid(...Object.values(DEPLOYMENT_STATUS)),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const terminateDeploymentSchema = {
  body: Joi.object({
    reason: Joi.string().required(),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const getDeploymentSchema = {
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const listDeploymentsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('deploymentId', 'createdAt', 'schedule.startDate').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    guard: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    client: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    status: Joi.string().valid(...Object.values(DEPLOYMENT_STATUS)),
    shiftType: Joi.string().valid(...Object.values(SHIFT_TYPES)),
  }),
};