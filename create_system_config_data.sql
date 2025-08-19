-- Create system configuration sample data
INSERT INTO system_config (key, value, description, category, is_active) VALUES
-- Security Settings
('two_factor_auth', '{"email_enabled": true, "sms_enabled": false}', 'Two-factor authentication settings', 'security', true),
('session_timeout', '{"minutes": 30}', 'User session timeout duration', 'security', true),
('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": true}', 'Password complexity requirements', 'security', true),

-- File & Storage Settings  
('max_file_size', '{"mb": 10}', 'Maximum file upload size in MB', 'storage', true),
('max_users_per_tenant', '{"count": 50}', 'Maximum users allowed per tenant', 'storage', true),
('max_documents_per_tenant', '{"count": 1000}', 'Maximum documents per tenant', 'storage', true),
('allowed_file_types', '["pdf", "docx", "xlsx", "png", "jpg", "zip"]', 'Allowed file types for upload', 'storage', true),

-- Email & Communication Settings
('email_retry_limits', '{"count": 3}', 'Number of email retry attempts', 'communication', true),
('smtp_settings', '{"host": "smtp.example.com", "port": 587, "secure": false}', 'SMTP server configuration', 'communication', true),
('notification_settings', '{"email_notifications": true, "sms_notifications": false, "push_notifications": true}', 'System notification preferences', 'communication', true),

-- Backup & Maintenance Settings
('backup_frequency', '{"frequency": "daily", "time": "02:00"}', 'Automated backup schedule', 'maintenance', true),
('auto_delete_interval', '{"days": 60}', 'Auto-delete interval for soft deleted items', 'maintenance', true),
('system_maintenance_window', '{"start": "02:00", "end": "04:00", "timezone": "UTC"}', 'Scheduled maintenance window', 'maintenance', true),

-- Feature Toggles
('trial_extensions', '{"enabled": true, "max_extensions": 2}', 'Allow trial period extensions', 'features', true),
('auto_invoicing', '{"enabled": true}', 'Automatic invoice generation', 'features', true),
('document_versioning', '{"enabled": false}', 'Document version control', 'features', false),
('advanced_analytics', '{"enabled": false}', 'Advanced analytics and reporting', 'features', false),
('api_access', '{"enabled": true, "rate_limit": 1000}', 'External API access', 'features', true),

-- Performance Settings
('cache_settings', '{"ttl": 3600, "max_size": "100MB"}', 'System cache configuration', 'performance', true),
('database_pool', '{"min_connections": 5, "max_connections": 20}', 'Database connection pool settings', 'performance', true),

-- Audit Settings  
('audit_log_retention', '{"days": 365}', 'Audit log retention period', 'audit', true),
('compliance_mode', '{"enabled": false, "standard": "SOC2"}', 'Compliance mode settings', 'audit', true)

ON CONFLICT (key) DO UPDATE SET
value = EXCLUDED.value,
description = EXCLUDED.description,
category = EXCLUDED.category,
is_active = EXCLUDED.is_active,
updated_at = NOW();