export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  ACCOUNTANT: "accountant",
  SUPERVISOR: "supervisor",
  VIEWER: "viewer",
};

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  ACCOUNTANT: "accountant",
  SUPERVISOR: "supervisor",
  VIEWER: "viewer",
};

// Permissions
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

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

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

export const GUARD_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
  TERMINATED: "terminated",
  SUSPENDED: "suspended",
  TRAINING: "training",
};

// Client Types
export const CLIENT_TYPES = {
  COMPANY: "company",
  SOCIETY: "society",
  INDUSTRY: "industry",
};

export const CLIENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  TERMINATED: "terminated",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
};

export const DEPLOYMENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  LATE: "late",
  ON_LEAVE: "on_leave",
  HOLIDAY: "holiday",
  WEEK_OFF: "week_off",
};

export const LEAVE_TYPES = {
  CASUAL: "casual",
  SICK: "sick",
  EARNED: "earned",
  UNPAID: "unpaid",
  EMERGENCY: "emergency",
};

export const PAYROLL_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PROCESSING: "processing",
  VERIFIED: "verified",
  APPROVED: "approved",
  PAID: "paid",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
};

export const PAYMENT_METHODS = {
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
  CHEQUE: "cheque",
  UPI: "upi",
};

export const SHIFT_TYPES = {
  DAY: "day",
  NIGHT: "night",
  GENERAL: "general",
  ROTATIONAL: "rotational",
};

export const DOCUMENT_TYPES = {
  AADHAR: "aadhar",
  PAN: "pan",
  VOTER_ID: "voter_id",
  DRIVING_LICENSE: "driving_license",
  PASSPORT: "passport",
  POLICE_VERIFICATION: "police_verification",
  MEDICAL_CERTIFICATE: "medical_certificate",
  TRAINING_CERTIFICATE: "training_certificate",
  EXPERIENCE_LETTER: "experience_letter",
  PHOTO: "photo",
  OTHER: "other",
};

export const ACTIVITY_TYPES = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  EXPORT: "export",
  IMPORT: "import",
  APPROVE: "approve",
  REJECT: "reject",
};

export const MODULES = {
  USER: "user",
  GUARD: "guard",
  CLIENT: "client",
  DEPLOYMENT: "deployment",
  ATTENDANCE: "attendance",
  PAYROLL: "payroll",
  REPORT: "report",
  SETTINGS: "settings",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File Upload Config
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  ALLOWED_DOC_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};
