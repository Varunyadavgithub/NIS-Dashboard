import Joi from 'joi';
import { PAYROLL_STATUS, PAYMENT_METHODS } from '../config/constants.js';

export const generatePayrollSchema = {
  body: Joi.object({
    guard: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
      .messages({ 'string.empty': 'Guard is required' }),
    month: Joi.number().required().integer().min(1).max(12)
      .messages({ 'number.base': 'Month is required' }),
    year: Joi.number().required().integer().min(2000).max(2100)
      .messages({ 'number.base': 'Year is required' }),
    earnings: Joi.object({
      basicSalary: Joi.number().min(0),
      hra: Joi.number().min(0),
      travelAllowance: Joi.number().min(0),
      foodAllowance: Joi.number().min(0),
      medicalAllowance: Joi.number().min(0),
      specialAllowance: Joi.number().min(0),
      overtimePay: Joi.number().min(0),
      bonus: Joi.number().min(0),
      incentive: Joi.number().min(0),
      arrears: Joi.number().min(0),
      otherEarnings: Joi.number().min(0),
    }),
    deductions: Joi.object({
      pf: Joi.number().min(0),
      esi: Joi.number().min(0),
      professionalTax: Joi.number().min(0),
      incomeTax: Joi.number().min(0),
      loanDeduction: Joi.number().min(0),
      advanceDeduction: Joi.number().min(0),
      absentDeduction: Joi.number().min(0),
      lateDeduction: Joi.number().min(0),
      uniformDeduction: Joi.number().min(0),
      otherDeductions: Joi.number().min(0),
      remarks: Joi.string().allow(''),
    }),
    remarks: Joi.string().allow(''),
  }),
};

export const bulkGeneratePayrollSchema = {
  body: Joi.object({
    month: Joi.number().required().integer().min(1).max(12),
    year: Joi.number().required().integer().min(2000).max(2100),
    guards: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    allActiveGuards: Joi.boolean().default(false),
  }),
};

export const updatePayrollSchema = {
  body: Joi.object({
    earnings: Joi.object({
      basicSalary: Joi.number().min(0),
      hra: Joi.number().min(0),
      travelAllowance: Joi.number().min(0),
      foodAllowance: Joi.number().min(0),
      medicalAllowance: Joi.number().min(0),
      specialAllowance: Joi.number().min(0),
      overtimePay: Joi.number().min(0),
      bonus: Joi.number().min(0),
      incentive: Joi.number().min(0),
      arrears: Joi.number().min(0),
      otherEarnings: Joi.number().min(0),
    }),
    deductions: Joi.object({
      pf: Joi.number().min(0),
      esi: Joi.number().min(0),
      professionalTax: Joi.number().min(0),
      incomeTax: Joi.number().min(0),
      loanDeduction: Joi.number().min(0),
      advanceDeduction: Joi.number().min(0),
      absentDeduction: Joi.number().min(0),
      lateDeduction: Joi.number().min(0),
      uniformDeduction: Joi.number().min(0),
      otherDeductions: Joi.number().min(0),
      remarks: Joi.string().allow(''),
    }),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const addAdjustmentSchema = {
  body: Joi.object({
    type: Joi.string().required().valid('addition', 'deduction'),
    category: Joi.string().required(),
    amount: Joi.number().required().min(0),
    reason: Joi.string().required(),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const processPaymentSchema = {
  body: Joi.object({
    method: Joi.string().required().valid(...Object.values(PAYMENT_METHODS)),
    transactionId: Joi.string().when('method', {
      is: Joi.valid('bank_transfer', 'upi'),
      then: Joi.string().required(),
      otherwise: Joi.string().allow(''),
    }),
    bankDetails: Joi.object({
      accountNumber: Joi.string(),
      bankName: Joi.string(),
      ifscCode: Joi.string(),
    }),
    chequeDetails: Joi.object({
      chequeNumber: Joi.string(),
      chequeDate: Joi.date(),
      bankName: Joi.string(),
    }),
    remarks: Joi.string().allow(''),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const bulkProcessPaymentSchema = {
  body: Joi.object({
    payrollIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
    method: Joi.string().required().valid(...Object.values(PAYMENT_METHODS)),
    remarks: Joi.string().allow(''),
  }),
};

export const getPayrollSchema = {
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const listPayrollsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('payrollId', 'createdAt', 'netSalary').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    guard: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    month: Joi.number().integer().min(1).max(12),
    year: Joi.number().integer().min(2000).max(2100),
    status: Joi.string().valid(...Object.values(PAYROLL_STATUS)),
  }),
};

export const approvePayrollSchema = {
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const rejectPayrollSchema = {
  body: Joi.object({
    reason: Joi.string().required(),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};