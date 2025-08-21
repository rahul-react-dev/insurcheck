// Middleware to check if user has admin role (tenant-admin or admin)
export const adminRoleMiddleware = (req, res, next) => {
  try {
    const { role } = req.user;

    if (!role || (role !== 'tenant-admin' && role !== 'admin' && role !== 'super-admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin role middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization.'
    });
  }
};