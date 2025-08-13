
import { call, put, takeEvery, takeLatest, all, fork } from 'redux-saga/effects';
import {
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  fetchSubscriptionPlansRequest,
  fetchSubscriptionPlansSuccess,
  fetchSubscriptionPlansFailure,
  createTenantRequest,
  createTenantSuccess,
  createTenantFailure,
  updateTenantRequest,
  updateTenantSuccess,
  updateTenantFailure,
  suspendTenantRequest,
  suspendTenantSuccess,
  suspendTenantFailure,
  deleteTenantRequest,
  deleteTenantSuccess,
  deleteTenantFailure,
  fetchTenantUsersRequest,
  fetchTenantUsersSuccess,
  fetchTenantUsersFailure
} from './tenantSlice';

// Mock API functions - replace with actual API calls
const api = {
  fetchTenants: async (params = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const { page = 1, limit = 10, ...filters } = params;
    console.log('🔍 Mock Tenant API called with params:', { page, limit, ...filters });

    // Mock tenant data
    const mockTenants = [
      {
        id: '1',
        tenantId: 'TNT-2024-001',
        tenantName: 'Acme Insurance Solutions',
        primaryContactEmail: 'admin@acme-insurance.com',
        description: 'Leading insurance solutions provider',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        createdDate: '2024-01-15T10:30:00Z',
        lastLogin: '2024-03-20T15:45:00Z',
        userCount: 25,
        documentsCount: 1250,
      },
      {
        id: '2',
        tenantId: 'TNT-2024-002',
        tenantName: 'SafeGuard Insurance Co.',
        primaryContactEmail: 'billing@safeguard.com',
        description: 'Small business insurance specialists',
        status: 'active',
        subscriptionPlan: 'Professional',
        createdDate: '2024-01-20T09:15:00Z',
        lastLogin: '2024-03-19T12:30:00Z',
        userCount: 12,
        documentsCount: 480,
      },
      {
        id: '3',
        tenantId: 'TNT-2024-003',
        tenantName: 'Quick Insurance Ltd.',
        primaryContactEmail: 'contact@quickinsurance.com',
        description: 'Fast-track insurance processing',
        status: 'suspended',
        subscriptionPlan: 'Basic',
        createdDate: '2024-02-01T14:20:00Z',
        lastLogin: '2024-03-10T08:15:00Z',
        userCount: 5,
        documentsCount: 120,
      },
      {
        id: '4',
        tenantId: 'TNT-2024-004',
        tenantName: 'Premium Insurance Group',
        primaryContactEmail: 'admin@premium-group.com',
        description: 'Premium insurance services',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        createdDate: '2024-02-05T11:45:00Z',
        lastLogin: '2024-03-21T16:20:00Z',
        userCount: 35,
        documentsCount: 1800,
      },
      {
        id: '5',
        tenantId: 'TNT-2024-005',
        tenantName: 'Reliable Insurance Corp.',
        primaryContactEmail: 'info@reliable.com',
        description: 'Trusted insurance partner since 1995',
        status: 'unverified',
        subscriptionPlan: 'Professional',
        createdDate: '2024-02-10T16:30:00Z',
        lastLogin: null,
        userCount: 1,
        documentsCount: 0,
      },
      {
        id: '6',
        tenantId: 'TNT-2024-006',
        tenantName: 'SecureLife Insurance',
        primaryContactEmail: 'contact@securelife.com',
        description: 'Life insurance specialists',
        status: 'locked',
        subscriptionPlan: 'Basic',
        createdDate: '2024-02-12T13:15:00Z',
        lastLogin: '2024-03-01T10:45:00Z',
        userCount: 8,
        documentsCount: 200,
      },
      {
        id: '7',
        tenantId: 'TNT-2024-007',
        tenantName: 'TrustGuard Insurance',
        primaryContactEmail: 'admin@trustguard.com',
        description: 'Comprehensive business insurance',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        createdDate: '2024-02-15T12:00:00Z',
        lastLogin: '2024-03-20T14:30:00Z',
        userCount: 28,
        documentsCount: 950,
      },
      {
        id: '8',
        tenantId: 'TNT-2024-008',
        tenantName: 'Shield Insurance Services',
        primaryContactEmail: 'support@shield.com',
        description: 'Protective insurance solutions',
        status: 'active',
        subscriptionPlan: 'Professional',
        createdDate: '2024-02-18T15:45:00Z',
        lastLogin: '2024-03-21T11:15:00Z',
        userCount: 15,
        documentsCount: 600,
      },
      {
        id: '9',
        tenantId: 'TNT-2024-009',
        tenantName: 'Fortress Insurance LLC',
        primaryContactEmail: 'admin@fortress.com',
        description: 'Strong protection, solid service',
        status: 'deactivated',
        subscriptionPlan: 'Basic',
        createdDate: '2024-02-20T10:30:00Z',
        lastLogin: '2024-03-05T09:20:00Z',
        userCount: 3,
        documentsCount: 45,
      },
      {
        id: '10',
        tenantId: 'TNT-2024-010',
        tenantName: 'Guardian Insurance Inc.',
        primaryContactEmail: 'info@guardian.com',
        description: 'Your trusted insurance guardian',
        status: 'active',
        subscriptionPlan: 'Professional',
        createdDate: '2024-02-22T14:15:00Z',
        lastLogin: '2024-03-20T13:45:00Z',
        userCount: 18,
        documentsCount: 720,
      },
      {
        id: '11',
        tenantId: 'TNT-2024-011',
        tenantName: 'Pinnacle Insurance Solutions',
        primaryContactEmail: 'contact@pinnacle.com',
        description: 'Peak performance insurance',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        createdDate: '2024-02-25T11:20:00Z',
        lastLogin: '2024-03-21T15:30:00Z',
        userCount: 42,
        documentsCount: 2100,
      },
      {
        id: '12',
        tenantId: 'TNT-2024-012',
        tenantName: 'Valor Insurance Group',
        primaryContactEmail: 'admin@valor.com',
        description: 'Courage in coverage',
        status: 'suspended',
        subscriptionPlan: 'Professional',
        createdDate: '2024-02-28T16:40:00Z',
        lastLogin: '2024-03-15T12:10:00Z',
        userCount: 14,
        documentsCount: 350,
      },
      {
        id: '13',
        tenantId: 'TNT-2024-013',
        tenantName: 'Summit Insurance Co.',
        primaryContactEmail: 'support@summit.com',
        description: 'Reaching new heights in insurance',
        status: 'active',
        subscriptionPlan: 'Basic',
        createdDate: '2024-03-01T09:25:00Z',
        lastLogin: '2024-03-21T10:50:00Z',
        userCount: 7,
        documentsCount: 180,
      },
      {
        id: '14',
        tenantId: 'TNT-2024-014',
        tenantName: 'Apex Insurance Partners',
        primaryContactEmail: 'info@apex.com',
        description: 'Top-tier insurance partnerships',
        status: 'unverified',
        subscriptionPlan: 'Professional',
        createdDate: '2024-03-03T13:50:00Z',
        lastLogin: null,
        userCount: 1,
        documentsCount: 0,
      },
      {
        id: '15',
        tenantId: 'TNT-2024-015',
        tenantName: 'Elite Insurance Services',
        primaryContactEmail: 'admin@elite.com',
        description: 'Elite level insurance solutions',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        createdDate: '2024-03-05T12:35:00Z',
        lastLogin: '2024-03-21T14:20:00Z',
        userCount: 31,
        documentsCount: 1540,
      },
      {
        id: '16',
        tenantId: 'TNT-2024-016',
        tenantName: 'Prime Insurance Ltd.',
        primaryContactEmail: 'contact@prime.com',
        description: 'Prime quality insurance services',
        status: 'active',
        subscriptionPlan: 'Professional',
        createdDate: '2024-03-07T15:10:00Z',
        lastLogin: '2024-03-20T16:45:00Z',
        userCount: 19,
        documentsCount: 890,
      },
      {
        id: '17',
        tenantId: 'TNT-2024-017',
        tenantName: 'Nova Insurance Corp.',
        primaryContactEmail: 'support@nova.com',
        description: 'New star in insurance',
        status: 'locked',
        subscriptionPlan: 'Basic',
        createdDate: '2024-03-08T10:55:00Z',
        lastLogin: '2024-03-12T09:30:00Z',
        userCount: 6,
        documentsCount: 95,
      },
      {
        id: '18',
        tenantId: 'TNT-2024-018',
        tenantName: 'Zenith Insurance Group',
        primaryContactEmail: 'admin@zenith.com',
        description: 'Highest point of insurance excellence',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        createdDate: '2024-03-10T14:20:00Z',
        lastLogin: '2024-03-21T13:15:00Z',
        userCount: 38,
        documentsCount: 1920,
      },
      {
        id: '19',
        tenantId: 'TNT-2024-019',
        tenantName: 'Stellar Insurance Inc.',
        primaryContactEmail: 'info@stellar.com',
        description: 'Outstanding insurance performance',
        status: 'active',
        subscriptionPlan: 'Professional',
        createdDate: '2024-03-12T11:40:00Z',
        lastLogin: '2024-03-21T12:25:00Z',
        userCount: 22,
        documentsCount: 770,
      },
      {
        id: '20',
        tenantId: 'TNT-2024-020',
        tenantName: 'Quantum Insurance Solutions',
        primaryContactEmail: 'contact@quantum.com',
        description: 'Next-generation insurance technology',
        status: 'unverified',
        subscriptionPlan: 'Enterprise',
        createdDate: '2024-03-15T16:30:00Z',
        lastLogin: null,
        userCount: 1,
        documentsCount: 0,
      }
    ];

    // Apply filters
    let filteredTenants = mockTenants;

    if (filters.tenantName) {
      filteredTenants = filteredTenants.filter(tenant =>
        tenant.tenantName.toLowerCase().includes(filters.tenantName.toLowerCase())
      );
    }

    if (filters.status) {
      filteredTenants = filteredTenants.filter(tenant => tenant.status === filters.status);
    }

    if (filters.subscriptionPlan) {
      filteredTenants = filteredTenants.filter(tenant => tenant.subscriptionPlan === filters.subscriptionPlan);
    }

    if (filters.dateRange?.start) {
      filteredTenants = filteredTenants.filter(tenant => 
        new Date(tenant.createdDate) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange?.end) {
      filteredTenants = filteredTenants.filter(tenant => 
        new Date(tenant.createdDate) <= new Date(filters.dateRange.end)
      );
    }

    // Calculate summary for all filtered tenants (before pagination)
    const statusCounts = filteredTenants.reduce((counts, tenant) => {
      counts[tenant.status] = (counts[tenant.status] || 0) + 1;
      return counts;
    }, {});

    const summary = {
      totalTenants: filteredTenants.length,
      statusCounts: {
        active: statusCounts.active || 0,
        suspended: statusCounts.suspended || 0,
        unverified: statusCounts.unverified || 0,
        locked: statusCounts.locked || 0,
        deactivated: statusCounts.deactivated || 0
      }
    };

    // Apply pagination (simulate backend pagination)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

    // Pagination info
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredTenants.length,
      totalPages: Math.ceil(filteredTenants.length / limit)
    };

    console.log('📊 Mock Tenant API returning:', {
      tenants: paginatedTenants.length,
      pagination,
      summary
    });

    return {
      tenants: paginatedTenants,
      summary,
      pagination
    };
  },

  fetchSubscriptionPlans: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        name: 'Basic',
        price: 29.99,
        billingCycle: 'month',
        features: {
          maxUsers: 5,
          maxDocuments: 100,
          storage: '1 GB'
        }
      },
      {
        id: '2',
        name: 'Professional',
        price: 99.99,
        billingCycle: 'month',
        features: {
          maxUsers: 25,
          maxDocuments: 1000,
          storage: '10 GB'
        }
      },
      {
        id: '3',
        name: 'Enterprise',
        price: 299.99,
        billingCycle: 'month',
        features: {
          maxUsers: 'Unlimited',
          maxDocuments: 'Unlimited',
          storage: '100 GB'
        }
      }
    ];
  },

  createTenant: async (tenantData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock creating a new tenant
    const newTenant = {
      id: Date.now().toString(),
      tenantId: `TNT-2024-${String(Date.now()).slice(-3)}`,
      tenantName: tenantData.tenantName,
      primaryContactEmail: tenantData.primaryContactEmail,
      description: tenantData.description || '',
      status: tenantData.status || 'active',
      subscriptionPlan: tenantData.subscriptionPlan,
      createdDate: new Date().toISOString(),
      lastLogin: null,
      userCount: 1,
      documentsCount: 0,
    };

    return newTenant;
  },

  updateTenant: async (tenantId, tenantData) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock updating tenant
    const updatedTenant = {
      id: tenantId,
      tenantId: `TNT-2024-${tenantId}`,
      ...tenantData,
      updatedDate: new Date().toISOString()
    };

    return updatedTenant;
  },

  suspendTenant: async (tenantId, suspend = true) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const newStatus = suspend ? 'suspended' : 'active';
    
    return {
      tenantId,
      newStatus,
      updatedDate: new Date().toISOString()
    };
  },

  deleteTenant: async (tenantId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return tenantId;
  },

  fetchTenantUsers: async (tenantId) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock user data for each tenant
    const mockUsersData = {
      '1': [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@acme-insurance.com',
          phoneNumber: '+1-555-0101',
          status: 'activated',
          createdAt: '2024-01-16T08:30:00Z'
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@acme-insurance.com',
          phoneNumber: '+1-555-0102',
          status: 'activated',
          createdAt: '2024-01-18T10:15:00Z'
        },
        {
          id: '3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@acme-insurance.com',
          phoneNumber: '+1-555-0103',
          status: 'activated',
          createdAt: '2024-01-20T14:45:00Z'
        }
      ],
      '2': [
        {
          id: '4',
          firstName: 'Emma',
          lastName: 'Davis',
          email: 'emma.davis@safeguard.com',
          phoneNumber: '+1-555-0201',
          status: 'activated',
          createdAt: '2024-01-22T09:20:00Z'
        },
        {
          id: '5',
          firstName: 'James',
          lastName: 'Wilson',
          email: 'james.wilson@safeguard.com',
          phoneNumber: '+1-555-0202',
          status: 'deactivated',
          createdAt: '2024-01-25T11:30:00Z'
        }
      ],
      '6': [
        {
          id: '6',
          firstName: 'Lisa',
          lastName: 'Anderson',
          email: 'lisa.anderson@securelife.com',
          phoneNumber: '+1-555-0301',
          status: 'activated',
          createdAt: '2024-02-14T13:15:00Z'
        },
        {
          id: '7',
          firstName: 'Robert',
          lastName: 'Taylor',
          email: 'robert.taylor@securelife.com',
          phoneNumber: '+1-555-0302',
          status: 'activated',
          createdAt: '2024-02-16T15:45:00Z'
        },
        {
          id: '8',
          firstName: 'Jennifer',
          lastName: 'Martinez',
          email: 'jennifer.martinez@securelife.com',
          phoneNumber: '+1-555-0303',
          status: 'pending',
          createdAt: '2024-02-18T12:00:00Z'
        }
      ]
    };

    // Generate more users for other tenants
    const generateUsersForTenant = (tenantId, count) => {
      const firstNames = ['Alex', 'Chris', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Blake'];
      const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'];
      const statuses = ['activated', 'activated', 'activated', 'deactivated', 'pending'];
      
      return Array.from({ length: count }, (_, index) => ({
        id: `${tenantId}_${index + 1}`,
        firstName: firstNames[index % firstNames.length],
        lastName: lastNames[index % lastNames.length],
        email: `user${index + 1}@tenant${tenantId}.com`,
        phoneNumber: `+1-555-${String(tenantId).padStart(2, '0')}${String(index + 1).padStart(2, '0')}`,
        status: statuses[index % statuses.length],
        createdAt: new Date(2024, 0, 15 + index, 10 + (index % 12), 30).toISOString()
      }));
    };

    // Return mock users or generate them
    const users = mockUsersData[tenantId] || generateUsersForTenant(tenantId, Math.floor(Math.random() * 15) + 1);
    
    return users;
  }
};

// Saga functions
function* fetchTenantsSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchTenantsSaga triggered with params:', params);
    
    const response = yield call(api.fetchTenants, params);
    console.log('✅ Tenant API response received:', response);
    
    // Ensure response has required structure
    const validatedResponse = {
      tenants: response.tenants || [],
      summary: {
        totalTenants: response.summary?.totalTenants || 0,
        statusCounts: response.summary?.statusCounts || {}
      },
      pagination: response.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
    
    console.log('📤 Dispatching tenant success with:', validatedResponse);
    yield put(fetchTenantsSuccess(validatedResponse));
  } catch (error) {
    console.error('❌ Error in fetchTenantsSaga:', error);
    yield put(fetchTenantsFailure(error.message || 'Failed to fetch tenants'));
  }
}

function* fetchSubscriptionPlansSaga() {
  try {
    const plans = yield call(api.fetchSubscriptionPlans);
    yield put(fetchSubscriptionPlansSuccess(plans));
  } catch (error) {
    yield put(fetchSubscriptionPlansFailure(error.message || 'Failed to fetch subscription plans'));
  }
}

function* createTenantSaga(action) {
  try {
    const newTenant = yield call(api.createTenant, action.payload);
    yield put(createTenantSuccess(newTenant));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Tenant created successfully', 'success');
    }
  } catch (error) {
    yield put(createTenantFailure(error.message || 'Failed to create tenant'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to create tenant. Please try again.', 'error');
    }
  }
}

function* updateTenantSaga(action) {
  try {
    const { id, ...tenantData } = action.payload;
    const updatedTenant = yield call(api.updateTenant, id, tenantData);
    yield put(updateTenantSuccess(updatedTenant));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Tenant updated successfully', 'success');
    }
  } catch (error) {
    yield put(updateTenantFailure(error.message || 'Failed to update tenant'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to update tenant. Please try again.', 'error');
    }
  }
}

function* suspendTenantSaga(action) {
  try {
    const { tenantId, suspend } = action.payload;
    const response = yield call(api.suspendTenant, tenantId, suspend);
    yield put(suspendTenantSuccess(response));

    // Show success message
    const action_text = suspend ? 'suspended' : 'reactivated';
    if (window.showNotification) {
      window.showNotification(`Tenant ${action_text} successfully`, 'success');
    }
  } catch (error) {
    yield put(suspendTenantFailure(error.message || 'Failed to update tenant status'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to update tenant status. Please try again.', 'error');
    }
  }
}

function* deleteTenantSaga(action) {
  try {
    const tenantId = action.payload;
    yield call(api.deleteTenant, tenantId);
    yield put(deleteTenantSuccess(tenantId));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Tenant deleted successfully', 'success');
    }
  } catch (error) {
    yield put(deleteTenantFailure(error.message || 'Failed to delete tenant'));

    // Show error message
    if (window.showNotification) {
      window.showNotification('Failed to delete tenant. Please try again.', 'error');
    }
  }
}

function* fetchTenantUsersSaga(action) {
  try {
    const tenantId = action.payload;
    const users = yield call(api.fetchTenantUsers, tenantId);
    yield put(fetchTenantUsersSuccess({ tenantId, users }));
  } catch (error) {
    yield put(fetchTenantUsersFailure(error.message || 'Failed to fetch tenant users'));
  }
}

// Watcher sagas
function* watchFetchTenants() {
  console.log('🔧 watchFetchTenants started');
  yield takeLatest(fetchTenantsRequest.type, fetchTenantsSaga);
}

function* watchFetchSubscriptionPlans() {
  console.log('🔧 watchFetchSubscriptionPlans started');
  yield takeLatest(fetchSubscriptionPlansRequest.type, fetchSubscriptionPlansSaga);
}

function* watchCreateTenant() {
  console.log('🔧 watchCreateTenant started');
  yield takeEvery(createTenantRequest.type, createTenantSaga);
}

function* watchUpdateTenant() {
  console.log('🔧 watchUpdateTenant started');
  yield takeEvery(updateTenantRequest.type, updateTenantSaga);
}

function* watchSuspendTenant() {
  console.log('🔧 watchSuspendTenant started');
  yield takeEvery(suspendTenantRequest.type, suspendTenantSaga);
}

function* watchDeleteTenant() {
  console.log('🔧 watchDeleteTenant started');
  yield takeEvery(deleteTenantRequest.type, deleteTenantSaga);
}

function* watchFetchTenantUsers() {
  console.log('🔧 watchFetchTenantUsers started');
  yield takeEvery(fetchTenantUsersRequest.type, fetchTenantUsersSaga);
}

// Root tenant saga
export default function* tenantSaga() {
  console.log('🔧 Tenant saga initialized');
  yield all([
    fork(watchFetchTenants),
    fork(watchFetchSubscriptionPlans),
    fork(watchCreateTenant),
    fork(watchUpdateTenant),
    fork(watchSuspendTenant),
    fork(watchDeleteTenant),
    fork(watchFetchTenantUsers)
  ]);
  console.log('✅ Tenant saga watchers started');
}
