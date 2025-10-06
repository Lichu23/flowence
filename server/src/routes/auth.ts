import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', AuthController.registerValidation, authController.register.bind(authController));
router.post('/login', AuthController.loginValidation, authController.login.bind(authController));
router.post('/refresh-token', AuthController.refreshTokenValidation, authController.refreshToken.bind(authController));
router.post('/forgot-password', AuthController.forgotPasswordValidation, authController.forgotPassword.bind(authController));
router.post('/reset-password', AuthController.resetPasswordValidation, authController.resetPassword.bind(authController));

// Protected routes
router.post('/change-password', authenticateToken, AuthController.changePasswordValidation, authController.changePassword.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));

export default router;

