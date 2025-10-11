import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { ApiResponse } from './types';

// Import routes
import authRoutes from './routes/auth';
import storeRoutes from './routes/stores';
import invitationRoutes from './routes/invitations';
import productRoutes from './routes/products';

const app: Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.server.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).requestTime = new Date().toISOString();
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: config.server.appVersion
    },
    message: 'Server is running',
    timestamp: new Date().toISOString()
  };

  res.status(200).json(response);
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: config.server.appName,
      version: config.server.appVersion,
      description: config.server.appDescription,
      environment: config.server.nodeEnv,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        auth: '/api/auth/*',
        stores: '/api/stores/*',
        invitations: '/api/invitations/*',
        products: '/api/products/*',
        api: '/api'
      }
    },
    message: 'Welcome to Flowence API',
    timestamp: new Date().toISOString()
  };

  res.status(200).json(response);
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api', productRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;