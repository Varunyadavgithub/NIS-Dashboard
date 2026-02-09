import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { authLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.js';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', protect, authorize('super_admin', 'admin'), validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

export default router;