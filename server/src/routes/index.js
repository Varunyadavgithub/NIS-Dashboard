import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import guardRoutes from './guard.routes.js';
import clientRoutes from './client.routes.js';
import deploymentRoutes from './deployment.routes.js';
import attendanceRoutes from './attendance.routes.js';
import payrollRoutes from './payroll.routes.js';
import reportRoutes from './report.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import settingsRoutes from './settings.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/guards', guardRoutes);
router.use('/clients', clientRoutes);
router.use('/deployments', deploymentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/payroll', payrollRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

export default router;