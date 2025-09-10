import { config } from '../config/env.js';

export const corsOptions = {
  origin: function (origin, callback) {
    console.log('[CORS] Checking origin:', origin);
    
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) {
      console.log('[CORS] No origin - allowing');
      return callback(null, true);
    }
    
    // Allow Replit dev origins (including different ports)
    if (origin && origin.includes('.replit.dev')) {
      console.log('[CORS] Replit domain detected - allowing:', origin);
      return callback(null, true);
    }
    
    if (config.clientUrls && config.clientUrls.includes(origin)) {
      console.log('[CORS] ClientUrl match - allowing:', origin);
      return callback(null, true);
    }
    
    // Allow any localhost origin in development
    if (config.nodeEnv === 'development' && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('[CORS] Localhost domain detected - allowing:', origin);
      return callback(null, true);
    }
    
    // For development, be more permissive
    if (config.nodeEnv === 'development') {
      console.log('[CORS] Development mode - allowing:', origin);
      return callback(null, true);
    }
    
    console.log('[CORS] Origin rejected:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
};
