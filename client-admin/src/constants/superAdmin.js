
export const SUPER_ADMIN_MESSAGES = {
  LOGIN: {
    TITLE: 'Super Admin Login',
    EMAIL_LABEL: 'Email Address',
    PASSWORD_LABEL: 'Password',
    LOGIN_BUTTON: 'Sign In',
    FORGOT_PASSWORD: 'Forgot Password?',
    INVALID_EMAIL: 'Invalid email format or insufficient privileges.',
    ACCOUNT_LOCKED: 'Account locked. Try again in 15 minutes.',
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_ERROR: 'Login failed. Please try again.'
  },
  DASHBOARD: {
    TITLE: 'System Monitoring Dashboard',
    METRICS: {
      UPTIME: 'Uptime',
      ACTIVE_TENANTS: 'Active Tenants',
      ACTIVE_USERS: 'Active Users',
      DOCUMENT_UPLOADS: 'Document Uploads',
      COMPLIANCE_CHECKS: 'Compliance Checks',
      ERROR_RATE: 'Error Rate',
      AVG_PROCESSING_TIME: 'Avg Processing Time'
    },
    ERROR_LOGS: {
      TITLE: 'Error Logs',
      NO_LOGS: 'No error logs found.',
      EXPORT_CSV: 'Export CSV',
      FILTER_TENANT: 'Filter by Tenant',
      FILTER_ERROR_TYPE: 'Filter by Error Type',
      COLUMNS: {
        ERROR_ID: 'Error ID',
        TIMESTAMP: 'Timestamp',
        ERROR_TYPE: 'Error Type',
        DESCRIPTION: 'Description',
        AFFECTED_TENANT: 'Affected Tenant',
        AFFECTED_USER: 'Affected User',
        AFFECTED_DOCUMENT: 'Affected Document'
      }
    }
  }
};
