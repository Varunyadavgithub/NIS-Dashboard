import express from 'express';
import {
  getAttendanceReport,
  getPayrollReport,
  getGuardReport,
  getClientReport,
  getDeploymentReport,
  getFinancialReport,
  getPFESIReport,
} from '../controllers/report.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin', 'admin', 'manager', 'accountant'));

router.get('/attendance', getAttendanceReport);
router.get('/payroll', getPayrollReport);
router.get('/guards', getGuardReport);
router.get('/clients', getClientReport);
router.get('/deployments', getDeploymentReport);
router.get('/financial', getFinancialReport);
router.get('/pf-esi', getPFESIReport);

export default router;