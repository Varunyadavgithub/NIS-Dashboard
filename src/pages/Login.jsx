import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import {
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";

const Login = () => {
  const { login, isAuthenticated, loading } = useApp();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
      await login(credentials);
    }
  };

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
              placeholder="admin@nehasecurity.com"
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

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-gray-500 text-center">
              Email: <span className="font-mono">admin@nehasecurity.com</span>
            </p>
            <p className="text-xs text-gray-500 text-center">
              Password: <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-primary-200 text-sm mt-6">
          © 2024 Neha Industrial Security. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
