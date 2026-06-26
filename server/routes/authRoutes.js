

import { Router } from 'express';
import {
  signup,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  refreshTokenHandler,
  getMe,
  logout,
  changePassword,
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);

router.post('/google', googleAuth);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshTokenHandler);

router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/change-password', protect, changePassword);

export default router;
