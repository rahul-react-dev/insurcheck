import { config } from '../config/env.js';

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) return callback(null, true);
    
    // Allow Replit dev origins
    if (origin && origin.includes('.replit.dev')) {
      return callback(null, true);
    }
    
    if (config.clientUrls && config.clientUrls.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any localhost origin in development
    if (config.nodeEnv === 'development' && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    // For development, be more permissive
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
