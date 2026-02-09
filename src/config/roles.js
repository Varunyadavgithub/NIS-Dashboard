// Define all available roles
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  SUPERVISOR: "supervisor",
  STAFF: "staff",
  ACCOUNTANT: "accountant",
};

// Define all available permissions
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_ANALYTICS: "view_analytics",

  // Guards
  VIEW_GUARDS: "view_guards",
  CREATE_GUARD: "create_guard",
  EDIT_GUARD: "edit_guard",
  DELETE_GUARD: "delete_guard",
  EXPORT_GUARDS: "export_guards",

  // Clients
  VIEW_CLIENTS: "view_clients",
  CREATE_CLIENT: "create_client",
  EDIT_CLIENT: "edit_client",
  DELETE_CLIENT: "delete_client",
  EXPORT_CLIENTS: "export_clients",

  // Deployments
  VIEW_DEPLOYMENTS: "view_deployments",
  CREATE_DEPLOYMENT: "create_deployment",
  EDIT_DEPLOYMENT: "edit_deployment",
  DELETE_DEPLOYMENT: "delete_deployment",

  // Attendance
  VIEW_ATTENDANCE: "view_attendance",
  MARK_ATTENDANCE: "mark_attendance",
  EDIT_ATTENDANCE: "edit_attendance",
  EXPORT_ATTENDANCE: "export_attendance",

  // Payroll
  VIEW_PAYROLL: "view_payroll",
  CREATE_PAYROLL: "create_payroll",
  EDIT_PAYROLL: "edit_payroll",
  PROCESS_PAYROLL: "process_payroll",
  EXPORT_PAYROLL: "export_payroll",

  // Reports
  VIEW_REPORTS: "view_reports",
  EXPORT_REPORTS: "export_reports",

  // Users
  VIEW_USERS: "view_users",
  CREATE_USER: "create_user",
  EDIT_USER: "edit_user",
  DELETE_USER: "delete_user",
  MANAGE_ROLES: "manage_roles",

  // Settings
  VIEW_SETTINGS: "view_settings",
  EDIT_COMPANY_SETTINGS: "edit_company_settings",
  EDIT_SYSTEM_SETTINGS: "edit_system_settings",
};

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_GUARDS,
    PERMISSIONS.CREATE_GUARD,
    PERMISSIONS.EDIT_GUARD,
    PERMISSIONS.DELETE_GUARD,
    PERMISSIONS.EXPORT_GUARDS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.DELETE_CLIENT,
    PERMISSIONS.EXPORT_CLIENTS,
    PERMISSIONS.VIEW_DEPLOYMENTS,
    PERMISSIONS.CREATE_DEPLOYMENT,
    PERMISSIONS.EDIT_DEPLOYMENT,
    PERMISSIONS.DELETE_DEPLOYMENT,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.EDIT_ATTENDANCE,
    PERMISSIONS.EXPORT_ATTENDANCE,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.CREATE_PAYROLL,
    PERMISSIONS.EDIT_PAYROLL,
    PERMISSIONS.PROCESS_PAYROLL,
    PERMISSIONS.EXPORT_PAYROLL,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_COMPANY_SETTINGS,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_GUARDS,
    PERMISSIONS.CREATE_GUARD,
    PERMISSIONS.EDIT_GUARD,
    PERMISSIONS.EXPORT_GUARDS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.EXPORT_CLIENTS,
    PERMISSIONS.VIEW_DEPLOYMENTS,
    PERMISSIONS.CREATE_DEPLOYMENT,
    PERMISSIONS.EDIT_DEPLOYMENT,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.EDIT_ATTENDANCE,
    PERMISSIONS.EXPORT_ATTENDANCE,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  [ROLES.SUPERVISOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GUARDS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_DEPLOYMENTS,
    PERMISSIONS.CREATE_DEPLOYMENT,
    PERMISSIONS.EDIT_DEPLOYMENT,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.EDIT_ATTENDANCE,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GUARDS,
    PERMISSIONS.VIEW_DEPLOYMENTS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GUARDS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.CREATE_PAYROLL,
    PERMISSIONS.EDIT_PAYROLL,
    PERMISSIONS.PROCESS_PAYROLL,
    PERMISSIONS.EXPORT_PAYROLL,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
  ],
};

// Role display names and colors
export const ROLE_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    label: "Super Admin",
    color: "bg-red-100 text-red-800",
    description: "Full system access with all permissions",
  },
  [ROLES.ADMIN]: {
    label: "Admin",
    color: "bg-purple-100 text-purple-800",
    description: "Administrative access with user management",
  },
  [ROLES.MANAGER]: {
    label: "Manager",
    color: "bg-blue-100 text-blue-800",
    description: "Manage guards, clients, and operations",
  },
  [ROLES.SUPERVISOR]: {
    label: "Supervisor",
    color: "bg-green-100 text-green-800",
    description: "Supervise deployments and attendance",
  },
  [ROLES.STAFF]: {
    label: "Staff",
    color: "bg-gray-100 text-gray-800",
    description: "Basic access for daily operations",
  },
  [ROLES.ACCOUNTANT]: {
    label: "Accountant",
    color: "bg-yellow-100 text-yellow-800",
    description: "Financial and payroll management",
  },
};

// Helper functions
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

export const getRoleLabel = (role) => {
  return ROLE_CONFIG[role]?.label || role;
};

export const getRoleColor = (role) => {
  return ROLE_CONFIG[role]?.color || "bg-gray-100 text-gray-800";
};
