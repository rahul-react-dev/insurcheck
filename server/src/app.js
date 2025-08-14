import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { corsOptions } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for Replit environment
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Remove trustProxy or set it to false for development
  trustProxy: false
});
app.use('/api/', limiter);

// CORS
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
import tenantRoutes from './routes/tenants.js';

// Import super admin routes
import superAdminRoutes from '../routes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api', healthRoutes);
app.use('/api', superAdminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'InsurCheck API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

export default app;