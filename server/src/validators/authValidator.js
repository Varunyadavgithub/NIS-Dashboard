import Joi from 'joi';

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().required().min(2).max(100).trim()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
      }),
    email: Joi.string().required().email().lowercase().trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
      }),
    password: Joi.string().required().min(6).max(50)
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password'))
      .messages({
        'any.only': 'Passwords do not match',
      }),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/)
      .messages({
        'string.pattern.base': 'Please provide a valid Indian phone number',
      }),
    role: Joi.string().valid('admin', 'manager', 'accountant', 'supervisor', 'viewer'),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().required().email().lowercase().trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Password is required',
      }),
  }),
};

export const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().required().email().lowercase().trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
      }),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().required().min(6).max(50)
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
      }),
    confirmPassword: Joi.string().required().valid(Joi.ref('password'))
      .messages({
        'any.only': 'Passwords do not match',
      }),
  }),
  params: Joi.object({
    token: Joi.string().required(),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required()
      .messages({
        'string.empty': 'Current password is required',
      }),
    newPassword: Joi.string().required().min(6).max(50)
      .messages({
        'string.empty': 'New password is required',
        'string.min': 'Password must be at least 6 characters',
      }),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
      .messages({
        'any.only': 'Passwords do not match',
      }),
  }),
};