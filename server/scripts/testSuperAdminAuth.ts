
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testSuperAdminAuth() {
  try {
    console.log('🧪 Testing Super Admin Authentication...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test 2: Super Admin Login
    console.log('\n2. Testing super admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/super-admin/login`, {
      email: 'admin@insurcheck.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.token && loginResponse.data.user) {
      console.log('✅ Super admin login successful');
      console.log('   Token received:', loginResponse.data.token.substring(0, 20) + '...');
      console.log('   User role:', loginResponse.data.user.role);
      
      // Test 3: Protected route with token
      console.log('\n3. Testing protected route with token...');
      const metricsResponse = await axios.get(`${API_BASE}/system-metrics`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ Protected route access successful');
      console.log('   Metrics received:', metricsResponse.data.success);
      
    } else {
      console.error('❌ Login response missing token or user data');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('\n💡 Route not found. Make sure server is running on port 5000');
    }
  }
}

testSuperAdminAuth();
