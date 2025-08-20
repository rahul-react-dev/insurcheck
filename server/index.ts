
import express from 'express';
import cors from 'cors';
import { db } from './db';
import routes from './routes.js';
import authRoutes from './src/routes/auth.js';
import adminUserRoutes from './src/routes/adminUsers.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware - Enhanced CORS configuration
app.use(cors({
  origin: function (origin: any, callback: any) {
    console.log('[CORS] Checking origin:', origin);
    
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) {
      console.log('[CORS] No origin - allowing');
      return callback(null, true);
    }
    
    // Allow Replit dev origins (including janeway.replit.dev)
    if (origin && (origin.includes('.replit.dev') || origin.includes('.repl.co'))) {
      console.log('[CORS] Replit domain detected - allowing:', origin);
      return callback(null, true);
    }
    
    // Allow localhost origins in development
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('[CORS] Localhost domain detected - allowing:', origin);
      return callback(null, true);
    }
    
    // Allow specific production domains
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://insurcheck-admin.replit.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] Allowed origin matched - allowing:', origin);
      return callback(null, true);
    }
    
    // For development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      console.log('[CORS] Development mode - allowing:', origin);
      return callback(null, true);
    }
    
    console.log('[CORS] Origin not allowed:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle preflight requests
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('[CORS] Preflight request from origin:', origin);
  
  // Set CORS headers for preflight
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin/users', adminUserRoutes);

// API routes
app.use('/api', routes);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ error: 'API route not found' });
  } else {
    res.status(404).json({ 
      error: 'Frontend not served by this server',
      message: 'Run client-admin or client-user separately',
      instructions: {
        admin: 'cd client-admin && npm run dev',
        user: 'cd client-user && npm run dev'
      }
    });
  }
});

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
    await testDatabaseConnection();
    
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
