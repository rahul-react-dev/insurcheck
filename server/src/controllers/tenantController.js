
import { validationResult } from 'express-validator';
import { db } from '../../db.ts';
import { tenants, users } from '../schema.ts';
import { eq, ilike, and, desc, count, sql } from 'drizzle-orm';

export const getTenants = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(ilike(tenants.name, `%${search}%`));
    }
    
    if (status) {
      whereConditions.push(eq(tenants.status, status));
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(tenants)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Get tenants with user count
    const tenantList = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        domain: tenants.domain,
        status: tenants.status,
        subscriptionPlan: tenants.subscriptionPlan,
        trialEndsAt: tenants.trialEndsAt,
        createdAt: tenants.createdAt,
        userCount: count(users.id)
      })
      .from(tenants)
      .leftJoin(users, eq(tenants.id, users.tenantId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(tenants.id)
      .orderBy(sortOrder === 'desc' ? desc(tenants[sortBy]) : tenants[sortBy])
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: tenantList,
      meta: {
        total: totalResult[0].count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalResult[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tenants'
    });
  }
};

export const createTenant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, domain, subscriptionPlan, adminEmail, adminPassword } = req.body;

    // Create tenant
    const newTenant = await db.insert(tenants).values({
      name,
      domain,
      subscriptionPlan: subscriptionPlan || 'basic',
      status: 'active',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    }).returning();

    // Create admin user for tenant
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      username: adminEmail.split('@')[0],
      role: 'tenant-admin',
      tenantId: newTenant[0].id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: newTenant[0]
    });

  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating tenant'
    });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTenant = await db.update(tenants)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, id))
      .returning();

    if (updatedTenant.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: updatedTenant[0]
    });

  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating tenant'
    });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by updating status
    const updatedTenant = await db.update(tenants)
      .set({
        status: 'deleted',
        updatedAt: new Date()
      })
      .where(eq(tenants.id, id))
      .returning();

    if (updatedTenant.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });

  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting tenant'
    });
  }
};

export const getTenantUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;

    const tenantUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.tenantId, id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.tenantId, id));

    res.json({
      success: true,
      data: tenantUsers,
      meta: {
        total: totalResult[0].count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalResult[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Get tenant users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tenant users'
    });
  }
};
