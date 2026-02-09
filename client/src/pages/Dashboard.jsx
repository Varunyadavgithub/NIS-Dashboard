import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import StatCard from "../components/dashboard/StatCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import AttendanceChart from "../components/dashboard/AttendanceChart";
import RecentActivities from "../components/dashboard/RecentActivities";
import { PageLoader } from "../components/common/Loader";
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineCash,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
} from "react-icons/hi";

const Dashboard = () => {
  const {
    dashboardStats,
    revenueData,
    attendanceChartData,
    recentActivities,
    fetchDashboardData,
  } = useApp();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!dashboardStats) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Guards"
          value={dashboardStats.totalGuards}
          icon={HiOutlineUserGroup}
          color="primary"
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Active Deployments"
          value={dashboardStats.activeDeployments}
          icon={HiOutlineLocationMarker}
          color="green"
          trend="up"
          trendValue="8%"
        />
        <StatCard
          title="Total Clients"
          value={dashboardStats.totalClients}
          icon={HiOutlineOfficeBuilding}
          color="purple"
          trend="up"
          trendValue="5%"
        />
        <StatCard
          title="Monthly Revenue"
          value={dashboardStats.monthlyRevenue}
          icon={HiOutlineCash}
          color="yellow"
          prefix="₹"
          trend="up"
          trendValue="15%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Guards"
          value={dashboardStats.activeGuards}
          icon={HiOutlineCheckCircle}
          color="green"
        />
        <StatCard
          title="On Leave"
          value={dashboardStats.onLeaveGuards}
          icon={HiOutlineClock}
          color="yellow"
        />
        <StatCard
          title="Attendance Rate"
          value={dashboardStats.attendanceRate}
          icon={HiOutlineClipboardCheck}
          color="blue"
          suffix="%"
        />
        <StatCard
          title="Pending Payments"
          value={dashboardStats.pendingPayments}
          icon={HiOutlineExclamation}
          color="red"
          prefix="₹"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <AttendanceChart data={attendanceChartData} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivities activities={recentActivities} />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-700 font-medium">
                Guards Available
              </span>
              <span className="text-green-900 font-bold">
                {dashboardStats.availableGuards}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700 font-medium">Overtime Hours</span>
              <span className="text-blue-900 font-bold">
                {dashboardStats.overtimeHours} hrs
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-700 font-medium">
                Active Clients
              </span>
              <span className="text-purple-900 font-bold">
                {dashboardStats.totalClients}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-700 font-medium">
                Contracts Expiring
              </span>
              <span className="text-yellow-900 font-bold">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
