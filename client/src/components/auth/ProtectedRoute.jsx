import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageLoader } from '../common/Loader';

const ProtectedRoute = ({ 
  children, 
  permissions = [], 
  requireAll = false,
  redirectTo = '/unauthorized' 
}) => {
  const { isAuthenticated, loading, checkPermission, checkAnyPermission, checkAllPermissions } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If permissions are required, check them
  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);

    if (!hasAccess) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;