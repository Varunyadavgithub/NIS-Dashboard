import express from 'express';
import {
  getAllSettings,
  getSettingsByCategory,
  getSetting,
  updateSetting,
  bulkUpdateSettings,
  createSetting,
  deleteSetting,
  initializeSettings,
  getCompanySettings,
  updateCompanySettings,
  getPayrollSettings,
  getAttendanceSettings,
} from '../controllers/settings.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect);

router.get('/company', getCompanySettings);
router.get('/payroll', getPayrollSettings);
router.get('/attendance', getAttendanceSettings);
router.get('/category/:category', getSettingsByCategory);

router.route('/')
  .get(getAllSettings)
  .post(authorize('super_admin', 'admin'), createSetting)
  .put(authorize('super_admin', 'admin'), bulkUpdateSettings);

router.post('/initialize', authorize('super_admin'), initializeSettings);
router.put('/company', authorize('super_admin', 'admin'), updateCompanySettings);

router.route('/:key')
  .get(getSetting)
  .put(authorize('super_admin', 'admin'), updateSetting)
  .delete(authorize('super_admin'), deleteSetting);

export default router;