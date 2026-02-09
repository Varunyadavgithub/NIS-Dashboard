import express from 'express';
import {
  getGuards,
  getGuard,
  createGuard,
  updateGuard,
  deleteGuard,
  updateGuardStatus,
  uploadPhoto,
  uploadDocument,
  getGuardAttendance,
  getGuardDeployments,
  getAvailableGuards,
  getGuardStats,
  importGuards,
} from '../controllers/guard.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { uploadSingle } from '../middlewares/upload.js';
import {
  createGuardSchema,
  updateGuardSchema,
  getGuardSchema,
  listGuardsSchema,
} from '../validators/guardValidator.js';

const router = express.Router();

router.use(protect);

router.get('/available', getAvailableGuards);
router.get('/stats', getGuardStats);
router.post('/import', authorize('super_admin', 'admin', 'manager'), importGuards);

router.route('/')
  .get(validate(listGuardsSchema), getGuards)
  .post(authorize('super_admin', 'admin', 'manager'), validate(createGuardSchema), createGuard);

router.route('/:id')
  .get(validate(getGuardSchema), getGuard)
  .put(authorize('super_admin', 'admin', 'manager'), validate(updateGuardSchema), updateGuard)
  .delete(authorize('super_admin', 'admin'), validate(getGuardSchema), deleteGuard);

router.patch('/:id/status', authorize('super_admin', 'admin', 'manager'), updateGuardStatus);
router.post('/:id/photo', authorize('super_admin', 'admin', 'manager'), uploadSingle('photo'), uploadPhoto);
router.post('/:id/documents', authorize('super_admin', 'admin', 'manager'), uploadSingle('document'), uploadDocument);
router.get('/:id/attendance', validate(getGuardSchema), getGuardAttendance);
router.get('/:id/deployments', validate(getGuardSchema), getGuardDeployments);

export default router;