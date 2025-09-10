/**
 * Row Level Security Middleware for InsurCheck
 * Sets tenant context for database queries
 */

export const setTenantContext = async (req, res, next) => {
  try {
    const { tenantId, role } = req.user || {};
    
    if (!tenantId && role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Tenant context required'
      });
    }

    // Set tenant context for RLS
    if (tenantId) {
      await db.execute(
        sql`SET LOCAL app.current_tenant_id = ${tenantId}`
      );
    }

    // Set role context
    if (role === 'super-admin') {
      await db.execute(sql`SET LOCAL ROLE super_admin_role`);
    } else if (role === 'tenant-admin') {
      await db.execute(sql`SET LOCAL ROLE tenant_admin_role`);
    } else {
      await db.execute(sql`SET LOCAL ROLE authenticated_role`);
    }

    next();
  } catch (error) {
    console.error('RLS Context Error:', error);
    res.status(500).json({
      success: false,
      message: 'Database security error'
    });
  }
};

/**
 * Super Admin Context - Bypass RLS for platform administration
 */
export const setSuperAdminContext = async (req, res, next) => {
  try {
    await db.execute(sql`SET LOCAL ROLE super_admin_role`);
    next();
  } catch (error) {
    console.error('Super Admin Context Error:', error);
    res.status(500).json({
      success: false,
      message: 'Database admin error'
    });
  }
};