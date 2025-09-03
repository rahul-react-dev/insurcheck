import { db } from '../../db.ts';
import { users, tenants, subscriptions, subscriptionPlans } from '@shared/schema';
import { eq, like, or, and, desc, asc, count, gte } from 'drizzle-orm';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../services/emailService.js';
import XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    const validSortFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'companyName', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Build base query with tenant filter - using fields for User ID, Full Name, Email, Phone, Company, Registration Date, Status
    let selectQuery = db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        companyName: users.companyName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      })
      .from(users);

    let countQuery = db
      .select({ count: count() })
      .from(users);

    // Apply tenant filter and search (search in Full Name, Email, Phone, Company)
    if (search) {
      selectQuery = selectQuery.where(
        and(
          eq(users.tenantId, tenantId),
          or(
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.phoneNumber, `%${search}%`),
            like(users.companyName, `%${search}%`)
          )
        )
      );
      countQuery = countQuery.where(
        and(
          eq(users.tenantId, tenantId),
          or(
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.phoneNumber, `%${search}%`),
            like(users.companyName, `%${search}%`)
          )
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
      .orderBy(orderFn(users[sortField]));

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
    const { firstName, lastName, email, phoneNumber, companyName, role = 'user' } = req.body;

    console.log(`👤 Admin Invite: Creating user ${firstName} ${lastName} (${email}) for tenant ${tenantId}`);

    // Check subscription limits before proceeding
    const currentUserCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    const tenantSubscription = await db
      .select({
        planName: subscriptionPlans.name,
        maxUsers: subscriptionPlans.maxUsers
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (tenantSubscription.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found. Please contact support to activate your subscription.'
      });
    }

    const currentUsers = parseInt(currentUserCount[0].count);
    const maxUsers = tenantSubscription[0].maxUsers;

    console.log(`📊 Subscription check: ${currentUsers}/${maxUsers} users for tenant ${tenantId}`);

    if (currentUsers >= maxUsers) {
      return res.status(400).json({
        success: false,
        message: `User limit reached. Your ${tenantSubscription[0].planName} plan allows up to ${maxUsers} users. Please upgrade your subscription to add more users.`,
        data: {
          currentUsers,
          maxUsers,
          planName: tenantSubscription[0].planName
        }
      });
    }

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
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      username: email.split('@')[0], // Generate username from email
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
          <p>Hello ${firstName} ${lastName},</p>
          <p>Your account has been created. Here are your login credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
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
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        email: newUser[0].email,
        phoneNumber: newUser[0].phoneNumber,
        companyName: newUser[0].companyName,
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

    // Get all users for export (no pagination) - matching required columns
    let exportQuery = db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        companyName: users.companyName,
        registrationDate: users.createdAt,
        accountStatus: users.isActive
      })
      .from(users);

    // Apply filters
    if (search) {
      exportQuery = exportQuery.where(
        and(
          eq(users.tenantId, tenantId),
          or(
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.phoneNumber, `%${search}%`),
            like(users.companyName, `%${search}%`)
          )
        )
      );
    } else {
      exportQuery = exportQuery.where(eq(users.tenantId, tenantId));
    }

    const userData = await exportQuery.orderBy(desc(users.createdAt));

    // Format data for export
    const exportData = userData.map(user => ({
      'User ID': user.userId,
      'Full Name': `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
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

    if (format === 'excel') {
      // Generate Excel file
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      
      // Generate buffer
      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      return res.send(excelBuffer);
    }

    if (format === 'pdf') {
      // Generate PDF
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Users Export Report', 20, 20);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Total Users: ${exportData.length}`, 20, 37);
      
      // Create table headers and data
      const tableHeaders = Object.keys(exportData[0] || {});
      const tableData = exportData.map(row => Object.values(row));
      
      // Add table
      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }, // Blue header
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      return res.send(doc.output());
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(exportData);
    }

    // Fallback for unsupported formats
    res.status(400).json({
      success: false,
      message: `Unsupported export format: ${format}. Supported formats: csv, excel, pdf, json`
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
      .where(and(eq(users.tenantId, tenantId), eq(users.isActive, true)));

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

// Get tenant subscription limits and current usage
export const getTenantSubscriptionLimits = async (req, res) => {
  try {
    const { tenantId } = req.user;

    console.log(`📊 Fetching subscription limits for tenant ${tenantId}`);

    // Get current user count
    const currentUserCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    // Get tenant's active subscription with plan details
    const tenantSubscription = await db
      .select({
        planName: subscriptionPlans.name,
        maxUsers: subscriptionPlans.maxUsers,
        storageLimit: subscriptionPlans.storageLimit,
        features: subscriptionPlans.features,
        subscriptionStatus: subscriptions.status,
        planId: subscriptions.planId
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (tenantSubscription.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found for this tenant'
      });
    }

    const subscription = tenantSubscription[0];
    const currentUsers = parseInt(currentUserCount[0].count);
    const maxUsers = subscription.maxUsers;
    const remainingUsers = maxUsers - currentUsers;

    console.log(`✅ Subscription limits fetched for tenant ${tenantId}: ${currentUsers}/${maxUsers} users`);

    res.json({
      success: true,
      data: {
        currentUserCount: currentUsers,
        maxUsers: maxUsers,
        remainingUsers: remainingUsers,
        planName: subscription.planName,
        storageLimit: subscription.storageLimit,
        features: subscription.features,
        canInviteMore: remainingUsers > 0
      }
    });

  } catch (error) {
    console.error('Get subscription limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription limits'
    });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { tenantId } = req.user;
    const { firstName, lastName, phoneNumber, companyName, isActive } = req.body;

    console.log(`🔄 Admin Update: Updating user ${id} for tenant ${tenantId}`);

    // Check if user exists and belongs to the same tenant
    const existingUser = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or access denied'
      });
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set({
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        phoneNumber: phoneNumber?.trim() || null,
        companyName: companyName?.trim() || null,
        isActive: isActive,
        updatedAt: new Date()
      })
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        companyName: users.companyName,
        isActive: users.isActive,
        role: users.role,
        updatedAt: users.updatedAt
      });

    if (updatedUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update user'
      });
    }

    console.log(`✅ Admin Update: User ${id} updated successfully`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    console.log(`🗑️ Admin Delete: Deleting user ${id} for tenant ${tenantId}`);

    // Check if user exists and belongs to the same tenant
    const existingUser = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or access denied'
      });
    }

    const userToDelete = existingUser[0];

    // Prevent deletion of tenant admin users for security
    if (userToDelete.role === 'tenant-admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete tenant admin users'
      });
    }

    // Delete user
    const deletedUser = await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      });

    if (deletedUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Failed to delete user'
      });
    }

    console.log(`✅ Admin Delete: User ${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email}) deleted successfully`);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser[0]
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};