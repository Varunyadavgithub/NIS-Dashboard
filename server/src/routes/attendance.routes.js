import express from 'express';
import {
  getAttendance,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  bulkMarkAttendance,
  checkIn,
  checkOut,
  verifyAttendance,
  bulkVerifyAttendance,
  getDailySummary,
  getMonthlySummary,
  getAttendanceStats,
} from '../controllers/attendance.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import {
  markAttendanceSchema,
  updateAttendanceSchema,
  bulkAttendanceSchema,
  getAttendanceSchema,
  listAttendanceSchema,
  checkInSchema,
  checkOutSchema,
} from '../validators/attendanceValidator.js';

const router = express.Router();

router.use(protect);

router.get('/daily-summary', getDailySummary);
router.get('/monthly-summary', getMonthlySummary);
router.get('/stats', getAttendanceStats);
router.post('/bulk', authorize('super_admin', 'admin', 'manager', 'supervisor'), validate(bulkAttendanceSchema), bulkMarkAttendance);
router.post('/check-in', authorize('super_admin', 'admin', 'manager', 'supervisor'), validate(checkInSchema), checkIn);
router.patch('/bulk-verify', authorize('super_admin', 'admin', 'manager'), bulkVerifyAttendance);

router.route('/')
  .get(validate(listAttendanceSchema), getAttendance)
  .post(authorize('super_admin', 'admin', 'manager', 'supervisor'), validate(markAttendanceSchema), markAttendance);

router.route('/:id')
  .get(validate(getAttendanceSchema), getAttendanceById)
  .put(authorize('super_admin', 'admin', 'manager', 'supervisor'), validate(updateAttendanceSchema), updateAttendance)
  .delete(authorize('super_admin', 'admin'), validate(getAttendanceSchema), deleteAttendance);

router.post('/:id/check-out', authorize('super_admin', 'admin', 'manager', 'supervisor'), validate(checkOutSchema), checkOut);
router.patch('/:id/verify', authorize('super_admin', 'admin', 'manager'), verifyAttendance);

export default router;