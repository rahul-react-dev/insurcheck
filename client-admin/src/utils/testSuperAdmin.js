
import { 
  authAPI, 
  tenantAPI, 
  subscriptionAPI, 
  paymentAPI, 
  invoiceAPI, 
  activityLogAPI, 
  deletedDocumentAPI, 
  systemConfigAPI, 
  analyticsAPI 
} from './api';

class SuperAdminTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    console.log(`🧪 Running test: ${testName}`);
    try {
      await testFunction();
      this.testResults.passed++;
      this.testResults.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
      console.error(`❌ ${testName} - FAILED:`, error.message);
    }
  }

  async testAuthentication() {
    await this.runTest('Super Admin Login', async () => {
      const response = await authAPI.superAdminLogin({
        email: 'admin@insurcheck.com',
        password: 'admin123'
      });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid login response');
      }
      
      // Store token for subsequent tests
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    });

    await this.runTest('Invalid Login Credentials', async () => {
      try {
        await authAPI.superAdminLogin({
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });
        throw new Error('Should have failed with invalid credentials');
      } catch (error) {
        if (error.response?.status !== 401) {
          throw new Error('Should return 401 for invalid credentials');
        }
      }
    });
  }

  async testTenantManagement() {
    await this.runTest('Get All Tenants', async () => {
      const response = await tenantAPI.getAll({ page: 1, limit: 10 });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid tenant list response');
      }
      
      if (!response.data.pagination) {
        throw new Error('Missing pagination data');
      }
    });

    await this.runTest('Get Tenants with Filters', async () => {
      const response = await tenantAPI.getAll({ 
        page: 1, 
        limit: 5,
        search: 'Acme',
        status: 'active'
      });
      
      if (!response.data.data) {
        throw new Error('Filtered results not returned');
      }
    });

    await this.runTest('Create New Tenant', async () => {
      const newTenant = {
        name: 'Test Tenant Corp',
        domain: 'test.insurcheck.com',
        maxUsers: 20,
        storageLimit: 100
      };
      
      const response = await tenantAPI.create(newTenant);
      
      if (!response.data.id || response.data.name !== newTenant.name) {
        throw new Error('Tenant creation failed');
      }
      
      // Store for cleanup
      this.createdTenantId = response.data.id;
    });

    await this.runTest('Update Tenant', async () => {
      if (!this.createdTenantId) {
        throw new Error('No tenant to update');
      }
      
      const updateData = {
        name: 'Updated Test Tenant Corp',
        status: 'active',
        maxUsers: 25
      };
      
      const response = await tenantAPI.update(this.createdTenantId, updateData);
      
      if (response.data.name !== updateData.name) {
        throw new Error('Tenant update failed');
      }
    });

    await this.runTest('Get Tenant Users', async () => {
      const response = await tenantAPI.getUsers(1); // Use first tenant
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid tenant users response');
      }
    });
  }

  async testSubscriptionManagement() {
    await this.runTest('Get Subscription Plans', async () => {
      const response = await subscriptionAPI.getPlans();
      
      if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('No subscription plans found');
      }
    });

    await this.runTest('Get Subscriptions', async () => {
      const response = await subscriptionAPI.getSubscriptions({ page: 1, limit: 10 });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid subscriptions response');
      }
    });

    await this.runTest('Create Subscription Plan', async () => {
      const newPlan = {
        name: 'Test Plan',
        description: 'Test subscription plan',
        price: '49.99',
        billingCycle: 'monthly',
        features: { test: true },
        maxUsers: 10,
        storageLimit: 50
      };
      
      const response = await subscriptionAPI.createPlan(newPlan);
      
      if (!response.data.id || response.data.name !== newPlan.name) {
        throw new Error('Subscription plan creation failed');
      }
    });
  }

  async testPaymentManagement() {
    await this.runTest('Get Payments', async () => {
      const response = await paymentAPI.getAll({ page: 1, limit: 10 });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid payments response');
      }
    });

    await this.runTest('Get Payments with Filters', async () => {
      const response = await paymentAPI.getAll({
        page: 1,
        limit: 5,
        status: 'completed'
      });
      
      if (!response.data.data) {
        throw new Error('Filtered payments not returned');
      }
    });
  }

  async testInvoiceManagement() {
    await this.runTest('Get Invoices', async () => {
      const response = await invoiceAPI.getAll({ page: 1, limit: 10 });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid invoices response');
      }
    });

    await this.runTest('Generate Invoice', async () => {
      const invoiceData = {
        tenantId: 1,
        subscriptionId: 1,
        amount: '99.99',
        taxAmount: '9.99',
        billingPeriodStart: new Date().toISOString(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: {
          planName: 'Test Plan',
          description: 'Monthly subscription',
          quantity: 1,
          unitPrice: 99.99,
          total: 99.99
        }
      };
      
      const response = await invoiceAPI.generate(invoiceData);
      
      if (!response.data.id || !response.data.invoiceNumber) {
        throw new Error('Invoice generation failed');
      }
    });
  }

  async testActivityLogs() {
    await this.runTest('Get Activity Logs', async () => {
      const response = await activityLogAPI.getAll({ page: 1, limit: 10 });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid activity logs response');
      }
    });

    await this.runTest('Get Activity Logs with Filters', async () => {
      const response = await activityLogAPI.getAll({
        page: 1,
        limit: 5,
        action: 'login',
        level: 'info'
      });
      
      if (!response.data.data) {
        throw new Error('Filtered activity logs not returned');
      }
    });
  }

  async testDeletedDocuments() {
    await this.runTest('Get Deleted Documents', async () => {
      const response = await deletedDocumentAPI.getAll({ page: 1, limit: 10 });
      
      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid deleted documents response');
      }
    });
  }

  async testSystemConfiguration() {
    await this.runTest('Get System Configuration', async () => {
      const response = await systemConfigAPI.getAll();
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid system config response');
      }
    });

    await this.runTest('Update System Configuration', async () => {
      const configData = {
        value: { days: 120 },
        description: 'Updated auto delete interval'
      };
      
      const response = await systemConfigAPI.update('auto_delete_interval', configData);
      
      if (!response.data.key) {
        throw new Error('System config update failed');
      }
    });
  }

  async testAnalytics() {
    await this.runTest('Get System Metrics', async () => {
      const response = await analyticsAPI.getSystemMetrics();
      
      if (!response.data.tenants || !response.data.users || !response.data.system) {
        throw new Error('Invalid system metrics response');
      }
    });

    await this.runTest('Get Analytics Data', async () => {
      const response = await analyticsAPI.getAnalytics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      
      if (!response.data) {
        throw new Error('Invalid analytics response');
      }
    });
  }

  async cleanup() {
    // Clean up created test data
    if (this.createdTenantId) {
      try {
        await tenantAPI.delete(this.createdTenantId);
        console.log('✅ Cleaned up test tenant');
      } catch (error) {
        console.warn('⚠️ Failed to cleanup test tenant:', error.message);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Super Admin Panel Tests...\n');
    
    try {
      await this.testAuthentication();
      await this.testTenantManagement();
      await this.testSubscriptionManagement();
      await this.testPaymentManagement();
      await this.testInvoiceManagement();
      await this.testActivityLogs();
      await this.testDeletedDocuments();
      await this.testSystemConfiguration();
      await this.testAnalytics();
      
      await this.cleanup();
      
    } catch (error) {
      console.error('🚨 Test suite execution failed:', error);
    }

    // Print summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }
    
    return this.testResults;
  }
}

// Export for use in browser console
window.SuperAdminTester = SuperAdminTester;

export default SuperAdminTester;
