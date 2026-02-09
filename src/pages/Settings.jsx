import { useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import {
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCog,
  HiOutlineSave,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineGlobe,
  HiOutlineLockClosed,
  HiOutlineKey,
} from "react-icons/hi";

const Settings = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    name: "Neha Industrial Security",
    email: "contact@nehasecurity.com",
    phone: "+91 9876543210",
    alternatePhone: "+91 9876543211",
    address: "123, Industrial Area, Sector 15, Noida, UP - 201301",
    website: "www.nehasecurity.com",
    gstin: "09AAACN1234A1Z5",
    pan: "AAACN1234A",
  });

  const [profileInfo, setProfileInfo] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@nehasecurity.com",
    phone: "+91 9876543210",
    role: user?.role || "Administrator",
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    attendanceAlerts: true,
    payrollAlerts: true,
    contractExpiry: true,
    newGuardAlert: true,
    paymentReminders: true,
  });

  const [generalSettings, setGeneralSettings] = useState({
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    language: "en",
    workingHours: 8,
    overtimeRate: 1.5,
    defaultShiftTime: "06:00 - 14:00",
  });

  const tabs = [
    { id: "company", name: "Company Info", icon: HiOutlineOfficeBuilding },
    { id: "profile", name: "Profile", icon: HiOutlineUser },
    { id: "security", name: "Security", icon: HiOutlineShieldCheck },
    { id: "notifications", name: "Notifications", icon: HiOutlineBell },
    { id: "general", name: "General", icon: HiOutlineCog },
  ];

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Company information updated successfully");
    }, 1000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordInfo.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPasswordInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully");
    }, 1000);
  };

  const handleNotificationsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Notification preferences updated");
    }, 1000);
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("General settings updated");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">
          Manage your account and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Company Info */}
          {activeTab === "company" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Company Information
              </h2>
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    value={companyInfo.name}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, name: e.target.value })
                    }
                    icon={HiOutlineOfficeBuilding}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, email: e.target.value })
                    }
                    icon={HiOutlineMail}
                  />
                  <Input
                    label="Phone"
                    value={companyInfo.phone}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, phone: e.target.value })
                    }
                    icon={HiOutlinePhone}
                  />
                  <Input
                    label="Alternate Phone"
                    value={companyInfo.alternatePhone}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        alternatePhone: e.target.value,
                      })
                    }
                    icon={HiOutlinePhone}
                  />
                  <Input
                    label="Website"
                    value={companyInfo.website}
                    onChange={(e) =>
                      setCompanyInfo({
                        ...companyInfo,
                        website: e.target.value,
                      })
                    }
                    icon={HiOutlineGlobe}
                  />
                  <Input
                    label="GSTIN"
                    value={companyInfo.gstin}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, gstin: e.target.value })
                    }
                  />
                  <Input
                    label="PAN"
                    value={companyInfo.pan}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, pan: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="Address"
                  value={companyInfo.address}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, address: e.target.value })
                  }
                  icon={HiOutlineLocationMarker}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    <HiOutlineSave className="w-5 h-5" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Profile Information
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <HiOutlineUser className="w-10 h-10 text-primary-600" />
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG. Max size 2MB
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileInfo.name}
                    onChange={(e) =>
                      setProfileInfo({ ...profileInfo, name: e.target.value })
                    }
                    icon={HiOutlineUser}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profileInfo.email}
                    onChange={(e) =>
                      setProfileInfo({ ...profileInfo, email: e.target.value })
                    }
                    icon={HiOutlineMail}
                  />
                  <Input
                    label="Phone"
                    value={profileInfo.phone}
                    onChange={(e) =>
                      setProfileInfo({ ...profileInfo, phone: e.target.value })
                    }
                    icon={HiOutlinePhone}
                  />
                  <Input
                    label="Role"
                    value={profileInfo.role}
                    disabled
                    icon={HiOutlineShieldCheck}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    <HiOutlineSave className="w-5 h-5" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Change Password
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="max-w-md space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordInfo.currentPassword}
                    onChange={(e) =>
                      setPasswordInfo({
                        ...passwordInfo,
                        currentPassword: e.target.value,
                      })
                    }
                    icon={HiOutlineLockClosed}
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordInfo.newPassword}
                    onChange={(e) =>
                      setPasswordInfo({
                        ...passwordInfo,
                        newPassword: e.target.value,
                      })
                    }
                    icon={HiOutlineKey}
                    placeholder="Enter new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordInfo.confirmPassword}
                    onChange={(e) =>
                      setPasswordInfo({
                        ...passwordInfo,
                        confirmPassword: e.target.value,
                      })
                    }
                    icon={HiOutlineKey}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    <HiOutlineSave className="w-5 h-5" />
                    Change Password
                  </Button>
                </div>
              </form>

              <hr className="my-8" />

              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Two-Factor Authentication
              </h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable 2FA</p>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="secondary">Enable</Button>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Notification Preferences
              </h2>
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      key: "emailAlerts",
                      label: "Email Alerts",
                      description: "Receive notifications via email",
                    },
                    {
                      key: "smsAlerts",
                      label: "SMS Alerts",
                      description: "Receive notifications via SMS",
                    },
                    {
                      key: "attendanceAlerts",
                      label: "Attendance Alerts",
                      description: "Get notified about attendance issues",
                    },
                    {
                      key: "payrollAlerts",
                      label: "Payroll Alerts",
                      description: "Get notified about payroll processing",
                    },
                    {
                      key: "contractExpiry",
                      label: "Contract Expiry",
                      description: "Get notified before contract expires",
                    },
                    {
                      key: "newGuardAlert",
                      label: "New Guard Alert",
                      description: "Get notified when new guard is added",
                    },
                    {
                      key: "paymentReminders",
                      label: "Payment Reminders",
                      description: "Get payment due reminders",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    <HiOutlineSave className="w-5 h-5" />
                    Save Preferences
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* General */}
          {activeTab === "general" && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                General Settings
              </h2>
              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          currency: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Timezone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          timezone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">
                        America/New_York (EST)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date Format
                    </label>
                    <select
                      value={generalSettings.dateFormat}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          dateFormat: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Language
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          language: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                  <Input
                    label="Standard Working Hours"
                    type="number"
                    value={generalSettings.workingHours}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        workingHours: e.target.value,
                      })
                    }
                    min="1"
                    max="24"
                  />
                  <Input
                    label="Overtime Rate Multiplier"
                    type="number"
                    step="0.1"
                    value={generalSettings.overtimeRate}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        overtimeRate: e.target.value,
                      })
                    }
                    min="1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" loading={loading}>
                    <HiOutlineSave className="w-5 h-5" />
                    Save Settings
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
