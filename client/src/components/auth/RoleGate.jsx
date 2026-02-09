import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Component to conditionally render based on roles
const RoleGate = ({ 
  children, 
  roles = [], 
  fallback = null 
}) => {
  const { user } = useAuth();

  if (roles.length === 0) {
    return children;
  }

  if (!roles.includes(user?.role)) {
    return fallback;
  }

  return children;
};

export default RoleGate;