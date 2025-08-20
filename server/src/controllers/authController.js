import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { config } from '../config/env.js';
import { db } from '../../db.ts';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;

    console.log(`Login attempt - Email: ${email}, Role: ${role}`);

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult[0];
    console.log(`Found user - ID: ${user.id}, Role: ${user.role}, Active: ${user.isActive}`);

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check role matches
    if (user.role !== role) {
      console.log(`Role mismatch - User role: ${user.role}, Requested role: ${role}`);
      return res.status(401).json({
        success: false,
        message: `Invalid role for this user. User has role '${user.role}' but requested '${role}'`
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        tenantId: user.tenantId 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    console.log(`Login successful for user: ${email}`);

    // Update last login
      await db.update(users)
        .set({ 
          lastLoginAt: new Date(),
          failedLoginAttempts: 0,
          accountLockedUntil: null 
        })
        .where(eq(users.id, user.id));

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
            isActive: user.is_active
          },
          token
        }
      });

  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const superAdminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    console.log(`Super Admin login attempt - Email: ${email}`);

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult[0];
    console.log(`Found user - ID: ${user.id}, Role: ${user.role}, Active: ${user.isActive}`);

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user is super admin
    if (user.role !== 'super-admin') {
      console.log(`Access denied - User role: ${user.role}, Required: super-admin`);
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        tenantId: user.tenantId 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    console.log(`Super Admin login successful for user: ${email}`);

    // Update last login
    await db.update(users)
      .set({ 
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        accountLockedUntil: null 
      })
      .where(eq(users.id, user.id));

    res.status(200).json({
      success: true,
      message: 'Super Admin login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive
      },
      token
    });

  } catch (error) {
    console.error('Super Admin login error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during super admin login'
    });
  }
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Registration logic here
    res.status(501).json({
      success: false,
      message: 'Registration not implemented yet'
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Admin-specific login with lockout functionality
export const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log(`Admin login attempt - Email: ${email}`);

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email format or insufficient privileges'
      });
    }

    const user = userResult[0];
    console.log(`Found user - ID: ${user.id}, Role: ${user.role}, Active: ${user.isActive}`);

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user has admin role
    if (user.role !== 'tenant-admin' && user.role !== 'admin') {
      console.log(`Access denied - User role: ${user.role}, Required: tenant-admin/admin`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email format or insufficient privileges'
      });
    }

    // Check if account is locked
    const now = new Date();
    if (user.accountLockedUntil && user.accountLockedUntil > now) {
      const remainingTime = Math.ceil((user.accountLockedUntil - now) / 1000 / 60); // minutes
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remainingTime} minutes.`,
        lockoutTime: user.accountLockedUntil.toISOString()
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      let updateData = { failedLoginAttempts: failedAttempts };
      
      // Lock account after 5 failed attempts for 15 minutes
      if (failedAttempts >= 5) {
        const lockoutTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
        updateData.accountLockedUntil = lockoutTime;
        
        await db.update(users)
          .set(updateData)
          .where(eq(users.id, user.id));
          
        return res.status(423).json({
          success: false,
          message: 'Account locked. Try again in 15 minutes.',
          lockoutTime: lockoutTime.toISOString()
        });
      }
      
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
      
      const remainingAttempts = 5 - failedAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${remainingAttempts} attempts remaining.`,
        attemptsRemaining: remainingAttempts
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        tenantId: user.tenantId 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    console.log(`Admin login successful for user: ${email}`);

    // Update last login and reset failed attempts
    await db.update(users)
      .set({ 
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        accountLockedUntil: null 
      })
      .where(eq(users.id, user.id));

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          isActive: user.isActive
        },
        token
      }
    });

  } catch (error) {
    console.error('Admin login error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// Admin forgot password functionality
export const adminForgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    console.log(`Admin forgot password request - Email: ${email}`);

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0 || (userResult[0].role !== 'tenant-admin' && userResult[0].role !== 'admin')) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If an admin account with that email exists, a password reset link has been sent.'
      });
    }

    const user = userResult[0];
    
    // Check if user is active
    if (user.isActive === false) {
      return res.status(200).json({
        success: true,
        message: 'If an admin account with that email exists, a password reset link has been sent.'
      });
    }

    // In a real implementation, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send email with reset link
    
    // For now, we'll just log and return success
    console.log(`Password reset would be sent to: ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'If an admin account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Admin forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing forgot password request'
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username,
        role: user[0].role,
        tenantId: user[0].tenantId
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};