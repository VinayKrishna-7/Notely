import { Router } from 'express';
import { authController } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../validators/authValidator';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);
router.put('/profile', protect, validateBody(updateProfileSchema), authController.updateProfile);
router.put('/password', protect, validateBody(changePasswordSchema), authController.changePassword);
router.delete('/account', protect, validateBody(deleteAccountSchema), authController.deleteAccount);

export const authRoutes = router;
