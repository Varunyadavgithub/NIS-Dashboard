import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { findUserByCredentials, usersData } from '../data/usersData';
import { ROLE_PERMISSIONS, hasPermission, hasAnyPermission } from '../config/roles';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  permissions: [],
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        permissions: ROLE_PERMISSIONS[action.payload.user.role] || [],
        loading: false,
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored auth on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = findUserByCredentials(credentials.email, credentials.password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = user;

      // Store in localStorage
      localStorage.setItem('token', `mock-token-${user.id}`);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userWithoutPassword } });
      toast.success(`Welcome back, ${user.name}!`);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = (data) => {
    const updatedUser = { ...state.user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: data });
    toast.success('Profile updated successfully');
  };

  // Permission check functions
  const checkPermission = (permission) => {
    return hasPermission(state.user?.role, permission);
  };

  const checkAnyPermission = (permissions) => {
    return hasAnyPermission(state.user?.role, permissions);
  };

  const checkAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(state.user?.role, permission));
  };

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};