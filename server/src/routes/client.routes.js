import express from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  addSite,
  updateSite,
  deleteSite,
  getClientGuards,
  getClientDeployments,
  addNote,
  getExpiringContracts,
  getClientStats,
} from '../controllers/client.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import {
  createClientSchema,
  updateClientSchema,
  getClientSchema,
  listClientsSchema,
  addSiteSchema,
} from '../validators/clientValidator.js';

const router = express.Router();

router.use(protect);

router.get('/expiring-contracts', getExpiringContracts);
router.get('/stats', getClientStats);

router.route('/')
  .get(validate(listClientsSchema), getClients)
  .post(authorize('super_admin', 'admin', 'manager'), validate(createClientSchema), createClient);

router.route('/:id')
  .get(validate(getClientSchema), getClient)
  .put(authorize('super_admin', 'admin', 'manager'), validate(updateClientSchema), updateClient)
  .delete(authorize('super_admin', 'admin'), validate(getClientSchema), deleteClient);

router.post('/:id/sites', authorize('super_admin', 'admin', 'manager'), validate(addSiteSchema), addSite);
router.put('/:id/sites/:siteId', authorize('super_admin', 'admin', 'manager'), updateSite);
router.delete('/:id/sites/:siteId', authorize('super_admin', 'admin'), deleteSite);
router.get('/:id/guards', validate(getClientSchema), getClientGuards);
router.get('/:id/deployments', validate(getClientSchema), getClientDeployments);
router.post('/:id/notes', addNote);

export default router;