
class SuperAdminTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: [],
      startTime: new Date(),
      endTime: null
    };
    this.baseURL = 'http://localhost:5000/api';
  }

  async runTest(testName, testFunction) {
    console.log(`🧪 Running test: ${testName}`);
    try {
      await testFunction();
      this.testResults.passed++;
      this.testResults.tests.push({ name: testName, status: 'PASSED', duration: Date.now() });
      console.log(`✅ ${testName} - PASSED`);
      return true;
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({ name: testName, status: 'FAILED', error: error.message, duration: Date.now() });
      console.error(`❌ ${testName} - FAILED:`, error.message);
      return false;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async testAuthentication() {
    await this.runTest('Super Admin Login - Valid Credentials', async () => {
      const response = await this.makeRequest('/auth/super-admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@insurcheck.com',
          password: 'admin123'
        })
      });
      
      if (!response.token || !response.user) {
        throw new Error('Invalid login response structure');
      }
      
      if (response.user.role !== 'super-admin') {
        throw new Error('User role is not super-admin');
      }
      
      // Store token for subsequent tests
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('🔐 Authentication token stored for subsequent tests');
    });

    await this.runTest('Super Admin Login - Invalid Credentials', async () => {
      try {
        await this.makeRequest('/auth/super-admin/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'admin@insurcheck.com',
            password: 'wrongpassword'
          })
        });
        throw new Error('Login should have failed with wrong password');
      } catch (error) {
        if (error.message.includes('HTTP 401')) {
          return; // Expected failure
        }
        throw error;
      }
    });

    await this.runTest('Tenant Admin Login', async () => {
      const response = await this.makeRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@securelife.com',
          password: 'admin123'
        })
      });
      
      if (!response.token || !response.user) {
        throw new Error('Invalid tenant admin login response');
      }
      
      if (response.user.role !== 'tenant-admin') {
        throw new Error('User role is not tenant-admin');
      }
    });
  }

  async testSystemMetrics() {
    await this.runTest('Fetch System Metrics', async () => {
      const metrics = await this.makeRequest('/system-metrics');
      
      if (!Array.isArray(metrics)) {
        throw new Error('System metrics should return an array');
      }
      
      if (metrics.length === 0) {
        throw new Error('No system metrics returned');
      }

      // Validate metric structure
      const requiredFields = ['id', 'icon', 'value', 'label', 'trend', 'color'];
      for (const metric of metrics) {
        for (const field of requiredFields) {
          if (!(field in metric)) {
            throw new Error(`Missing field '${field}' in metric: ${JSON.stringify(metric)}`);
          }
        }
      }
      
      console.log(`📊 Retrieved ${metrics.length} system metrics`);
    });
  }

  async testTenantManagement() {
    // Test Get Tenants API
    await this.runTest('Get Tenants with Pagination', async () => {
      const response = await this.makeRequest('/tenants?page=1&limit=10');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid tenants response structure');
      }
      console.log('🏢 Tenants retrieved successfully:', response.data.length);
    });

    // Test Create Tenant API
    await this.runTest('Create New Tenant', async () => {
      const newTenant = {
        name: 'Test Insurance Corp',
        domain: 'testinsurance.com',
        adminEmail: 'admin@testinsurance.com',
        adminPassword: 'admin123'
      };
      
      const response = await this.makeRequest('/tenants', {
        method: 'POST',
        body: JSON.stringify(newTenant)
      });
      
      if (!response.data || !response.data.id) {
        throw new Error('Failed to create tenant');
      }
      console.log('🏢 Tenant created successfully:', response.data.name);
    });

    // Test Get Tenant Users
    await this.runTest('Get Tenant Users', async () => {
      const response = await this.makeRequest('/tenants/1/users');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid tenant users response');
      }
      console.log('👥 Tenant users retrieved successfully');
    });
    let createdTenantId = null;

    await this.runTest('Get Tenants List', async () => {
      const response = await this.makeRequest('/tenants?page=1&limit=10');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid tenants response structure');
      }
      
      if (!response.pagination) {
        throw new Error('Missing pagination information');
      }
      
      console.log(`🏢 Retrieved ${response.data.length} tenants`);
    });

    await this.runTest('Create New Tenant', async () => {
      const newTenant = {
        name: 'Test Insurance Co',
        domain: 'testinsurance.com',
        maxUsers: 10,
        storageLimit: 5
      };
      
      const response = await this.makeRequest('/tenants', {
        method: 'POST',
        body: JSON.stringify(newTenant)
      });
      
      if (!response.id) {
        throw new Error('Created tenant should have an ID');
      }
      
      if (response.name !== newTenant.name) {
        throw new Error('Tenant name mismatch');
      }
      
      createdTenantId = response.id;
      console.log(`🆕 Created tenant with ID: ${createdTenantId}`);
    });

    if (createdTenantId) {
      await this.runTest('Update Tenant', async () => {
        const updateData = {
          name: 'Updated Test Insurance Co',
          status: 'active',
          maxUsers: 15
        };
        
        const response = await this.makeRequest(`/tenants/${createdTenantId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
        
        if (response.name !== updateData.name) {
          throw new Error('Tenant name was not updated');
        }
        
        console.log(`📝 Updated tenant: ${response.name}`);
      });

      await this.runTest('Get Tenant Users', async () => {
        const users = await this.makeRequest(`/tenants/${createdTenantId}/users`);
        
        if (!Array.isArray(users)) {
          throw new Error('Tenant users should return an array');
        }
        
        console.log(`👥 Retrieved ${users.length} users for tenant`);
      });
    }
  }

  async testUserManagement() {
    let createdUserId = null;

    await this.runTest('Get Users List', async () => {
      const response = await this.makeRequest('/users?page=1&limit=10');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid users response structure');
      }
      
      console.log(`👤 Retrieved ${response.data.length} users`);
    });

    await this.runTest('Create New User', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'user',
        tenantId: 1
      };
      
      const response = await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      
      if (!response.id) {
        throw new Error('Created user should have an ID');
      }
      
      if (response.email !== newUser.email) {
        throw new Error('User email mismatch');
      }
      
      createdUserId = response.id;
      console.log(`👤 Created user with ID: ${createdUserId}`);
    });
  }

  async testSubscriptionManagement() {
    await this.runTest('Get Subscription Plans', async () => {
      const plans = await this.makeRequest('/subscription-plans');
      
      if (!Array.isArray(plans)) {
        throw new Error('Subscription plans should return an array');
      }
      
      console.log(`📋 Retrieved ${plans.length} subscription plans`);
    });

    await this.runTest('Get Subscriptions', async () => {
      const response = await this.makeRequest('/subscriptions?page=1&limit=10');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid subscriptions response structure');
      }
      
      console.log(`💳 Retrieved ${response.data.length} subscriptions`);
    });

    await this.runTest('Create Subscription Plan', async () => {
      const newPlan = {
        name: 'Test Plan',
        description: 'A test subscription plan',
        price: '19.99',
        billingCycle: 'monthly',
        features: ['Feature 1', 'Feature 2'],
        maxUsers: 5,
        storageLimit: 2
      };
      
      const response = await this.makeRequest('/subscription-plans', {
        method: 'POST',
        body: JSON.stringify(newPlan)
      });
      
      if (response.name !== newPlan.name) {
        throw new Error('Plan name mismatch');
      }
      
      console.log(`📋 Created subscription plan: ${response.name}`);
    });
  }

  async testPaymentManagement() {
    await this.runTest('Get Payments', async () => {
      const response = await this.makeRequest('/payments?page=1&limit=10');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid payments response structure');
      }
      
      console.log(`💰 Retrieved ${response.data.length} payments`);
    });
  }

  async testInvoiceManagement() {
    await this.runTest('Get Invoices', async () => {
      const response = await this.makeRequest('/invoices?page=1&limit=10');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid invoices response structure');
      }
      
      console.log(`🧾 Retrieved ${response.data.length} invoices`);
    });

    await this.runTest('Generate Invoice', async () => {
      const invoiceData = {
        tenantId: 1,
        subscriptionId: 1,
        amount: '99.99',
        taxAmount: '9.99',
        billingPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        billingPeriodEnd: new Date().toISOString(),
        items: [{ description: 'Test Service', amount: '99.99' }]
      };
      
      const response = await this.makeRequest('/invoices/generate', {
        method: 'POST',
        body: JSON.stringify(invoiceData)
      });
      
      if (!response.invoiceNumber) {
        throw new Error('Generated invoice should have an invoice number');
      }
      
      console.log(`🧾 Generated invoice: ${response.invoiceNumber}`);
    });
  }

  async testActivityLogs() {
    await this.runTest('Get Activity Logs', async () => {
      const response = await this.makeRequest('/activity-logs?page=1&limit=10');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid activity logs response structure');
      }
      
      console.log(`📊 Retrieved ${response.data.length} activity logs`);
    });

    await this.runTest('Export Activity Logs', async () => {
      const exportData = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      };
      
      const response = await fetch(`${this.baseURL}/activity-logs/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportData)
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/csv')) {
        throw new Error('Export should return CSV format');
      }
      
      console.log('📤 Activity logs export successful');
    });
  }

  async testDeletedDocuments() {
    await this.runTest('Get Deleted Documents', async () => {
      const response = await this.makeRequest('/deleted-documents?page=1&limit=10');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid deleted documents response structure');
      }
      
      console.log(`🗑️ Retrieved ${response.data.length} deleted documents`);
    });
  }

  async testSystemConfiguration() {
    await this.runTest('Get System Configuration', async () => {
      const configs = await this.makeRequest('/system-config');
      
      if (!Array.isArray(configs)) {
        throw new Error('System config should return an array');
      }
      
      console.log(`⚙️ Retrieved ${configs.length} system configurations`);
    });

    await this.runTest('Update System Configuration', async () => {
      const updateData = {
        value: { minutes: 500 },
        description: 'Updated session timeout for testing'
      };
      
      const response = await this.makeRequest('/system-config/session_timeout', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      if (!response.value) {
        throw new Error('Updated config should have a value');
      }
      
      console.log('⚙️ System configuration updated successfully');
    });
  }

  async testAnalytics() {
    await this.runTest('Get Analytics Data', async () => {
      const analytics = await this.makeRequest('/analytics?startDate=2024-01-01&endDate=2024-12-31');
      
      if (!analytics || typeof analytics !== 'object') {
        throw new Error('Analytics should return an object');
      }
      
      console.log('📈 Analytics data retrieved successfully');
    });
  }

  async runAllTests() {
    console.log('\n🚀 Starting Super Admin Panel Comprehensive Test Suite');
    console.log('='.repeat(60));
    
    try {
      // Test Authentication
      console.log('\n🔐 Testing Authentication...');
      await this.testAuthentication();
      
      // Test System Metrics
      console.log('\n📊 Testing System Metrics...');
      await this.testSystemMetrics();
      
      // Test Tenant Management
      console.log('\n🏢 Testing Tenant Management...');
      await this.testTenantManagement();
      
      // Test User Management
      console.log('\n👥 Testing User Management...');
      await this.testUserManagement();
      
      // Test Subscription Management
      console.log('\n💳 Testing Subscription Management...');
      await this.testSubscriptionManagement();
      
      // Test Payment Management
      console.log('\n💰 Testing Payment Management...');
      await this.testPaymentManagement();
      
      // Test Invoice Management
      console.log('\n🧾 Testing Invoice Management...');
      await this.testInvoiceManagement();
      
      // Test Activity Logs
      console.log('\n📊 Testing Activity Logs...');
      await this.testActivityLogs();
      
      // Test Deleted Documents
      console.log('\n🗑️ Testing Deleted Documents...');
      await this.testDeletedDocuments();
      
      // Test System Configuration
      console.log('\n⚙️ Testing System Configuration...');
      await this.testSystemConfiguration();
      
      // Test Analytics
      console.log('\n📈 Testing Analytics...');
      await this.testAnalytics();
      
    } catch (error) {
      console.error('🔥 Critical test failure:', error);
    }
    
    this.testResults.endTime = new Date();
    this.generateTestReport();
    
    return this.testResults;
  }

  generateTestReport() {
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? ((this.testResults.passed / totalTests) * 100).toFixed(2) : 0;
    const duration = this.testResults.endTime - this.testResults.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST REPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Total: ${totalTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      const failedTests = this.testResults.tests.filter(test => test.status === 'FAILED');
      failedTests.forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
    }
    
    console.log('\n🎯 TEST COVERAGE:');
    const categories = [
      'Authentication', 'System Metrics', 'Tenant Management', 
      'User Management', 'Subscription Management', 'Payment Management',
      'Invoice Management', 'Activity Logs', 'Deleted Documents', 
      'System Configuration', 'Analytics'
    ];
    console.log(`   ✅ Covered ${categories.length} major feature categories`);
    
    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT! Super Admin Panel is production-ready!');
    } else if (successRate >= 75) {
      console.log('\n⚠️  GOOD! Minor issues need attention before production.');
    } else {
      console.log('\n🔴 CRITICAL! Major issues must be fixed before production.');
    }
    
    console.log('='.repeat(60));
  }

  // Utility method to run individual test categories
  async runCategoryTest(category) {
    const categoryMethods = {
      'auth': this.testAuthentication,
      'metrics': this.testSystemMetrics,
      'tenants': this.testTenantManagement,
      'users': this.testUserManagement,
      'subscriptions': this.testSubscriptionManagement,
      'payments': this.testPaymentManagement,
      'invoices': this.testInvoiceManagement,
      'logs': this.testActivityLogs,
      'documents': this.testDeletedDocuments,
      'config': this.testSystemConfiguration,
      'analytics': this.testAnalytics
    };
    
    if (categoryMethods[category]) {
      console.log(`🧪 Running ${category} tests...`);
      await categoryMethods[category].call(this);
      this.generateTestReport();
    } else {
      console.error(`❌ Unknown test category: ${category}`);
      console.log('Available categories:', Object.keys(categoryMethods).join(', '));
    }
  }
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  window.SuperAdminTester = SuperAdminTester;
}

export default SuperAdminTester;
