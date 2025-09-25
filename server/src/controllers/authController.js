import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { config } from '../config/env.js';
import { db } from '../../db.ts';
import { users, tenants } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendEmailVerification, sendPasswordResetEmail } from '../../services/emailService.js';
import { parsePhoneNumber } from 'libphonenumber-js';

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
    console.log(`Found user - ID: ${user.id}, Role: ${user.role}, Active: ${user.isActive}, Email Verified: ${user.emailVerified}`);

    // Check if user is active and provide specific error messages
    if (user.isActive === false) {
      // Check if it's due to email verification
      if (!user.emailVerified) {
        console.log(`Login blocked - Email not verified for user: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Please verify your email address before logging in. Check your inbox for a verification link.',
          needsEmailVerification: true
        });
      }
      
      console.log(`Login blocked - Account deactivated for user: ${email}`);
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

    // Check tenant status and subscription for all tenant users (except super-admin)
    if (user.role !== 'super-admin' && user.tenantId) {
      console.log(`Checking tenant status for tenant ID: ${user.tenantId}`);
      
      const tenantResult = await db.select()
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1);
      
      if (tenantResult.length === 0) {
        console.log(`Tenant not found for ID: ${user.tenantId}`);
        return res.status(401).json({
          success: false,
          message: 'Your account is inactive. Please contact your administrator.',
          code: 'TENANT_NOT_FOUND'
        });
      }
      
      const tenant = tenantResult[0];
      console.log(`Tenant status check - Tenant: ${tenant.name}, Status: ${tenant.status}, Trial Active: ${tenant.isTrialActive}, Trial Ends: ${tenant.trialEndsAt}`);
      
      // Check if tenant is deactivated
      if (['deactivated', 'suspended', 'inactive'].includes(tenant.status)) {
        console.log(`Login blocked - Tenant ${tenant.name} has status: ${tenant.status}`);
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive. Please contact your administrator.',
          code: 'TENANT_DEACTIVATED',
          tenantStatus: tenant.status
        });
      }
      
      // Check trial period expiration
      const now = new Date();
      if (tenant.isTrialActive && tenant.trialEndsAt && new Date(tenant.trialEndsAt) < now) {
        console.log(`Login blocked - Trial expired for tenant ${tenant.name}. Trial ended: ${tenant.trialEndsAt}`);
        return res.status(403).json({
          success: false,
          message: 'Your trial period has ended. Please upgrade to continue.',
          code: 'TRIAL_EXPIRED',
          tenantStatus: tenant.status,
          trialEnded: true,
          trialEndDate: tenant.trialEndsAt
        });
      }
      
      // Check if subscription is cancelled but tenant still has some access
      if (tenant.status === 'cancelled') {
        console.log(`Login allowed but restricted - Tenant ${tenant.name} subscription cancelled`);
        // Allow login but will be restricted to read-only mode
        // This will be handled by middleware and frontend
      }
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

      // Get tenant information for response if user has tenantId
      let tenantInfo = null;
      if (user.tenantId) {
        const tenantResult = await db.select()
          .from(tenants)
          .where(eq(tenants.id, user.tenantId))
          .limit(1);
        
        if (tenantResult.length > 0) {
          const tenant = tenantResult[0];
          tenantInfo = {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status,
            subscriptionPlan: tenant.subscriptionPlan,
            isTrialActive: tenant.isTrialActive,
            trialEndsAt: tenant.trialEndsAt,
            maxUsers: tenant.maxUsers,
            storageLimit: tenant.storageLimit
          };
        }
      }

      res.status(200).json({
        success: true,
        message: 'Welcome back!',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            isActive: user.isActive
          },
          tenant: tenantInfo,
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
        message: `Invalid credentials. ${remainingAttempts} attempts remaining.`,
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

    console.log(`Super Admin login successful for user: ${email}`);

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

    // For tenant-admin users, check if their tenant account is suspended or deactivated
    if (user.role === 'tenant-admin' && user.tenantId) {
      console.log(`Checking tenant status for tenant ID: ${user.tenantId}`);
      
      const tenantResult = await db.select()
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1);
      
      if (tenantResult.length === 0) {
        console.log(`Tenant not found for ID: ${user.tenantId}`);
        return res.status(401).json({
          success: false,
          message: 'Account suspended. Please contact support.'
        });
      }
      
      const tenant = tenantResult[0];
      console.log(`Tenant status check - Tenant: ${tenant.name}, Status: ${tenant.status}`);
      
      // Prevent login for suspended, deactivated, or cancelled tenants
      if (['suspended', 'deactivated', 'cancelled', 'trial_expired'].includes(tenant.status)) {
        console.log(`Login blocked - Tenant ${tenant.name} has status: ${tenant.status}`);
        
        // Return appropriate message based on tenant status
        let message = 'Account suspended. Please contact support.';
        if (tenant.status === 'deactivated') {
          message = 'Account has been deactivated. Please contact support.';
        } else if (tenant.status === 'cancelled') {
          message = 'Account subscription has been cancelled. Please contact support.';
        } else if (tenant.status === 'trial_expired') {
          message = 'Trial period has expired. Please contact support.';
        }
        
        return res.status(403).json({
          success: false,
          message: message,
          tenantStatus: tenant.status
        });
      }
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

    if (userResult.length === 0 || (userResult[0].role !== 'tenant-admin' && userResult[0].role !== 'admin' && userResult[0].role !== 'super-admin')) {
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

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Update user with hashed reset token
    await db.update(users)
      .set({ 
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires 
      })
      .where(eq(users.id, user.id));

    // Generate reset link for super admin panel
    const adminFrontendUrl = process.env.ADMIN_FRONTEND_URL || 'https://dev-admin.insurcheck.ai';
    const resetLink = `${adminFrontendUrl}/super-admin/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(email, resetLink, user.firstName || user.email.split('@')[0]);
      
      if (!emailResult.success) {
        console.error('❌ Failed to send password reset email:', emailResult);
        // Still return success to user for security, but log the error
      }
    } catch (emailError) {
      console.error('❌ Exception during password reset email sending:', emailError);
      // Still return success to user for security, but log the error
    }
    
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

// Check if email exists in database
export const checkEmail = async (req, res) => {
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

    // Check if email exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    res.json({
      success: true,
      exists: existingUser.length > 0
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking email'
    });
  }
};

// User signup for client-user panel
export const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { fullName, email, password, phoneNumber, companyName, trialPeriod } = req.body;

    console.log(`User signup attempt - Email: ${email}, Name: ${fullName}`);

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      // Check if user exists but is not verified
      if (!existingUser[0].emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email exists but is not verified. Please check your email or request a new verification link.',
          needsVerification: true
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Email already registered and verified'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Generate email verification token and expiry (24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Parse phone number to extract country code
    let parsedPhoneNumber = null;
    let countryCode = null;
    if (phoneNumber) {
      try {
        parsedPhoneNumber = parsePhoneNumber(phoneNumber);
        if (parsedPhoneNumber && parsedPhoneNumber.isValid()) {
          countryCode = parsedPhoneNumber.country; // e.g., 'US', 'IN', 'UK'
          console.log(`📱 Parsed phone number - Country: ${countryCode}, Number: ${phoneNumber}`);
        } else {
          console.log(`⚠️ Invalid phone number provided: ${phoneNumber}`);
        }
      } catch (phoneError) {
        console.error(`❌ Error parsing phone number ${phoneNumber}:`, phoneError.message);
      }
    }

    // Create user with email verification pending
    const newUser = await db.insert(users).values({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      countryCode: countryCode || null,
      companyName: companyName,
      role: 'user',
      tenantId: null, // Individual user without tenant
      isActive: false, // Account inactive until email verified
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpiry,
      emailVerificationResendCount: 0,
      emailVerificationLastSent: new Date()
    }).returning();

    console.log(`✅ User created successfully - ID: ${newUser[0].id}, Email: ${email}`);
    console.log(`🔑 Verification token generated and sent via email`);
    console.log(`⏰ Token expires at: ${verificationExpiry.toISOString()}`);

    // Always use production frontend URL for email links - NEVER use replit domains
    const frontendUrl = process.env.FRONTEND_URL || 'https://dev-user.insurcheck.ai';
    
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    console.log(`🔗 Using frontend URL: ${frontendUrl}`);
    console.log(`🔗 Verification link generated: ${verificationLink}`);

    // Send verification email
    try {
      console.log(`📧 Starting email verification process for: ${email}`);
      console.log(`📤 Email parameters:`, {
        to: email,
        firstName: firstName,
        lastName: lastName,
        verificationLinkLength: verificationLink.length
      });

      const emailResult = await sendEmailVerification({
        to: email,
        firstName: firstName,
        lastName: lastName,
        verificationLink: verificationLink
      });

      if (!emailResult.success) {
        console.error('❌ Failed to send verification email:', emailResult);
        console.error('❌ Email service error details:', emailResult.error);
        console.error('❌ Full error response:', emailResult.details);
        // Still return success to user but log the error
      } else {
        console.log(`✅ Verification email sent successfully to: ${email}`);
        console.log(`📊 Email service response:`, emailResult);
      }
    } catch (emailError) {
      console.error('❌ Exception during email sending:', emailError);
      console.error('❌ Error message:', emailError.message);
      console.error('❌ Error stack:', emailError.stack);
      // Still return success to user but log the error
    }

    res.status(201).json({
      success: true,
      message: 'Sign-up successful. Please check your email for verification.',
      data: {
        user: {
          id: newUser[0].id,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          email: newUser[0].email,
          role: newUser[0].role,
          emailVerified: false,
          isActive: false
        },
        // No token provided until email is verified
        trialPeriod: trialPeriod || 7,
        verificationSent: true
      }
    });

  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during sign-up'
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

// Email verification endpoint
export const verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { token, email } = req.body;

    console.log(`📧 Email verification attempt for: ${email}`);
    console.log(`🔑 Token received: ${token?.substring(0, 16)}...`);

    if (!token || !email) {
      console.log(`❌ Missing required fields - Token: ${!!token}, Email: ${!!email}`);
      return res.status(400).json({
        success: false,
        message: 'Verification token and email are required'
      });
    }

    // Find user by email and token
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      console.log(`❌ User not found for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid verification link - user not found'
      });
    }

    const user = userResult[0];
    console.log(`👤 Found user: ${user.id}, Email verified: ${user.emailVerified}, Has token: ${!!user.emailVerificationToken}`);

    // Check if already verified
    if (user.emailVerified) {
      console.log(`✅ User already verified: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Email already verified. You can now log in.',
        alreadyVerified: true
      });
    }

    // Check if token matches
    if (user.emailVerificationToken !== token) {
      console.log(`❌ Token mismatch for user: ${email}`);
      console.log(`🔑 Expected: ${user.emailVerificationToken?.substring(0, 16)}...`);
      console.log(`🔑 Received: ${token?.substring(0, 16)}...`);
      
      // Provide more specific error messages
      if (!user.emailVerificationToken) {
        return res.status(400).json({
          success: false,
          message: 'No verification token found. Please request a new verification email.',
          code: 'NO_TOKEN'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token. This link may be expired or already used. Please request a new verification email.',
        code: 'TOKEN_MISMATCH'
      });
    }

    // Check if token has expired (24 hours)
    const now = new Date();
    if (!user.emailVerificationExpires || user.emailVerificationExpires < now) {
      console.log(`⏰ Token expired for user: ${email}, Expiry: ${user.emailVerificationExpires}, Now: ${now}`);
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired. Please request a new one.',
        expired: true,
        expiredAt: user.emailVerificationExpires
      });
    }
    
    console.log(`🔓 Token validation successful for user: ${email}`);
    console.log(`⏰ Token expires at: ${user.emailVerificationExpires}`);
    console.log(`🕐 Current time: ${now}`);

    // Verify the email and activate the account
    await db.update(users)
      .set({
        emailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerificationResendCount: 0,
        emailVerificationLastSent: null
      })
      .where(eq(users.id, user.id));

    console.log(`✅ Email verified successfully for user: ${email}`);
    console.log(`🎯 User account activated. User must now log in manually.`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// Resend verification email endpoint
export const resendVerificationEmail = async (req, res) => {
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

    console.log(`Resend verification email request - Email: ${email}`);

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists and is not verified, a new verification email has been sent.'
      });
    }

    const user = userResult[0];

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in.',
        alreadyVerified: true
      });
    }

    // Check resend limit (3 attempts per hour)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const resendCount = user.emailVerificationResendCount || 0;
    const lastSent = user.emailVerificationLastSent;

    // Reset count if more than an hour has passed
    if (!lastSent || lastSent < oneHourAgo) {
      // More than an hour has passed, reset the count
    } else if (resendCount >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Resend limit reached. Try again later.',
        retryAfter: Math.ceil((lastSent.getTime() + 60 * 60 * 1000 - now.getTime()) / 1000 / 60) // minutes remaining
      });
    }

    // Generate new verification token and expiry
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with new token and increment resend count
    const newResendCount = (!lastSent || lastSent < oneHourAgo) ? 1 : resendCount + 1;
    
    await db.update(users)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpiry,
        emailVerificationResendCount: newResendCount,
        emailVerificationLastSent: now
      })
      .where(eq(users.id, user.id));

    // Generate verification link
    const frontendUrl = process.env.FRONTEND_URL || 'https://dev-user.insurcheck.ai';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    // Send verification email
    try {
      const emailResult = await sendEmailVerification({
        to: email,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationLink: verificationLink
      });

      if (!emailResult.success) {
        console.error('Failed to resend verification email:', emailResult);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again later.'
        });
      }

      console.log(`Verification email resent successfully to: ${email}`);
    } catch (emailError) {
      console.error('Error resending verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists and is not verified, a new verification email has been sent.',
      attemptsRemaining: Math.max(0, 3 - newResendCount)
    });

  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resend verification'
    });
  }
};

// User forgot password - send reset email
export const userForgotPassword = async (req, res) => {
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
    console.log(`User forgot password request - Email: ${email}`);

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      // For security, don't reveal whether email exists
      return res.status(200).json({
        success: true,
        message: 'If that email address is registered, you will receive password reset instructions'
      });
    }

    const user = userResult[0];

    // Check if user is active (but don't reveal this information)
    if (!user.isActive) {
      // For security, don't reveal account status - return same success message
      return res.status(200).json({
        success: true,
        message: 'If that email address is registered, you will receive password reset instructions'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    await db.update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpires
      })
      .where(eq(users.id, user.id));

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL || 'https://dev-user.insurcheck.ai'}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(email, resetLink, user.firstName || 'User');
      console.log(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Clear the token if email fails
      await db.update(users)
        .set({
          passwordResetToken: null,
          passwordResetExpires: null
        })
        .where(eq(users.id, user.id));
      
      // For security, don't reveal email sending failure - return same success message
      return res.status(200).json({
        success: true,
        message: 'If that email address is registered, you will receive password reset instructions'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your email'
    });

  } catch (error) {
    console.error('User forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Validate reset token
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    // Hash the token to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // First try to find user by raw token (current implementation)
    let userResult = await db.select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);

    // If not found with raw token, try with hashed token (for backward compatibility)
    if (userResult.length === 0) {
      userResult = await db.select()
        .from(users)
        .where(eq(users.passwordResetToken, hashedToken))
        .limit(1);
    }

    if (userResult.length === 0) {
      console.log(`❌ Token validation failed - no user found with token`);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link',
        valid: false
      });
    }

    const user = userResult[0];
    console.log(`✅ Token validation - Found user: ${user.email}, Token expires: ${user.passwordResetExpires}`);

    // Check if token is expired
    const now = new Date();
    if (!user.passwordResetExpires || now > user.passwordResetExpires) {
      console.log(`❌ Token expired - Now: ${now.toISOString()}, Expires: ${user.passwordResetExpires}`);
      // Clear expired token
      await db.update(users)
        .set({
          passwordResetToken: null,
          passwordResetExpires: null
        })
        .where(eq(users.id, user.id));

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link',
        valid: false
      });
    }

    console.log(`✅ Token validation successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      valid: true
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      valid: false
    });
  }
};

// Reset password using token
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Hash the token to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by hashed reset token
    const userResult = await db.select()
      .from(users)
      .where(eq(users.passwordResetToken, hashedToken))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link'
      });
    }

    const user = userResult[0];

    // Check if token is expired
    const now = new Date();
    if (!user.passwordResetExpires || now > user.passwordResetExpires) {
      // Clear expired token
      await db.update(users)
        .set({
          passwordResetToken: null,
          passwordResetExpires: null
        })
        .where(eq(users.id, user.id));

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0, // Reset failed attempts
        accountLockedUntil: null, // Clear any lockout
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    console.log(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};