
import express from 'express';
import cors from 'cors';
import { db } from './db';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://insurcheck-admin.replit.app'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
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
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
