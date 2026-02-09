import { NavLink } from "react-router-dom";
import { useApp } from "../../context/AppContext";
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
  HiX,
} from "react-icons/hi";

const menuItems = [
  { path: "/", icon: HiOutlineHome, label: "Dashboard" },
  { path: "/guards", icon: HiOutlineUserGroup, label: "Guards" },
  { path: "/clients", icon: HiOutlineOfficeBuilding, label: "Clients" },
  { path: "/deployments", icon: HiOutlineLocationMarker, label: "Deployments" },
  { path: "/attendance", icon: HiOutlineClipboardCheck, label: "Attendance" },
  { path: "/payroll", icon: HiOutlineCash, label: "Payroll" },
  { path: "/reports", icon: HiOutlineDocumentReport, label: "Reports" },
  { path: "/settings", icon: HiOutlineCog, label: "Settings" },
];

const Sidebar = () => {
  const { sidebarOpen, setSidebar, logout } = useApp();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebar(false)}
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
            onClick={() => setSidebar(false)}
            className="lg:hidden p-2 text-white hover:bg-primary-700 rounded-lg"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebar(false)}
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

        {/* User Section */}
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
