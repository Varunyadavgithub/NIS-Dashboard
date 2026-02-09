import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Component to conditionally render based on permissions
const PermissionGate = ({ 
  children, 
  permissions = [], 
  requireAll = false,
  fallback = null 
}) => {
  const { checkAnyPermission, checkAllPermissions } = useAuth();

  if (permissions.length === 0) {
    return children;
  }

  const hasAccess = requireAll 
    ? checkAllPermissions(permissions)
    : checkAnyPermission(permissions);

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default PermissionGate;