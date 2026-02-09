import Joi from 'joi';
import { USER_ROLES } from '../config/constants.js';

const permissionSchema = Joi.object({
  create: Joi.boolean(),
  read: Joi.boolean(),
  update: Joi.boolean(),
  delete: Joi.boolean(),
  approve: Joi.boolean(),
  view: Joi.boolean(),
  export: Joi.boolean(),
});

export const createUserSchema = {
  body: Joi.object({
    name: Joi.string().required().min(2).max(100).trim(),
    email: Joi.string().required().email().lowercase().trim(),
    password: Joi.string().required().min(6).max(50),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/),
    role: Joi.string().valid(...Object.values(USER_ROLES)).default('viewer'),
    permissions: Joi.object({
      users: permissionSchema,
      guards: permissionSchema,
      clients: permissionSchema,
      deployments: permissionSchema,
      attendance: permissionSchema,
      payroll: permissionSchema,
      reports: permissionSchema,
      settings: permissionSchema,
    }),
    isActive: Joi.boolean().default(true),
  }),
};

export const updateUserSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    email: Joi.string().email().lowercase().trim(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).allow('', null),
    role: Joi.string().valid(...Object.values(USER_ROLES)),
    permissions: Joi.object({
      users: permissionSchema,
      guards: permissionSchema,
      clients: permissionSchema,
      deployments: permissionSchema,
      attendance: permissionSchema,
      payroll: permissionSchema,
      reports: permissionSchema,
      settings: permissionSchema,
    }),
    isActive: Joi.boolean(),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const getUserSchema = {
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};

export const listUsersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'email', 'role', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().trim().allow(''),
    role: Joi.string().valid(...Object.values(USER_ROLES)),
    isActive: Joi.boolean(),
  }),
};

export const updatePermissionsSchema = {
  body: Joi.object({
    permissions: Joi.object({
      users: permissionSchema,
      guards: permissionSchema,
      clients: permissionSchema,
      deployments: permissionSchema,
      attendance: permissionSchema,
      payroll: permissionSchema,
      reports: permissionSchema,
      settings: permissionSchema,
    }).required(),
  }),
  params: Joi.object({
    id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  }),
};