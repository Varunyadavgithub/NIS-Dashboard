import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { ROLE_CONFIG } from "../config/roles";
import {
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineInformationCircle,
} from "react-icons/hi";

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const from = location.state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!credentials.email) newErrors.email = "Email is required";
    if (!credentials.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const result = await login(credentials);
      if (result.success) {
        // Navigation will happen automatically due to isAuthenticated check
      }
    }
  };

  const fillCredentials = (email, password) => {
    setCredentials({ email, password });
  };

  // Demo users for quick login
  const demoUsers = [
    {
      role: "Super Admin",
      email: "superadmin@nehasecurity.com",
      password: "super123",
    },
    { role: "Admin", email: "admin@nehasecurity.com", password: "admin123" },
    {
      role: "Manager",
      email: "manager@nehasecurity.com",
      password: "manager123",
    },
    {
      role: "Supervisor",
      email: "supervisor@nehasecurity.com",
      password: "supervisor123",
    },
    { role: "Staff", email: "staff@nehasecurity.com", password: "staff123" },
    {
      role: "Accountant",
      email: "accountant@nehasecurity.com",
      password: "accountant123",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <HiOutlineShieldCheck className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Neha Industrial Security
          </h1>
          <p className="text-primary-200 mt-2">Management Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={HiOutlineMail}
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={HiOutlineLockClosed}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Demo Credentials Toggle */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="flex items-center justify-center gap-2 w-full text-sm text-gray-600 hover:text-primary-600"
            >
              <HiOutlineInformationCircle className="w-5 h-5" />
              {showDemoCredentials ? "Hide" : "Show"} Demo Credentials
            </button>
          </div>

          {/* Demo Credentials */}
          {showDemoCredentials && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Click to fill credentials:
              </p>
              <div className="space-y-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => fillCredentials(user.email, user.password)}
                    className="w-full text-left p-2 rounded-lg hover:bg-primary-50 border border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-primary-200 text-sm mt-6">
          © 2024 Neha Industrial Security. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
