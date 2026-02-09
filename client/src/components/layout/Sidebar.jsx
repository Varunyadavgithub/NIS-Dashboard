import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { getRoleLabel, getRoleColor } from "../../config/roles";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineClipboardCheck,
  HiOutlineCash,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiX,
} from "react-icons/hi";
import { PERMISSIONS } from "../../config/roles";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Define menu items with their required permissions
  const menuItems = [
    {
      path: "/",
      icon: HiOutlineHome,
      label: "Dashboard",
      permission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
      path: "/guards",
      icon: HiOutlineUserGroup,
      label: "Guards",
      permission: PERMISSIONS.VIEW_GUARDS,
    },
    {
      path: "/clients",
      icon: HiOutlineOfficeBuilding,
      label: "Clients",
      permission: PERMISSIONS.VIEW_CLIENTS,
    },
    {
      path: "/deployments",
      icon: HiOutlineLocationMarker,
      label: "Deployments",
      permission: PERMISSIONS.VIEW_DEPLOYMENTS,
    },
    {
      path: "/attendance",
      icon: HiOutlineClipboardCheck,
      label: "Attendance",
      permission: PERMISSIONS.VIEW_ATTENDANCE,
    },
    {
      path: "/payroll",
      icon: HiOutlineCash,
      label: "Payroll",
      permission: PERMISSIONS.VIEW_PAYROLL,
    },
    {
      path: "/reports",
      icon: HiOutlineDocumentReport,
      label: "Reports",
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      path: "/users",
      icon: HiOutlineUsers,
      label: "Users",
      permission: PERMISSIONS.VIEW_USERS,
    },
    {
      path: "/settings",
      icon: HiOutlineCog,
      label: "Settings",
      permission: PERMISSIONS.VIEW_SETTINGS,
    },
  ];

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) =>
    permissions.can(item.permission),
  );

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-primary-900 to-primary-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <HiOutlineShieldCheck className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                Neha
              </h1>
              <p className="text-primary-300 text-xs">Industrial Security</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white hover:bg-primary-700 rounded-lg"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user?.role)}`}
              >
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-primary-200 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-primary-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-primary-200 hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
