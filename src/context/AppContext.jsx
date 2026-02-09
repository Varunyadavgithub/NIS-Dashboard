import React, { createContext, useContext, useReducer, useEffect } from "react";
import { apiService } from "../services/api";
import toast from "react-hot-toast";

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  sidebarOpen: true,
  guards: [],
  clients: [],
  deployments: [],
  attendance: [],
  payroll: [],
  dashboardStats: null,
  revenueData: [],
  attendanceChartData: [],
  recentActivities: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case "LOGOUT":
      return { ...initialState, loading: false };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.payload };
    case "SET_GUARDS":
      return { ...state, guards: action.payload };
    case "ADD_GUARD":
      return { ...state, guards: [...state.guards, action.payload] };
    case "UPDATE_GUARD":
      return {
        ...state,
        guards: state.guards.map((g) =>
          g.id === action.payload.id ? action.payload : g,
        ),
      };
    case "DELETE_GUARD":
      return {
        ...state,
        guards: state.guards.filter((g) => g.id !== action.payload),
      };
    case "SET_CLIENTS":
      return { ...state, clients: action.payload };
    case "ADD_CLIENT":
      return { ...state, clients: [...state.clients, action.payload] };
    case "UPDATE_CLIENT":
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };
    case "DELETE_CLIENT":
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== action.payload),
      };
    case "SET_DEPLOYMENTS":
      return { ...state, deployments: action.payload };
    case "ADD_DEPLOYMENT":
      return { ...state, deployments: [...state.deployments, action.payload] };
    case "UPDATE_DEPLOYMENT":
      return {
        ...state,
        deployments: state.deployments.map((d) =>
          d.id === action.payload.id ? action.payload : d,
        ),
      };
    case "DELETE_DEPLOYMENT":
      return {
        ...state,
        deployments: state.deployments.filter((d) => d.id !== action.payload),
      };
    case "SET_ATTENDANCE":
      return { ...state, attendance: action.payload };
    case "ADD_ATTENDANCE":
      return { ...state, attendance: [...state.attendance, action.payload] };
    case "UPDATE_ATTENDANCE":
      return {
        ...state,
        attendance: state.attendance.map((a) =>
          a.id === action.payload.id ? action.payload : a,
        ),
      };
    case "SET_PAYROLL":
      return { ...state, payroll: action.payload };
    case "ADD_PAYROLL":
      return { ...state, payroll: [...state.payroll, action.payload] };
    case "UPDATE_PAYROLL":
      return {
        ...state,
        payroll: state.payroll.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };
    case "SET_DASHBOARD_STATS":
      return { ...state, dashboardStats: action.payload };
    case "SET_REVENUE_DATA":
      return { ...state, revenueData: action.payload };
    case "SET_ATTENDANCE_CHART_DATA":
      return { ...state, attendanceChartData: action.payload };
    case "SET_RECENT_ACTIVITIES":
      return { ...state, recentActivities: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      dispatch({ type: "SET_USER", payload: JSON.parse(user) });
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { token, user } = await apiService.login(credentials);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "SET_USER", payload: user });
      toast.success("Login successful!");
      return true;
    } catch (error) {
      toast.error(error.message || "Login failed");
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const setSidebar = (open) => {
    dispatch({ type: "SET_SIDEBAR", payload: open });
  };

  // Guards
  const fetchGuards = async () => {
    try {
      const guards = await apiService.getGuards();
      dispatch({ type: "SET_GUARDS", payload: guards });
    } catch (error) {
      toast.error("Failed to fetch guards");
    }
  };

  const addGuard = async (data) => {
    try {
      const guard = await apiService.createGuard(data);
      dispatch({ type: "ADD_GUARD", payload: guard });
      toast.success("Guard added successfully");
      return guard;
    } catch (error) {
      toast.error("Failed to add guard");
      throw error;
    }
  };

  const updateGuard = async (id, data) => {
    try {
      const guard = await apiService.updateGuard(id, data);
      dispatch({ type: "UPDATE_GUARD", payload: guard });
      toast.success("Guard updated successfully");
      return guard;
    } catch (error) {
      toast.error("Failed to update guard");
      throw error;
    }
  };

  const deleteGuard = async (id) => {
    try {
      await apiService.deleteGuard(id);
      dispatch({ type: "DELETE_GUARD", payload: id });
      toast.success("Guard deleted successfully");
    } catch (error) {
      toast.error("Failed to delete guard");
      throw error;
    }
  };

  // Clients
  const fetchClients = async () => {
    try {
      const clients = await apiService.getClients();
      dispatch({ type: "SET_CLIENTS", payload: clients });
    } catch (error) {
      toast.error("Failed to fetch clients");
    }
  };

  const addClient = async (data) => {
    try {
      const client = await apiService.createClient(data);
      dispatch({ type: "ADD_CLIENT", payload: client });
      toast.success("Client added successfully");
      return client;
    } catch (error) {
      toast.error("Failed to add client");
      throw error;
    }
  };

  const updateClient = async (id, data) => {
    try {
      const client = await apiService.updateClient(id, data);
      dispatch({ type: "UPDATE_CLIENT", payload: client });
      toast.success("Client updated successfully");
      return client;
    } catch (error) {
      toast.error("Failed to update client");
      throw error;
    }
  };

  const deleteClient = async (id) => {
    try {
      await apiService.deleteClient(id);
      dispatch({ type: "DELETE_CLIENT", payload: id });
      toast.success("Client deleted successfully");
    } catch (error) {
      toast.error("Failed to delete client");
      throw error;
    }
  };

  // Deployments
  const fetchDeployments = async () => {
    try {
      const deployments = await apiService.getDeployments();
      dispatch({ type: "SET_DEPLOYMENTS", payload: deployments });
    } catch (error) {
      toast.error("Failed to fetch deployments");
    }
  };

  const addDeployment = async (data) => {
    try {
      const deployment = await apiService.createDeployment(data);
      dispatch({ type: "ADD_DEPLOYMENT", payload: deployment });
      toast.success("Deployment created successfully");
      return deployment;
    } catch (error) {
      toast.error("Failed to create deployment");
      throw error;
    }
  };

  const updateDeployment = async (id, data) => {
    try {
      const deployment = await apiService.updateDeployment(id, data);
      dispatch({ type: "UPDATE_DEPLOYMENT", payload: deployment });
      toast.success("Deployment updated successfully");
      return deployment;
    } catch (error) {
      toast.error("Failed to update deployment");
      throw error;
    }
  };

  const deleteDeployment = async (id) => {
    try {
      await apiService.deleteDeployment(id);
      dispatch({ type: "DELETE_DEPLOYMENT", payload: id });
      toast.success("Deployment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete deployment");
      throw error;
    }
  };

  // Attendance
  const fetchAttendance = async (filters) => {
    try {
      const attendance = await apiService.getAttendance(filters);
      dispatch({ type: "SET_ATTENDANCE", payload: attendance });
    } catch (error) {
      toast.error("Failed to fetch attendance");
    }
  };

  const markAttendance = async (data) => {
    try {
      const attendance = await apiService.markAttendance(data);
      dispatch({ type: "ADD_ATTENDANCE", payload: attendance });
      toast.success("Attendance marked successfully");
      return attendance;
    } catch (error) {
      toast.error("Failed to mark attendance");
      throw error;
    }
  };

  const updateAttendance = async (id, data) => {
    try {
      const attendance = await apiService.updateAttendance(id, data);
      dispatch({ type: "UPDATE_ATTENDANCE", payload: attendance });
      toast.success("Attendance updated successfully");
      return attendance;
    } catch (error) {
      toast.error("Failed to update attendance");
      throw error;
    }
  };

  // Payroll
  const fetchPayroll = async (filters) => {
    try {
      const payroll = await apiService.getPayroll(filters);
      dispatch({ type: "SET_PAYROLL", payload: payroll });
    } catch (error) {
      toast.error("Failed to fetch payroll");
    }
  };

  const addPayroll = async (data) => {
    try {
      const payroll = await apiService.createPayroll(data);
      dispatch({ type: "ADD_PAYROLL", payload: payroll });
      toast.success("Payroll record added");
      return payroll;
    } catch (error) {
      toast.error("Failed to add payroll record");
      throw error;
    }
  };

  const updatePayroll = async (id, data) => {
    try {
      const payroll = await apiService.updatePayroll(id, data);
      dispatch({ type: "UPDATE_PAYROLL", payload: payroll });
      toast.success("Payroll updated successfully");
      return payroll;
    } catch (error) {
      toast.error("Failed to update payroll");
      throw error;
    }
  };

  const processPayroll = async (ids) => {
    try {
      await apiService.processPayroll(ids);
      await fetchPayroll();
      toast.success("Payroll processed successfully");
    } catch (error) {
      toast.error("Failed to process payroll");
      throw error;
    }
  };

  // Dashboard
  const fetchDashboardData = async () => {
    try {
      const [stats, revenue, attendanceChart, activities] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRevenueData(),
        apiService.getAttendanceChartData(),
        apiService.getRecentActivities(),
      ]);
      dispatch({ type: "SET_DASHBOARD_STATS", payload: stats });
      dispatch({ type: "SET_REVENUE_DATA", payload: revenue });
      dispatch({ type: "SET_ATTENDANCE_CHART_DATA", payload: attendanceChart });
      dispatch({ type: "SET_RECENT_ACTIVITIES", payload: activities });
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    }
  };

  const value = {
    ...state,
    login,
    logout,
    toggleSidebar,
    setSidebar,
    fetchGuards,
    addGuard,
    updateGuard,
    deleteGuard,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    fetchDeployments,
    addDeployment,
    updateDeployment,
    deleteDeployment,
    fetchAttendance,
    markAttendance,
    updateAttendance,
    fetchPayroll,
    addPayroll,
    updatePayroll,
    processPayroll,
    fetchDashboardData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
