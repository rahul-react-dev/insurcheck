-- InsurCheck RLS Implementation
-- Run this to enable Row Level Security for multi-tenant isolation

-- Enable RLS on all tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
-- Users table policies
CREATE POLICY tenant_isolation_policy ON users
  FOR ALL
  TO authenticated_role
  USING (tenant_id = current_setting('app.current_tenant_id')::integer);

-- Documents table policies  
CREATE POLICY tenant_isolation_policy ON documents
  FOR ALL
  TO authenticated_role
  USING (tenant_id = current_setting('app.current_tenant_id')::integer);

-- Invoices table policies
CREATE POLICY tenant_isolation_policy ON invoices
  FOR ALL
  TO authenticated_role
  USING (tenant_id = current_setting('app.current_tenant_id')::integer);

-- Payments table policies
CREATE POLICY tenant_isolation_policy ON payments
  FOR ALL
  TO authenticated_role
  USING (tenant_id = current_setting('app.current_tenant_id')::integer);

-- Subscriptions table policies
CREATE POLICY tenant_isolation_policy ON subscriptions
  FOR ALL
  TO authenticated_role
  USING (tenant_id = current_setting('app.current_tenant_id')::integer);

-- Activity logs table policies
CREATE POLICY tenant_isolation_policy ON activity_logs
  FOR ALL
  TO authenticated_role
  USING (tenant_id = current_setting('app.current_tenant_id')::integer);

-- Super admin bypass policy (can access all data)
CREATE POLICY super_admin_access ON users
  FOR ALL
  TO super_admin_role
  USING (true);

CREATE POLICY super_admin_access ON documents
  FOR ALL
  TO super_admin_role
  USING (true);

-- Repeat for all tables...

-- Create database roles
CREATE ROLE authenticated_role;
CREATE ROLE super_admin_role;
CREATE ROLE tenant_admin_role;

-- Grant permissions
GRANT authenticated_role TO super_admin_role;
GRANT authenticated_role TO tenant_admin_role;