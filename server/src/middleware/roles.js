// Role-based access control middleware

export const adminRoleMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Allow both tenant-admin and super-admin roles
  if (req.user.role !== 'tenant-admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

export const superAdminRoleMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  next();
};

export const userRoleMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Allow tenant-user, tenant-admin, and super-admin roles
  const allowedRoles = ['tenant-user', 'tenant-admin', 'super-admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'User access required'
    });
  }

  next();
};