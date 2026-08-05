import { Router } from 'express';
import {
  login,
  loginValidators,
  logout,
  me,
  register,
  registerValidators,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.get('/me', protect, me);
router.post('/logout', protect, logout);

export default router;
