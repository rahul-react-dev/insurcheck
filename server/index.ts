
import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { db } from './db.js';
import { sql } from 'drizzle-orm';

// Import routes
import authRoutes from './src/routes/auth.js';
import healthRoutes from './src/routes/health.js';

// Load environment variables
dotenv.config();

const app = express();
const server: Server = createServer(app);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS
const corsOptions = {
  origin: [
    'http://localhost:3000', // admin client
    'http://localhost:3001', // user client
    'http://localhost:5173', // vite default port
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection
const testDbConnection = async () => {
  try {
    await db.execute(sql`SELECT NOW()`);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'InsurCheck API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

(async () => {
  // Test database connection first
  await testDbConnection();
  
  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 InsurCheck Server running on port ${port}`);
    log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`🏥 Health check: http://0.0.0.0:${port}/api/health`);
    log(`🔗 API Base: http://0.0.0.0:${port}/api`);
  });
})();
