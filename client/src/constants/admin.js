
export const ADMIN_MESSAGES = {
  LOGIN: {
    TITLE: 'Admin Panel Login',
    SUBTITLE: 'Access your admin dashboard',
    LOGIN_BUTTON: 'Sign In to Admin Panel',
    FORGOT_PASSWORD: 'Forgot Password?',
    EMAIL_PLACEHOLDER: 'Enter your email address',
    PASSWORD_PLACEHOLDER: 'Enter your password',
  },
  ERRORS: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    INSUFFICIENT_PRIVILEGES: 'Invalid email format or insufficient privileges',
    ACCOUNT_LOCKED: 'Account locked. Try again in 15 minutes.',
    GENERIC_ERROR: 'Login failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
  SUCCESS: {
    LOGIN_SUCCESS: 'Login successful',
    PASSWORD_RESET_SENT: 'Password reset email sent successfully',
  },
};

export const ADMIN_ROLES = {
  TENANT_ADMIN: 'tenant-admin',
  ADMIN: 'admin',
};

export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  DOCUMENTS: '/admin/documents',
  USERS: '/admin/users',
  SETTINGS: '/admin/settings',
  REPORTS: '/admin/reports',
  ACTIVITY_LOGS: '/admin/activity-logs',
};

export const LOCKOUT_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
};
