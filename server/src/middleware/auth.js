import jwt from 'jsonwebtoken';
import { db } from '../../db.js';
import { users } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { config } from '../config/env.js';

const JWT_SECRET = config.jwtSecret;
console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? 'Present' : 'Missing');

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔍 Token decoded successfully:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
      
      // Fetch user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      console.log('👤 User lookup result:', user ? { id: user.id, email: user.email, active: user.isActive } : 'No user found');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user inactive'
        });
      }

      // Add user info to request
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        name: user.name
      };

      next();
    } catch (tokenError) {
      console.error('❌ Token verification failed:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};