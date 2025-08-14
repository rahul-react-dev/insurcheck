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
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          isActive: user.isActive
        },
        token
      }
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