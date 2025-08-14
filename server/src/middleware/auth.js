
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Fetch fresh user data
    const user = await authService.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled.'
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};

export const requireSameTenant = (req, res, next) => {
  const { tenantId } = req.params;
  
  if (req.user.role === 'super-admin') {
    return next(); // Super admin can access any tenant
  }
  
  if (!req.user.tenantId || req.user.tenantId.toString() !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Invalid tenant.'
    });
  }
  
  next();
};

export const superAdminOnly = requireRole('super-admin');
