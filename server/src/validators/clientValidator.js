import Joi from 'joi';
import { CLIENT_STATUS } from '../config/constants.js';

const addressSchema = Joi.object({
  street: Joi.string().trim().allow(''),
  city: Joi.string().trim(),
  district: Joi.string().trim().allow(''),
  state: Joi.string().trim(),
  pincode: Joi.string().pattern(/^\d{6}$/).allow(''),
  landmark: Joi.string().trim().allow(''),
});

const siteSchema = Joi.object({
  name: Joi.string().required().trim(),
  address: addressSchema,
  contactPerson: Joi.object({
    name: Joi.string().trim(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/),
    email: Joi.string().email().lowercase(),
    designation: Joi.string().trim(),
  }),
  guardsRequired: Joi.number().integer().min(0).default(1),
  shifts: Joi.array().items(Joi.object({
    name: Joi.string().valid('day', 'night', 'general', 'rotational'),
    startTime: Joi.string(),
    endTime: Joi.string(),
    guardsNeeded: Joi.number().integer().min(1),
  })),
  isActive: Joi.boolean().default(true),
  coordinates: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
  }),
  specialInstructions: Joi.string().allow(''),
});

export const createClientSchema = {
  body: Joi.object({
    companyName: Joi.string().required().trim()
      .messages({ 'string.empty': 'Company name is required' }),
    tradeName: Joi.string().trim().allow(''),
    industryType: Joi.string().valid(
      'manufacturing', 'it_software', 'healthcare', 'education', 'retail',
      'hospitality', 'real_estate', 'construction', 'logistics', 'banking',
      'government', 'other'
    ),
    gstNumber: Joi.string().uppercase().pattern(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    ).allow(''),
    panNumber: Joi.string().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).allow(''),
    cinNumber: Joi.string().allow(''),
    
    contactPerson: Joi.object({
      name: Joi.string().required().trim(),
      designation: Joi.string().trim(),
      phone: Joi.string().required().pattern(/^[6-9]\d{9}$/),
      alternatePhone: Joi.string().pattern(/^[6-9]\d{9}$/).allow(''),
      email: Joi.string().required().email().lowercase(),
    }).required(),
    
    registeredAddress: addressSchema.keys({
      city: Joi.string().required().trim(),
      state: Joi.string().required().trim(),
    }).required(),
    
    sites: Joi.array().items(siteSchema).min(1),
    
    contract: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref('startDate')),
      renewalDate: Joi.date(),
      value: Joi.number().min(0),
      billingCycle: Joi.string().valid('weekly', 'biweekly', 'monthly', 'quarterly'),
      paymentTerms: Joi.number().integer().min(0),
      autoRenewal: Joi.boolean(),
      documentPath: Joi.string(),
    }).required(),
    
    billing: Joi.object({
      ratePerGuard: Joi.number().min(0),
      ratePerHour: Joi.number().min(0),
      overtimeRate: Joi.number().min(0),
      billingType: Joi.string().valid('per_guard', 'per_hour', 'fixed', 'custom'),
      gstApplicable: Joi.boolean(),
      gstRate: Joi.number().min(0).max(100),
      tdsApplicable: Joi.boolean(),
      tdsRate: Joi.number().min(0).max(100),
    }),
    
    bankDetails: Joi.object({
      accountName: Joi.string().trim(),
      accountNumber: Joi.string().trim(),
      bankName: Joi.string().trim(),
      branchName: Joi.string().trim(),
      ifscCode: Joi.string().uppercase().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    }),
    
    status: Joi.string().valid(...Object.values(CLIENT_STATUS)).default('active'),
    remarks: Joi.string().allow(''),
  }),
};

export const updateClientSchema = {
  body: Joi.object({
    companyName: Joi.string().trim(),
    tradeName: Joi.string().trim().allow(''),
    industryType: Joi.string().valid(
      'manufacturing', 'it_software', 'healthcare', 'education', 'retail',
      'hospitality', 'real_estate', 'construction', 'logistics', 'banking',
      'government', 'other'
    ),
    gstNumber: Joi.string().uppercase().pattern(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    ).allow('', null),
    panNumber: Joi.string().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).allow('', null),
    cinNumber: Joi.string().allow('', null),
    contactPerson: Joi.object({
      name: Joi.string().trim(),
      designation: Joi.string().trim(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/),
      alternatePhone: Joi.string().pattern(/^[6-9]\d{9}$/).allow('', null),
      email: Joi.string().email().lowercase(),
    }),
    registeredAddress: addressSchema,
    contract: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      renewalDate: Joi.date(),
      value: Joi.number().min(0),
      billingCycle: Joi.string().valid('weekly', 'biweekly', 'monthly', 'quarterly'),
      paymentTerms: Joi.number().integer().min(0),
      autoRenewal: Joi.boolean(),
      documentPath: Joi.string(),
    }),
    billing: Joi.object({
      ratePerGuard: Joi.number().min(0),
      ratePerHour: Joi.number().min(0),
      overtimeRate: Joi.number().min(0),
      billingType: Joi.string().valid('per_guard', 'per_hour', 'fixed', 'custom'),
      gstApplicable: Joi.boolean(),
      gstRate: Joi.number().min(0).max(100),
      tdsApplicable: Joi.boolean(),
      tdsRate: Joi.number().min(0).max(100),
    }),
    bankDetails: Joi.object({
      accountName: Joi.string().trim(),
      accountNumber: Joi.string().trim(),
      bankName: Joi.string().trim(),
      branchName: Joi.string().trim(),
      ifscCode: Joi.string().uppercase().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    }),
    status: Joi.string().valid(...Object.values(CLIENT_STATUS)),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const addSiteSchema = {
  body: siteSchema,
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const getClientSchema = {
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const listClientsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('clientId', 'companyName', 'createdAt', 'contract.endDate').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().trim().allow(''),
    status: Joi.string().valid(...Object.values(CLIENT_STATUS)),
    industryType: Joi.string(),
    contractExpiring: Joi.boolean(),
  }),
};