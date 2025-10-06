import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserModel } from '../models/User';
import { AuthenticatedRequest, JwtPayload, AuthenticationError, AuthorizationError } from '../types';

const userModel = new UserModel();

export const authenticateToken = async (
  req: AuthenticatedRequest,
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
    const payload = jwt.verify(token, config.jwt.secret, {
      issuer: 'flowence',
      audience: 'flowence-users'
    }) as JwtPayload;

    if (payload.type !== 'access') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_TYPE',
          message: 'Invalid token type'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

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
    req.user = user;
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

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
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

    if (!roles.includes(req.user.role)) {
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

export const requireStoreAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
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

  if (!req.user.storeId) {
    res.status(403).json({
      success: false,
      error: {
        code: 'NO_STORE_ACCESS',
        message: 'User does not have access to any store'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

export const requireStoreOwnership = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
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

  if (req.user.role !== 'owner') {
    res.status(403).json({
      success: false,
      error: {
        code: 'OWNER_REQUIRED',
        message: 'Store ownership required'
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
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
    const payload = jwt.verify(token, config.jwt.secret, {
      issuer: 'flowence',
      audience: 'flowence-users'
    }) as JwtPayload;

    if (payload.type === 'access') {
      // Get user from database
      const user = await userModel.findById(payload.userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this user'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    userRequests.count++;
    next();
  };
};

