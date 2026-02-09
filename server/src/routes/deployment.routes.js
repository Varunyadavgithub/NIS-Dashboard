import express from 'express';
import {
  getDeployments,
  getDeployment,
  createDeployment,
  updateDeployment,
  terminateDeployment,
  addReplacement,
  transferDeployment,
  getDeploymentStats,
} from '../controllers/deployment.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import {
  createDeploymentSchema,
  updateDeploymentSchema,
  terminateDeploymentSchema,
  getDeploymentSchema,
  listDeploymentsSchema,
} from '../validators/deploymentValidator.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDeploymentStats);

router.route('/')
  .get(validate(listDeploymentsSchema), getDeployments)
  .post(authorize('super_admin', 'admin', 'manager'), validate(createDeploymentSchema), createDeployment);

router.route('/:id')
  .get(validate(getDeploymentSchema), getDeployment)
  .put(authorize('super_admin', 'admin', 'manager'), validate(updateDeploymentSchema), updateDeployment);

router.post('/:id/terminate', authorize('super_admin', 'admin', 'manager'), validate(terminateDeploymentSchema), terminateDeployment);
router.post('/:id/replacement', authorize('super_admin', 'admin', 'manager'), addReplacement);
router.post('/:id/transfer', authorize('super_admin', 'admin', 'manager'), transferDeployment);

export default router;