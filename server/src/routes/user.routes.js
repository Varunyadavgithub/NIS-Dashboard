import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updatePermissions,
  resetUserPassword,
  getUserActivity,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUsersSchema,
  updatePermissionsSchema,
} from '../validators/userValidator.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin', 'admin'));

router.route('/')
  .get(validate(listUsersSchema), getUsers)
  .post(validate(createUserSchema), createUser);

router.route('/:id')
  .get(validate(getUserSchema), getUser)
  .put(validate(updateUserSchema), updateUser)
  .delete(validate(getUserSchema), deleteUser);

router.patch('/:id/toggle-status', validate(getUserSchema), toggleUserStatus);
router.put('/:id/permissions', validate(updatePermissionsSchema), updatePermissions);
router.post('/:id/reset-password', validate(getUserSchema), resetUserPassword);
router.get('/:id/activity', validate(getUserSchema), getUserActivity);

export default router;