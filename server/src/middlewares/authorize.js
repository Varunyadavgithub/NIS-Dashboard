import ApiError from '../utils/ApiError.js';
import { ROLE_PERMISSIONS } from '../config/constants.js';

/**
 * Authorize by roles
 * @param  {...string} roles - Allowed roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please log in to access this resource');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

/**
 * Authorize by permissions (user needs at least one of the permissions)
 * @param  {...string} permissions - Required permissions
 */
export const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please log in to access this resource');
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw ApiError.forbidden(
        'Access denied. You do not have permission to perform this action.'
      );
    }

    next();
  };
};

/**
 * Authorize by permissions (user needs ALL of the permissions)
 * @param  {...string} permissions - Required permissions
 */
export const authorizeAll = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please log in to access this resource');
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasAllPermissions = permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw ApiError.forbidden(
        'Access denied. You do not have all required permissions.'
      );
    }

    next();
  };
};

/**
 * Check if user is owner of resource or has admin role
 * @param {string} resourceUserField - Field name containing user ID in resource
 */
export const ownerOrAdmin = (resourceUserField = 'createdBy') => {
  return async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please log in to access this resource');
    }

    const isAdmin = ['super_admin', 'admin'].includes(req.user.role);
    
    // Admin can access any resource
    if (isAdmin) {
      return next();
    }

    // Get resource from previous middleware or params
    const resourceId = req.params.id;
    
    if (req.resource) {
      const resourceUserId = req.resource[resourceUserField]?.toString();
      const isOwner = resourceUserId === req.user._id.toString();
      
      if (!isOwner) {
        throw ApiError.forbidden('You are not authorized to access this resource');
      }
    }

    next();
  };
};

/**
 * Check if user can modify another user (can't modify users with higher role)
 */
export const canModifyUser = () => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please log in');
    }

    const roleHierarchy = {
      super_admin: 6,
      admin: 5,
      manager: 4,
      supervisor: 3,
      accountant: 2,
      staff: 1,
    };

    const targetRole = req.body.role || req.targetUser?.role;
    
    if (targetRole) {
      const userLevel = roleHierarchy[req.user.role] || 0;
      const targetLevel = roleHierarchy[targetRole] || 0;

      if (targetLevel >= userLevel && req.user.role !== 'super_admin') {
        throw ApiError.forbidden(
          'You cannot create or modify users with equal or higher role level'
        );
      }
    }

    next();
  };
};