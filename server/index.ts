
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db';
import healthRoutes from './src/routes/health.js';
import tenantRoutes from './src/routes/tenants.js';
import authRoutes from './src/routes/auth.js';
import adminUserRoutes from './src/routes/adminUsers.js';
import complianceRuleRoutes from './src/routes/complianceRules.js';
import notificationTemplatesRoutes from './src/routes/notificationTemplates.js';
import invoicesRoutes from './src/routes/invoices.js';
import adminInvoicesRoutes from './src/routes/adminInvoices.js';
import complianceAnalyticsRoutes from './src/routes/complianceAnalytics.js';
import adminSubscriptionRoutes from './src/routes/adminSubscription.js';
import stripeWebhookRoutes from './src/routes/stripeWebhook.js';
import usageRoutes from './src/routes/usage.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Middleware - Enhanced CORS configuration
app.use(cors({
  origin: function (origin: any, callback: any) {
    // Only log CORS details in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CORS] Checking origin:', origin);
    }
    
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[CORS] No origin - allowing');
      }
      return callback(null, true);
    }
    
    // Allow Replit dev origins ONLY in development
    if (process.env.NODE_ENV === 'development' && origin && (origin.includes('.replit.dev') || origin.includes('.repl.co'))) {
      console.log('[CORS] Replit domain detected (dev mode) - allowing:', origin);
      return callback(null, true);
    }
    
    // Allow localhost origins in development
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[CORS] Localhost domain detected - allowing:', origin);
      }
      return callback(null, true);
    }
    
    // Allow specific production domains from environment
    const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CLIENT_ADMIN_URL,
      process.env.CLIENT_USER_URL,
      ...corsOrigins
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.includes(origin)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[CORS] Allowed origin matched - allowing:', origin);
      }
      return callback(null, true);
    }
    
    // For development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      console.log('[CORS] Development mode - allowing:', origin);
      return callback(null, true);
    }
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CORS] Origin not allowed:', origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Stripe webhook (MUST be before JSON middleware to preserve raw body)
app.use('/api/stripe', stripeWebhookRoutes);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Logging middleware (sanitized for production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Health endpoint now handled by modular health routes

// Auth routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/compliance-rules', complianceRuleRoutes);
app.use('/api/admin/notification-templates', notificationTemplatesRoutes);
app.use('/api/admin/invoices', adminInvoicesRoutes);
app.use('/api/admin/compliance-analytics', complianceAnalyticsRoutes);
app.use('/api/admin/subscription', adminSubscriptionRoutes);

// Usage and billing routes (mount before general API routes to avoid conflicts)
app.use('/api/usage', usageRoutes);
app.use('/api/billing', usageRoutes);

// System routes
app.use('/api/health', healthRoutes);

// Super Admin routes
app.use('/api/tenants', tenantRoutes);

// Static file serving removed for independent deployment
// Each client should be served from its own hosting (Vercel, Netlify, etc.)
// For local development, run each client separately with 'npm run dev'

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// API-only server - no SPA fallback routing
// Clients handle their own routing when served independently
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.status(404).json({ 
      error: 'Not found',
      message: 'This is an API-only server. Please access the frontend applications separately.'
    });
  }
});

// Validate required environment variables
function validateRequiredSecrets() {
  // Core required secrets for all deployments
  const requiredSecrets = [
    'JWT_SECRET',
    'DATABASE_URL', // PostgreSQL connection required
  ];
  
  // Payment processing secrets (critical for subscription functionality)
  const paymentSecrets = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  // Email service secrets (critical for user communication)
  const emailSecrets = [
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL'
  ];
  
  // AWS secrets (required if S3 features are enabled)
  const awsSecrets = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME'
  ];
  
  // Check core secrets first (always required)
  const missingCoreSecrets = requiredSecrets.filter(secret => !process.env[secret]);
  
  // Check payment secrets (required for production)
  const missingPaymentSecrets = paymentSecrets.filter(secret => !process.env[secret]);
  
  // Check email secrets (required for user operations)
  const missingEmailSecrets = emailSecrets.filter(secret => !process.env[secret]);
  
  // Check AWS secrets (conditionally required)
  const missingAwsSecrets = awsSecrets.filter(secret => !process.env[secret]);
  const hasAnyAwsSecret = awsSecrets.some(secret => process.env[secret]);
  
  // Collect all missing secrets
  const allMissingSecrets = [
    ...missingCoreSecrets,
    ...missingPaymentSecrets,
    ...missingEmailSecrets
  ];
  
  // Add AWS secrets to missing list if any AWS secret is present (indicating S3 is intended to be used)
  if (hasAnyAwsSecret && missingAwsSecrets.length > 0) {
    allMissingSecrets.push(...missingAwsSecrets);
  }
  
  if (allMissingSecrets.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables for production deployment:');
    console.error('Core secrets:', missingCoreSecrets.length > 0 ? missingCoreSecrets : '✅ All present');
    console.error('Payment secrets:', missingPaymentSecrets.length > 0 ? missingPaymentSecrets : '✅ All present');
    console.error('Email secrets:', missingEmailSecrets.length > 0 ? missingEmailSecrets : '✅ All present');
    
    if (hasAnyAwsSecret) {
      console.error('AWS secrets (S3 detected):', missingAwsSecrets.length > 0 ? missingAwsSecrets : '✅ All present');
    } else {
      console.error('AWS secrets: ⚠️ Not configured (S3 features disabled)');
    }
    
    console.error('❌ Server cannot start without required secrets. Please set:', allMissingSecrets.join(', '));
    console.error('❌ This is a production-blocking security issue.');
    process.exit(1);
  }
  
  console.log('✅ All required secrets are present and validated');
  console.log('🔒 Core secrets: ✅');
  console.log('💳 Payment secrets: ✅');
  console.log('📧 Email secrets: ✅');
  
  if (hasAnyAwsSecret) {
    console.log('☁️ AWS S3 secrets: ✅');
  } else {
    console.log('☁️ AWS S3: Not configured (optional)');
  }
}

// Database connection test
async function testDatabaseConnection() {
  try {
    await db.$client.query('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    // Validate required secrets first
    validateRequiredSecrets();
    
    await testDatabaseConnection();

    // Environment variables logging (development only)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔑 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Present' : 'Missing');
      console.log('📧 SENDGRID_API_KEY loaded:', process.env.SENDGRID_API_KEY ? 'Present' : 'Missing');
      console.log('📬 SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL ? 'Present' : 'Missing');
      console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL ? 'Present' : 'Missing');
    }

    // Initialize email service
    const emailService = await import('./src/services/emailService.js');
    emailService.initializeEmailService();
    
    app.listen(PORT, '0.0.0.0', () => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`${timestamp} [express] 🚀 InsurCheck Server running on port ${PORT}`);
      console.log(`${timestamp} [express] 📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`${timestamp} [express] 🏥 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`${timestamp} [express] 🔗 API Base: http://0.0.0.0:${PORT}/api`);
      console.log(`${timestamp} [express] 🎯 Super Admin Login: http://0.0.0.0:${PORT}/api/auth/super-admin/login`);
      console.log(`${timestamp} [express] 🎯 Run client-admin: cd client-admin && npm run dev`);
      console.log(`${timestamp} [express] 🎯 Run client-user: cd client-user && npm run dev`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
