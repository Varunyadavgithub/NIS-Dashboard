import { useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import {
  HiOutlineDocumentReport,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardCheck,
  HiOutlineCash,
  HiOutlineDownload,
  HiOutlineCalendar,
} from "react-icons/hi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency } from "../utils/helpers";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const reportTypes = [
    { id: "overview", name: "Overview", icon: HiOutlineDocumentReport },
    { id: "guards", name: "Guards Report", icon: HiOutlineUserGroup },
    { id: "clients", name: "Clients Report", icon: HiOutlineOfficeBuilding },
    {
      id: "attendance",
      name: "Attendance Report",
      icon: HiOutlineClipboardCheck,
    },
    { id: "payroll", name: "Payroll Report", icon: HiOutlineCash },
  ];

  // Sample data for charts
  const attendanceData = [
    { month: "Jan", present: 92, absent: 5, leave: 3 },
    { month: "Feb", present: 94, absent: 4, leave: 2 },
    { month: "Mar", present: 91, absent: 6, leave: 3 },
    { month: "Apr", present: 95, absent: 3, leave: 2 },
    { month: "May", present: 93, absent: 4, leave: 3 },
    { month: "Jun", present: 96, absent: 2, leave: 2 },
  ];

  const clientDistribution = [
    { name: "Companies", value: 12, color: "#3b82f6" },
    { name: "Societies", value: 8, color: "#8b5cf6" },
    { name: "Industries", value: 4, color: "#f59e0b" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 980000, expenses: 720000, profit: 260000 },
    { month: "Feb", revenue: 1020000, expenses: 740000, profit: 280000 },
    { month: "Mar", revenue: 1100000, expenses: 780000, profit: 320000 },
    { month: "Apr", revenue: 1080000, expenses: 760000, profit: 320000 },
    { month: "May", revenue: 1150000, expenses: 800000, profit: 350000 },
    { month: "Jun", revenue: 1200000, expenses: 820000, profit: 380000 },
  ];

  const guardStatusData = [
    { name: "Active", value: 78, color: "#22c55e" },
    { name: "On Leave", value: 5, color: "#f59e0b" },
    { name: "Inactive", value: 2, color: "#ef4444" },
  ];

  const payrollData = [
    { month: "Jan", salaries: 720000, overtime: 45000, bonus: 15000 },
    { month: "Feb", salaries: 740000, overtime: 52000, bonus: 20000 },
    { month: "Mar", salaries: 780000, overtime: 48000, bonus: 18000 },
    { month: "Apr", salaries: 760000, overtime: 55000, bonus: 25000 },
    { month: "May", salaries: 800000, overtime: 50000, bonus: 22000 },
    { month: "Jun", salaries: 820000, overtime: 58000, bonus: 30000 },
  ];

  const topGuards = [
    { name: "Amit Sharma", attendance: 100, overtime: 45, rating: 4.9 },
    { name: "Rajesh Kumar", attendance: 98, overtime: 38, rating: 4.8 },
    { name: "Mohan Patel", attendance: 97, overtime: 42, rating: 4.7 },
    { name: "Suresh Singh", attendance: 96, overtime: 35, rating: 4.6 },
    { name: "Vikram Yadav", attendance: 95, overtime: 30, rating: 4.5 },
  ];

  const topClients = [
    { name: "Industrial Complex A", guards: 20, revenue: 400000 },
    { name: "Metro Mall", guards: 15, revenue: 300000 },
    { name: "Green Valley Society", guards: 12, revenue: 240000 },
    { name: "Tech Solutions Pvt Ltd", guards: 8, revenue: 180000 },
    { name: "Blue Sky Apartments", guards: 6, revenue: 120000 },
  ];

  const handleExport = (type) => {
    console.log(`Exporting ${type} report...`);
    // Implement actual export logic here
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {typeof entry.value === "number" && entry.value > 1000
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500">View detailed reports and analytics</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedReport === report.id
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <report.icon className="w-5 h-5" />
            {report.name}
          </button>
        ))}
      </div>

      {/* Date Range Selector */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => handleExport(selectedReport)}
          >
            <HiOutlineDownload className="w-5 h-5" />
            Export PDF
          </Button>
        </div>
      </Card>

      {/* Overview Report */}
      {selectedReport === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-sm text-gray-500">Total Guards</p>
              <p className="text-3xl font-bold text-gray-900">85</p>
              <p className="text-sm text-green-600">+5 this month</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600">+2 this month</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Avg Attendance</p>
              <p className="text-3xl font-bold text-gray-900">94.5%</p>
              <p className="text-sm text-green-600">+2.3% vs last month</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹12.4L</p>
              <p className="text-sm text-green-600">+8% vs last month</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue vs Expenses
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${(value / 100000).toFixed(0)}L`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="Profit"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Client Distribution */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Client Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {clientDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Guards Report */}
      {selectedReport === "guards" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-sm text-gray-500">Total Guards</p>
              <p className="text-3xl font-bold text-gray-900">85</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-3xl font-bold text-green-600">78</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">On Leave</p>
              <p className="text-3xl font-bold text-yellow-600">5</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-3xl font-bold text-red-600">2</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guard Status Distribution */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Guard Status Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={guardStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {guardStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Performing Guards */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Performing Guards
              </h3>
              <div className="space-y-4">
                {topGuards.map((guard, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {guard.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Attendance: {guard.attendance}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ⭐ {guard.rating}
                      </p>
                      <p className="text-xs text-gray-500">
                        OT: {guard.overtime}hrs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Clients Report */}
      {selectedReport === "clients" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Active Contracts</p>
              <p className="text-3xl font-bold text-green-600">22</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-3xl font-bold text-yellow-600">3</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-3xl font-bold text-primary-600">₹12.4L</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Type Distribution */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Client Type Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {clientDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Clients by Revenue */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Clients by Revenue
              </h3>
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {client.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {client.guards} guards deployed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">
                        {formatCurrency(client.revenue)}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Attendance Report */}
      {selectedReport === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-sm text-gray-500">Average Attendance</p>
              <p className="text-3xl font-bold text-gray-900">94.5%</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Total Working Days</p>
              <p className="text-3xl font-bold text-blue-600">156</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Total Overtime Hours</p>
              <p className="text-3xl font-bold text-green-600">1,245</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Late Arrivals</p>
              <p className="text-3xl font-bold text-yellow-600">45</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Attendance Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="present"
                    name="Present %"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="absent"
                    name="Absent %"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="leave"
                    name="Leave %"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Payroll Report */}
      {selectedReport === "payroll" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-sm text-gray-500">Total Salaries Paid</p>
              <p className="text-3xl font-bold text-gray-900">₹48.2L</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Overtime Pay</p>
              <p className="text-3xl font-bold text-blue-600">₹3.08L</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Bonuses Paid</p>
              <p className="text-3xl font-bold text-green-600">₹1.3L</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-3xl font-bold text-red-600">₹3.6L</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payroll Breakdown by Month
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      `₹${(value / 100000).toFixed(0)}L`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="salaries"
                    name="Base Salaries"
                    fill="#3b82f6"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="overtime"
                    name="Overtime"
                    fill="#22c55e"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="bonus"
                    name="Bonus"
                    fill="#f59e0b"
                    stackId="a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
