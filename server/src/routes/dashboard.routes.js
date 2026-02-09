import express from 'express';
import {
  getDashboardStats,
  getTodayAttendance,
  getMonthlyTrends,
  getExpiringContracts,
  getPendingActions,
  getRecentActivities,
  getClientDeploymentSummary,
  getGuardAvailability,
  getAttendanceHeatmap,
  getPayrollOverview,
} from '../controllers/dashboard.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/attendance-today', getTodayAttendance);
router.get('/trends', getMonthlyTrends);
router.get('/expiring-contracts', getExpiringContracts);
router.get('/pending-actions', getPendingActions);
router.get('/recent-activities', getRecentActivities);
router.get('/client-deployments', getClientDeploymentSummary);
router.get('/guard-availability', getGuardAvailability);
router.get('/attendance-heatmap', getAttendanceHeatmap);
router.get('/payroll-overview', getPayrollOverview);

export default router;