import express from 'express';
import { db } from '../../db.ts';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check database connection using Drizzle
    await db.execute(sql`SELECT NOW()`);
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      services: {
        database: 'disconnected',
        api: 'running'
      }
    });
  }
});

export default router;
