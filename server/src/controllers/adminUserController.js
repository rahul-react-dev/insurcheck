import { db } from '../../db.ts';
import { users, tenants } from '@shared/schema';
import { eq, like, or, desc, asc, count, gte } from 'drizzle-orm';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../services/emailService.js';

// Get all users for the admin's tenant with search, sorting, and pagination
export const getAdminUsers = async (req, res) => {
  try {
    const { tenantId } = req.user; // Admin's tenant
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    console.log(`📋 Admin Users: Fetching users for tenant ${tenantId}`);

    const offset = (page - 1) * limit;
    const validSortFields = ['firstName', 'lastName', 'email', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Build base query with tenant filter - using only existing fields
    let selectQuery = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt
      })
      .from(users);

    let countQuery = db
      .select({ count: count() })
      .from(users);

    // Apply tenant filter and search
    if (search) {
      selectQuery = selectQuery.where(
        eq(users.tenantId, tenantId),
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
      countQuery = countQuery.where(
        eq(users.tenantId, tenantId),
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    } else {
      selectQuery = selectQuery.where(eq(users.tenantId, tenantId));
      countQuery = countQuery.where(eq(users.tenantId, tenantId));
    }

    // Apply pagination and sorting  
    const userList = await selectQuery
      .limit(parseInt(limit))
      .offset(offset)
      .orderBy(orderFn(users.createdAt)); // Use a safe default sort

    const totalResult = await countQuery;
    const total = totalResult[0].count;

    console.log(`✅ Admin Users: Found ${userList.length} users (${total} total)`);

    res.json({
      success: true,
      data: userList,
      meta: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

// Invite a new user to the admin's tenant
export const inviteUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { tenantId } = req.user; // Admin's tenant
    const { username, email, role = 'user' } = req.body;

    console.log(`👤 Admin Invite: Creating user ${username} (${email}) for tenant ${tenantId}`);

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user
    const newUser = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role,
      tenantId,
      isActive: true
    }).returning();

    // Send invitation email (if email service is configured)
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to InsurCheck - Account Created',
        html: `
          <h2>Welcome to InsurCheck!</h2>
          <p>Hello ${username},</p>
          <p>Your account has been created. Here are your login credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
          </ul>
          <p>Please log in and change your password immediately.</p>
          <p>Best regards,<br>InsurCheck Team</p>
        `
      });
      console.log(`📧 Invitation email sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    console.log(`✅ Admin Invite: User ${email} created successfully`);

    res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        role: newUser[0].role,
        tempPassword // Include in response for admin to share manually if email fails
      }
    });

  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
};

// Export users data in different formats
export const exportUsers = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { format = 'csv', search = '' } = req.query;

    console.log(`📤 Admin Export: Exporting users in ${format} format for tenant ${tenantId}`);

    // Get all users for export (no pagination)
    let exportQuery = db
      .select({
        userId: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        registrationDate: users.createdAt,
        accountStatus: users.isActive,
        lastLogin: users.lastLoginAt
      })
      .from(users);

    // Apply filters
    if (search) {
      exportQuery = exportQuery.where(
        eq(users.tenantId, tenantId),
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    } else {
      exportQuery = exportQuery.where(eq(users.tenantId, tenantId));
    }

    const userData = await exportQuery.orderBy(desc(users.createdAt));

    // Format data for export
    const exportData = userData.map(user => ({
      'User ID': user.userId,
      'Full Name': `${user.fullName} ${user.lastName}`,
      'Email Address': user.email,
      'Phone Number': user.phoneNumber || 'Not provided',
      'Company Name': user.companyName || 'Not provided',
      'Registration Date': new Date(user.registrationDate).toLocaleDateString(),
      'Account Status': user.accountStatus ? 'Active' : 'Inactive'
    }));

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `Users_${timestamp}`;

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(exportData);
    }

    // For now, return JSON format as fallback
    // TODO: Implement PDF and Excel formats with proper libraries
    res.json({
      success: true,
      message: `Export in ${format} format coming soon. Here's the data:`,
      data: exportData,
      meta: {
        format,
        filename,
        count: exportData.length
      }
    });

  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to export ${req.query.format || 'data'}. Please try again.`
    });
  }
};

// Get user statistics for the admin's tenant
export const getUserStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    const activeUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId), eq(users.isActive, true));

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    res.json({
      success: true,
      data: {
        total: totalUsers[0].count,
        active: activeUsers[0].count,
        inactive: totalUsers[0].count - activeUsers[0].count,
        recentlyAdded: recentUsers[0].count
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics'
    });
  }
};