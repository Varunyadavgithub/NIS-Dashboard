import axios from "axios";
import {
  guardsData,
  clientsData,
  deploymentsData,
  attendanceData,
  payrollData,
  dashboardStats,
  revenueData,
  attendanceChartData,
  recentActivities,
} from "../data/mockData";

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions (replace with real API calls later)
export const apiService = {
  // Auth
  login: async (credentials) => {
    await delay(500);
    if (
      credentials.email === process.env.ADMIN_EMAIL &&
      credentials.password === process.env.ADMIN_PASSWORD
    ) {
      return {
        token: "mock-jwt-token",
        user: {
          id: 1,
          name: "Admin User",
          email: "admin@nehasecurity.com",
          role: "admin",
        },
      };
    }
    throw new Error("Invalid credentials");
  },

  // Dashboard
  getDashboardStats: async () => {
    await delay(300);
    return dashboardStats;
  },

  getRevenueData: async () => {
    await delay(300);
    return revenueData;
  },

  getAttendanceChartData: async () => {
    await delay(300);
    return attendanceChartData;
  },

  getRecentActivities: async () => {
    await delay(300);
    return recentActivities;
  },

  // Guards
  getGuards: async () => {
    await delay(300);
    return [...guardsData];
  },

  getGuardById: async (id) => {
    await delay(200);
    return guardsData.find((g) => g.id === parseInt(id));
  },

  createGuard: async (data) => {
    await delay(300);
    const newGuard = { ...data, id: Date.now() };
    guardsData.push(newGuard);
    return newGuard;
  },

  updateGuard: async (id, data) => {
    await delay(300);
    const index = guardsData.findIndex((g) => g.id === parseInt(id));
    if (index !== -1) {
      guardsData[index] = { ...guardsData[index], ...data };
      return guardsData[index];
    }
    throw new Error("Guard not found");
  },

  deleteGuard: async (id) => {
    await delay(300);
    const index = guardsData.findIndex((g) => g.id === parseInt(id));
    if (index !== -1) {
      guardsData.splice(index, 1);
      return { success: true };
    }
    throw new Error("Guard not found");
  },

  // Clients
  getClients: async () => {
    await delay(300);
    return [...clientsData];
  },

  getClientById: async (id) => {
    await delay(200);
    return clientsData.find((c) => c.id === parseInt(id));
  },

  createClient: async (data) => {
    await delay(300);
    const newClient = { ...data, id: Date.now() };
    clientsData.push(newClient);
    return newClient;
  },

  updateClient: async (id, data) => {
    await delay(300);
    const index = clientsData.findIndex((c) => c.id === parseInt(id));
    if (index !== -1) {
      clientsData[index] = { ...clientsData[index], ...data };
      return clientsData[index];
    }
    throw new Error("Client not found");
  },

  deleteClient: async (id) => {
    await delay(300);
    const index = clientsData.findIndex((c) => c.id === parseInt(id));
    if (index !== -1) {
      clientsData.splice(index, 1);
      return { success: true };
    }
    throw new Error("Client not found");
  },

  // Deployments
  getDeployments: async () => {
    await delay(300);
    return [...deploymentsData];
  },

  createDeployment: async (data) => {
    await delay(300);
    const newDeployment = { ...data, id: Date.now() };
    deploymentsData.push(newDeployment);
    return newDeployment;
  },

  updateDeployment: async (id, data) => {
    await delay(300);
    const index = deploymentsData.findIndex((d) => d.id === parseInt(id));
    if (index !== -1) {
      deploymentsData[index] = { ...deploymentsData[index], ...data };
      return deploymentsData[index];
    }
    throw new Error("Deployment not found");
  },

  deleteDeployment: async (id) => {
    await delay(300);
    const index = deploymentsData.findIndex((d) => d.id === parseInt(id));
    if (index !== -1) {
      deploymentsData.splice(index, 1);
      return { success: true };
    }
    throw new Error("Deployment not found");
  },

  // Attendance
  getAttendance: async (filters = {}) => {
    await delay(300);
    let data = [...attendanceData];
    if (filters.date) {
      data = data.filter((a) => a.date === filters.date);
    }
    if (filters.guardId) {
      data = data.filter((a) => a.guardId === parseInt(filters.guardId));
    }
    return data;
  },

  markAttendance: async (data) => {
    await delay(300);
    const newAttendance = { ...data, id: Date.now() };
    attendanceData.push(newAttendance);
    return newAttendance;
  },

  updateAttendance: async (id, data) => {
    await delay(300);
    const index = attendanceData.findIndex((a) => a.id === parseInt(id));
    if (index !== -1) {
      attendanceData[index] = { ...attendanceData[index], ...data };
      return attendanceData[index];
    }
    throw new Error("Attendance record not found");
  },

  // Payroll
  getPayroll: async (filters = {}) => {
    await delay(300);
    let data = [...payrollData];
    if (filters.month) {
      data = data.filter((p) => p.month === filters.month);
    }
    if (filters.status) {
      data = data.filter((p) => p.status === filters.status);
    }
    return data;
  },

  createPayroll: async (data) => {
    await delay(300);
    const newPayroll = { ...data, id: Date.now() };
    payrollData.push(newPayroll);
    return newPayroll;
  },

  updatePayroll: async (id, data) => {
    await delay(300);
    const index = payrollData.findIndex((p) => p.id === parseInt(id));
    if (index !== -1) {
      payrollData[index] = { ...payrollData[index], ...data };
      return payrollData[index];
    }
    throw new Error("Payroll record not found");
  },

  processPayroll: async (ids) => {
    await delay(500);
    ids.forEach((id) => {
      const index = payrollData.findIndex((p) => p.id === parseInt(id));
      if (index !== -1) {
        payrollData[index].status = "paid";
        payrollData[index].paidDate = new Date().toISOString().split("T")[0];
      }
    });
    return { success: true };
  },
};

export default api;
