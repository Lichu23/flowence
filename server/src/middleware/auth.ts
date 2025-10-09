/**
 * Authentication Middleware
 * JWT token validation and user authentication
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserModel } from '../models/UserModel';
import { AuthenticatedRequest } from '../types';

const userModel = new UserModel();

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authenticate middleware
 * Validates JWT token and attaches user to request
 */
export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify token
    const payload = jwt.verify(token, config.jwt.secret as string, {
      issuer: 'flowence',
      audience: 'flowence-users'
    }) as JwtPayload;

    // Get user from database
    const user = await userModel.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Add user to request
    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Require specific roles
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Verify token
    const payload = jwt.verify(token, config.jwt.secret as string, {
      issuer: 'flowence',
      audience: 'flowence-users'
    }) as JwtPayload;

    // Get user from database
    const user = await userModel.findById(payload.userId);
    if (user) {
      (req as any).user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
