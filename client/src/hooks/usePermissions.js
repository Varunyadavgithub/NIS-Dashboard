import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../config/roles";

export const usePermissions = () => {
  const { checkPermission, checkAnyPermission, checkAllPermissions, user } =
    useAuth();

  return {
    // User info
    userRole: user?.role,

    // Permission checkers
    can: checkPermission,
    canAny: checkAnyPermission,
    canAll: checkAllPermissions,

    // Dashboard permissions
    canViewDashboard: checkPermission(PERMISSIONS.VIEW_DASHBOARD),
    canViewAnalytics: checkPermission(PERMISSIONS.VIEW_ANALYTICS),

    // Guards permissions
    canViewGuards: checkPermission(PERMISSIONS.VIEW_GUARDS),
    canCreateGuard: checkPermission(PERMISSIONS.CREATE_GUARD),
    canEditGuard: checkPermission(PERMISSIONS.EDIT_GUARD),
    canDeleteGuard: checkPermission(PERMISSIONS.DELETE_GUARD),
    canExportGuards: checkPermission(PERMISSIONS.EXPORT_GUARDS),

    // Clients permissions
    canViewClients: checkPermission(PERMISSIONS.VIEW_CLIENTS),
    canCreateClient: checkPermission(PERMISSIONS.CREATE_CLIENT),
    canEditClient: checkPermission(PERMISSIONS.EDIT_CLIENT),
    canDeleteClient: checkPermission(PERMISSIONS.DELETE_CLIENT),
    canExportClients: checkPermission(PERMISSIONS.EXPORT_CLIENTS),

    // Deployments permissions
    canViewDeployments: checkPermission(PERMISSIONS.VIEW_DEPLOYMENTS),
    canCreateDeployment: checkPermission(PERMISSIONS.CREATE_DEPLOYMENT),
    canEditDeployment: checkPermission(PERMISSIONS.EDIT_DEPLOYMENT),
    canDeleteDeployment: checkPermission(PERMISSIONS.DELETE_DEPLOYMENT),

    // Attendance permissions
    canViewAttendance: checkPermission(PERMISSIONS.VIEW_ATTENDANCE),
    canMarkAttendance: checkPermission(PERMISSIONS.MARK_ATTENDANCE),
    canEditAttendance: checkPermission(PERMISSIONS.EDIT_ATTENDANCE),
    canExportAttendance: checkPermission(PERMISSIONS.EXPORT_ATTENDANCE),

    // Payroll permissions
    canViewPayroll: checkPermission(PERMISSIONS.VIEW_PAYROLL),
    canCreatePayroll: checkPermission(PERMISSIONS.CREATE_PAYROLL),
    canEditPayroll: checkPermission(PERMISSIONS.EDIT_PAYROLL),
    canProcessPayroll: checkPermission(PERMISSIONS.PROCESS_PAYROLL),
    canExportPayroll: checkPermission(PERMISSIONS.EXPORT_PAYROLL),

    // Reports permissions
    canViewReports: checkPermission(PERMISSIONS.VIEW_REPORTS),
    canExportReports: checkPermission(PERMISSIONS.EXPORT_REPORTS),

    // Users permissions
    canViewUsers: checkPermission(PERMISSIONS.VIEW_USERS),
    canCreateUser: checkPermission(PERMISSIONS.CREATE_USER),
    canEditUser: checkPermission(PERMISSIONS.EDIT_USER),
    canDeleteUser: checkPermission(PERMISSIONS.DELETE_USER),
    canManageRoles: checkPermission(PERMISSIONS.MANAGE_ROLES),

    // Settings permissions
    canViewSettings: checkPermission(PERMISSIONS.VIEW_SETTINGS),
    canEditCompanySettings: checkPermission(PERMISSIONS.EDIT_COMPANY_SETTINGS),
    canEditSystemSettings: checkPermission(PERMISSIONS.EDIT_SYSTEM_SETTINGS),
  };
};
