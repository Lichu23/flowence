import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { ApiResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types';
import { ValidationError, AuthenticationError } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Validation rules
  static loginValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required')
  ];

  static registerValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name is required and must be less than 255 characters'),
    body('storeName')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Store name is required and must be less than 255 characters')
  ];

  static refreshTokenValidation = [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ];

  static changePasswordValidation = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
  ];

  static forgotPasswordValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required')
  ];

  static resetPasswordValidation = [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
  ];

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array().map(error => ({
              field: error.type === 'field' ? error.path : 'unknown',
              message: error.msg,
              value: error.type === 'field' ? error.value : undefined
            }))
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const registerData: RegisterRequest = req.body;
      const result = await this.authService.register(registerData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User registered successfully',
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            details: error.details
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array().map(error => ({
              field: error.type === 'field' ? error.path : 'unknown',
              message: error.msg,
              value: error.type === 'field' ? error.value : undefined
            }))
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const loginData: LoginRequest = req.body;
      const result = await this.authService.login(loginData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login successful',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: error.message
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Login failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array().map(error => ({
              field: error.type === 'field' ? error.path : 'unknown',
              message: error.msg,
              value: error.type === 'field' ? error.value : undefined
            }))
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { refreshToken }: RefreshTokenRequest = req.body;
      const result = await this.authService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Token refresh error:', error);

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: error.message
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: 'Token refresh failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array().map(error => ({
              field: error.type === 'field' ? error.path : 'unknown',
              message: error.msg,
              value: error.type === 'field' ? error.value : undefined
            }))
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user.id;

      await this.authService.changePassword(userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Password change error:', error);

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: error.message
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            details: error.details
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_FAILED',
          message: 'Password change failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array().map(error => ({
              field: error.type === 'field' ? error.path : 'unknown',
              message: error.msg,
              value: error.type === 'field' ? error.value : undefined
            }))
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { email } = req.body;
      await this.authService.forgotPassword(email);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset instructions sent to your email',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Forgot password error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'FORGOT_PASSWORD_FAILED',
          message: 'Password reset request failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array().map(error => ({
              field: error.type === 'field' ? error.path : 'unknown',
              message: error.msg,
              value: error.type === 'field' ? error.value : undefined
            }))
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Password reset error:', error);

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_RESET_TOKEN',
            message: error.message
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            details: error.details
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'PASSWORD_RESET_FAILED',
          message: 'Password reset failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      await this.authService.logout(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Logout error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

