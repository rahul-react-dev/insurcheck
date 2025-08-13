
import { call, put, takeEvery, takeLatest, all, fork, delay } from 'redux-saga/effects';
import {
  fetchTenantStatesRequest,
  fetchTenantStatesSuccess,
  fetchTenantStatesFailure,
  updateTenantStateRequest,
  updateTenantStateSuccess,
  updateTenantStateFailure,
  updateTrialStatusRequest,
  updateTrialStatusSuccess,
  updateTrialStatusFailure,
  cancelSubscriptionRequest,
  cancelSubscriptionSuccess,
  cancelSubscriptionFailure
} from './tenantStateSlice';

// Mock API functions - replace with actual API calls
const api = {
  fetchTenantStates: async (params = {}) => {
    await delay(800);

    const { page = 1, limit = 5, ...filters } = params;
    console.log('🔍 Mock Tenant State API called with params:', { page, limit, ...filters });

    // Mock tenant state data with comprehensive state information
    const mockTenantStates = [
      {
        id: '1',
        tenantId: 'TNT-2024-001',
        tenantName: 'Acme Insurance Solutions',
        primaryContactEmail: 'admin@acme-insurance.com',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        subscriptionStatus: 'active',
        subscriptionStartDate: '2024-01-15T10:30:00Z',
        subscriptionEndDate: '2024-12-15T10:30:00Z',
        trialStatus: 'completed',
        trialStartDate: '2024-01-01T00:00:00Z',
        trialEndDate: '2024-01-14T23:59:59Z',
        createdDate: '2024-01-15T10:30:00Z',
        lastLogin: '2024-03-20T15:45:00Z',
        userCount: 25,
        documentsCount: 1250,
        accessLevel: 'full',
        lastStateChange: '2024-01-15T10:30:00Z',
        stateChangeReason: 'Initial activation after trial',
        auditLogs: [
          { date: '2024-01-15T10:30:00Z', action: 'activated', reason: 'Trial completed successfully', admin: 'system' },
          { date: '2024-01-01T00:00:00Z', action: 'trial_started', reason: 'Trial period initiated', admin: 'system' }
        ]
      },
      {
        id: '2',
        tenantId: 'TNT-2024-002',
        tenantName: 'SafeGuard Insurance Co.',
        primaryContactEmail: 'billing@safeguard.com',
        status: 'active',
        subscriptionPlan: 'Professional',
        subscriptionStatus: 'active',
        subscriptionStartDate: '2024-01-20T09:15:00Z',
        subscriptionEndDate: '2024-12-20T09:15:00Z',
        trialStatus: 'completed',
        trialStartDate: '2024-01-05T00:00:00Z',
        trialEndDate: '2024-01-19T23:59:59Z',
        createdDate: '2024-01-20T09:15:00Z',
        lastLogin: '2024-03-19T12:30:00Z',
        userCount: 12,
        documentsCount: 480,
        accessLevel: 'full',
        lastStateChange: '2024-01-20T09:15:00Z',
        stateChangeReason: 'Subscription activated after trial',
        auditLogs: [
          { date: '2024-01-20T09:15:00Z', action: 'activated', reason: 'Subscription purchased', admin: 'system' }
        ]
      },
      {
        id: '3',
        tenantId: 'TNT-2024-003',
        tenantName: 'Quick Insurance Ltd.',
        primaryContactEmail: 'contact@quickinsurance.com',
        status: 'trial',
        subscriptionPlan: 'Basic',
        subscriptionStatus: 'trial',
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        trialStatus: 'active',
        trialStartDate: '2024-03-01T14:20:00Z',
        trialEndDate: '2024-03-31T23:59:59Z',
        createdDate: '2024-03-01T14:20:00Z',
        lastLogin: '2024-03-20T08:15:00Z',
        userCount: 3,
        documentsCount: 25,
        accessLevel: 'trial',
        lastStateChange: '2024-03-01T14:20:00Z',
        stateChangeReason: 'Trial started',
        auditLogs: [
          { date: '2024-03-01T14:20:00Z', action: 'trial_started', reason: 'New tenant trial initiated', admin: 'system' }
        ]
      },
      {
        id: '4',
        tenantId: 'TNT-2024-004',
        tenantName: 'Premium Insurance Group',
        primaryContactEmail: 'admin@premium-group.com',
        status: 'deactivated',
        subscriptionPlan: 'Enterprise',
        subscriptionStatus: 'cancelled',
        subscriptionStartDate: '2024-02-05T11:45:00Z',
        subscriptionEndDate: '2024-03-15T11:45:00Z',
        trialStatus: 'completed',
        trialStartDate: '2024-01-20T00:00:00Z',
        trialEndDate: '2024-02-04T23:59:59Z',
        createdDate: '2024-02-05T11:45:00Z',
        lastLogin: '2024-03-15T16:20:00Z',
        userCount: 35,
        documentsCount: 1800,
        accessLevel: 'read_only',
        lastStateChange: '2024-03-15T11:45:00Z',
        stateChangeReason: 'Manual deactivation due to policy violation',
        auditLogs: [
          { date: '2024-03-15T11:45:00Z', action: 'deactivated', reason: 'Policy violation', admin: 'admin@system.com' },
          { date: '2024-02-05T11:45:00Z', action: 'activated', reason: 'Subscription purchased', admin: 'system' }
        ]
      },
      {
        id: '5',
        tenantId: 'TNT-2024-005',
        tenantName: 'Reliable Insurance Corp.',
        primaryContactEmail: 'info@reliable.com',
        status: 'trial_expired',
        subscriptionPlan: 'Professional',
        subscriptionStatus: 'expired',
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        trialStatus: 'expired',
        trialStartDate: '2024-02-01T16:30:00Z',
        trialEndDate: '2024-02-29T23:59:59Z',
        createdDate: '2024-02-01T16:30:00Z',
        lastLogin: '2024-02-28T15:30:00Z',
        userCount: 1,
        documentsCount: 15,
        accessLevel: 'read_only',
        lastStateChange: '2024-03-01T00:00:00Z',
        stateChangeReason: 'Trial period expired automatically',
        auditLogs: [
          { date: '2024-03-01T00:00:00Z', action: 'trial_expired', reason: 'Trial period ended', admin: 'system' },
          { date: '2024-02-01T16:30:00Z', action: 'trial_started', reason: 'New tenant trial initiated', admin: 'system' }
        ]
      },
      {
        id: '6',
        tenantId: 'TNT-2024-006',
        tenantName: 'SecureLife Insurance',
        primaryContactEmail: 'contact@securelife.com',
        status: 'suspended',
        subscriptionPlan: 'Basic',
        subscriptionStatus: 'suspended',
        subscriptionStartDate: '2024-02-12T13:15:00Z',
        subscriptionEndDate: '2024-12-12T13:15:00Z',
        trialStatus: 'completed',
        trialStartDate: '2024-01-28T00:00:00Z',
        trialEndDate: '2024-02-11T23:59:59Z',
        createdDate: '2024-02-12T13:15:00Z',
        lastLogin: '2024-03-10T10:45:00Z',
        userCount: 8,
        documentsCount: 200,
        accessLevel: 'read_only',
        lastStateChange: '2024-03-10T10:45:00Z',
        stateChangeReason: 'Suspended due to payment failure',
        auditLogs: [
          { date: '2024-03-10T10:45:00Z', action: 'suspended', reason: 'Payment failure', admin: 'system' },
          { date: '2024-02-12T13:15:00Z', action: 'activated', reason: 'Subscription purchased', admin: 'system' }
        ]
      },
      {
        id: '7',
        tenantId: 'TNT-2024-007',
        tenantName: 'TrustGuard Insurance',
        primaryContactEmail: 'admin@trustguard.com',
        status: 'active',
        subscriptionPlan: 'Enterprise',
        subscriptionStatus: 'active',
        subscriptionStartDate: '2024-02-15T12:00:00Z',
        subscriptionEndDate: '2024-12-15T12:00:00Z',
        trialStatus: 'completed',
        trialStartDate: '2024-02-01T00:00:00Z',
        trialEndDate: '2024-02-14T23:59:59Z',
        createdDate: '2024-02-15T12:00:00Z',
        lastLogin: '2024-03-20T14:30:00Z',
        userCount: 28,
        documentsCount: 950,
        accessLevel: 'full',
        lastStateChange: '2024-02-15T12:00:00Z',
        stateChangeReason: 'Activated after successful trial',
        auditLogs: [
          { date: '2024-02-15T12:00:00Z', action: 'activated', reason: 'Trial completed successfully', admin: 'system' }
        ]
      },
      {
        id: '8',
        tenantId: 'TNT-2024-008',
        tenantName: 'Shield Insurance Services',
        primaryContactEmail: 'support@shield.com',
        status: 'trial',
        subscriptionPlan: 'Professional',
        subscriptionStatus: 'trial',
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        trialStatus: 'active',
        trialStartDate: '2024-03-10T15:45:00Z',
        trialEndDate: '2024-04-09T23:59:59Z',
        createdDate: '2024-03-10T15:45:00Z',
        lastLogin: '2024-03-21T11:15:00Z',
        userCount: 5,
        documentsCount: 45,
        accessLevel: 'trial',
        lastStateChange: '2024-03-10T15:45:00Z',
        stateChangeReason: 'Trial started',
        auditLogs: [
          { date: '2024-03-10T15:45:00Z', action: 'trial_started', reason: 'New tenant trial initiated', admin: 'system' }
        ]
      },
      {
        id: '9',
        tenantId: 'TNT-2024-009',
        tenantName: 'Fortress Insurance LLC',
        primaryContactEmail: 'admin@fortress.com',
        status: 'subscription_cancelled',
        subscriptionPlan: 'Basic',
        subscriptionStatus: 'cancelled',
        subscriptionStartDate: '2024-02-20T10:30:00Z',
        subscriptionEndDate: '2024-03-20T10:30:00Z',
        trialStatus: 'completed',
        trialStartDate: '2024-02-05T00:00:00Z',
        trialEndDate: '2024-02-19T23:59:59Z',
        createdDate: '2024-02-20T10:30:00Z',
        lastLogin: '2024-03-18T09:20:00Z',
        userCount: 3,
        documentsCount: 45,
        accessLevel: 'read_only',
        lastStateChange: '2024-03-20T10:30:00Z',
        stateChangeReason: 'Subscription cancelled by user request',
        auditLogs: [
          { date: '2024-03-20T10:30:00Z', action: 'subscription_cancelled', reason: 'User requested cancellation', admin: 'support@system.com' },
          { date: '2024-02-20T10:30:00Z', action: 'activated', reason: 'Subscription purchased', admin: 'system' }
        ]
      },
      {
        id: '10',
        tenantId: 'TNT-2024-010',
        tenantName: 'Guardian Insurance Inc.',
        primaryContactEmail: 'info@guardian.com',
        status: 'active',
        subscriptionPlan: 'Professional',
        subscriptionStatus: 'active',
        subscriptionStartDate: '2024-02-22T14:15:00Z',
        subscriptionEndDate: '2024-12-22T14:15:00Z',
        trialStatus: 'completed',
        trialStartDate: '2024-02-08T00:00:00Z',
        trialEndDate: '2024-02-21T23:59:59Z',
        createdDate: '2024-02-22T14:15:00Z',
        lastLogin: '2024-03-20T13:45:00Z',
        userCount: 18,
        documentsCount: 720,
        accessLevel: 'full',
        lastStateChange: '2024-02-22T14:15:00Z',
        stateChangeReason: 'Activated after trial completion',
        auditLogs: [
          { date: '2024-02-22T14:15:00Z', action: 'activated', reason: 'Trial completed successfully', admin: 'system' }
        ]
      }
    ];

    // Apply filters
    let filteredTenantStates = mockTenantStates;

    if (filters.tenantName) {
      filteredTenantStates = filteredTenantStates.filter(tenant =>
        tenant.tenantName.toLowerCase().includes(filters.tenantName.toLowerCase())
      );
    }

    if (filters.status) {
      filteredTenantStates = filteredTenantStates.filter(tenant => tenant.status === filters.status);
    }

    if (filters.subscriptionStatus) {
      filteredTenantStates = filteredTenantStates.filter(tenant => tenant.subscriptionStatus === filters.subscriptionStatus);
    }

    if (filters.trialStatus) {
      filteredTenantStates = filteredTenantStates.filter(tenant => tenant.trialStatus === filters.trialStatus);
    }

    if (filters.dateRange?.start) {
      filteredTenantStates = filteredTenantStates.filter(tenant => 
        new Date(tenant.createdDate) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange?.end) {
      filteredTenantStates = filteredTenantStates.filter(tenant => 
        new Date(tenant.createdDate) <= new Date(filters.dateRange.end)
      );
    }

    // Calculate summary
    const summary = {
      activeTenants: filteredTenantStates.filter(t => t.status === 'active').length,
      trialTenants: filteredTenantStates.filter(t => t.status === 'trial' || t.trialStatus === 'active').length,
      deactivatedTenants: filteredTenantStates.filter(t => t.status === 'deactivated').length,
      cancelledTenants: filteredTenantStates.filter(t => t.status === 'subscription_cancelled').length,
      expiredTrials: filteredTenantStates.filter(t => t.status === 'trial_expired').length
    };

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTenantStates = filteredTenantStates.slice(startIndex, endIndex);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredTenantStates.length,
      totalPages: Math.ceil(filteredTenantStates.length / limit)
    };

    return {
      tenantStates: paginatedTenantStates,
      summary,
      pagination
    };
  },

  updateTenantState: async (tenantId, stateData) => {
    await delay(1000);

    const updatedTenant = {
      id: tenantId,
      status: stateData.status,
      lastStateChange: new Date().toISOString(),
      stateChangeReason: stateData.reason || 'Updated by admin',
      accessLevel: stateData.status === 'deactivated' ? 'read_only' : 
                  stateData.status === 'suspended' ? 'read_only' : 
                  stateData.status === 'trial' ? 'trial' : 'full',
      auditLogs: [
        {
          date: new Date().toISOString(),
          action: stateData.status,
          reason: stateData.reason || 'Updated by admin',
          admin: 'admin@system.com'
        }
      ]
    };

    return updatedTenant;
  },

  updateTrialStatus: async (tenantId, trialData) => {
    await delay(800);

    const updatedTenant = {
      id: tenantId,
      trialStatus: trialData.endTrial ? 'ended' : trialData.trialStatus,
      trialEndDate: trialData.endTrial ? new Date().toISOString() : trialData.trialEndDate,
      status: trialData.endTrial ? 'trial_expired' : 'trial',
      lastStateChange: new Date().toISOString(),
      stateChangeReason: trialData.reason || 'Trial status updated',
      accessLevel: trialData.endTrial ? 'read_only' : 'trial',
      auditLogs: [
        {
          date: new Date().toISOString(),
          action: trialData.endTrial ? 'trial_ended' : 'trial_updated',
          reason: trialData.reason || 'Trial status updated by admin',
          admin: 'admin@system.com'
        }
      ]
    };

    return updatedTenant;
  },

  cancelSubscription: async (tenantId, cancellationData) => {
    await delay(1000);

    const updatedTenant = {
      id: tenantId,
      subscriptionStatus: 'cancelled',
      status: 'subscription_cancelled',
      subscriptionEndDate: new Date().toISOString(),
      lastStateChange: new Date().toISOString(),
      stateChangeReason: cancellationData.reason || 'Subscription cancelled',
      accessLevel: 'read_only',
      auditLogs: [
        {
          date: new Date().toISOString(),
          action: 'subscription_cancelled',
          reason: cancellationData.reason || 'Subscription cancelled by admin',
          admin: 'admin@system.com'
        }
      ]
    };

    return updatedTenant;
  }
};

// Saga functions
function* fetchTenantStatesSaga(action) {
  try {
    const params = action.payload || { page: 1, limit: 10 };
    console.log('📡 fetchTenantStatesSaga triggered with params:', params);
    
    const response = yield call(api.fetchTenantStates, params);
    console.log('✅ Tenant State API response received:', response);
    
    yield put(fetchTenantStatesSuccess(response));
  } catch (error) {
    console.error('❌ Error in fetchTenantStatesSaga:', error);
    yield put(fetchTenantStatesFailure(error.message || 'Failed to fetch tenant states'));
  }
}

function* updateTenantStateSaga(action) {
  try {
    const { tenantId, ...stateData } = action.payload;
    const updatedTenant = yield call(api.updateTenantState, tenantId, stateData);
    
    // Calculate updated summary (simplified)
    const summary = {
      activeTenants: stateData.status === 'active' ? 1 : 0,
      deactivatedTenants: stateData.status === 'deactivated' ? 1 : 0
    };

    yield put(updateTenantStateSuccess({ ...updatedTenant, summary }));

    // Show success message
    const messages = {
      'deactivated': 'Tenant has been deactivated successfully.',
      'active': 'Tenant has been activated successfully.',
      'suspended': 'Tenant has been suspended successfully.'
    };
    
    if (window.showNotification) {
      window.showNotification(messages[stateData.status] || 'Tenant state updated successfully.', 'success');
    }
  } catch (error) {
    yield put(updateTenantStateFailure(error.message || 'Unable to update tenant state. Please try again.'));

    if (window.showNotification) {
      window.showNotification('Unable to update tenant state. Please try again.', 'error');
    }
  }
}

function* updateTrialStatusSaga(action) {
  try {
    const { tenantId, ...trialData } = action.payload;
    const updatedTenant = yield call(api.updateTrialStatus, tenantId, trialData);
    
    yield put(updateTrialStatusSuccess(updatedTenant));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Trial status updated successfully.', 'success');
    }
  } catch (error) {
    yield put(updateTrialStatusFailure(error.message || 'Failed to update trial status'));

    if (window.showNotification) {
      window.showNotification('Action could not be completed. Please check the tenant status.', 'error');
    }
  }
}

function* cancelSubscriptionSaga(action) {
  try {
    const { tenantId, ...cancellationData } = action.payload;
    const updatedTenant = yield call(api.cancelSubscription, tenantId, cancellationData);
    
    yield put(cancelSubscriptionSuccess(updatedTenant));

    // Show success message
    if (window.showNotification) {
      window.showNotification('Subscription cancelled successfully.', 'success');
    }
  } catch (error) {
    yield put(cancelSubscriptionFailure(error.message || 'Failed to cancel subscription'));

    if (window.showNotification) {
      window.showNotification('Action could not be completed. Please check the tenant status.', 'error');
    }
  }
}

// Watcher sagas
function* watchFetchTenantStates() {
  console.log('🔧 watchFetchTenantStates started');
  yield takeLatest(fetchTenantStatesRequest.type, fetchTenantStatesSaga);
}

function* watchUpdateTenantState() {
  console.log('🔧 watchUpdateTenantState started');
  yield takeEvery(updateTenantStateRequest.type, updateTenantStateSaga);
}

function* watchUpdateTrialStatus() {
  console.log('🔧 watchUpdateTrialStatus started');
  yield takeEvery(updateTrialStatusRequest.type, updateTrialStatusSaga);
}

function* watchCancelSubscription() {
  console.log('🔧 watchCancelSubscription started');
  yield takeEvery(cancelSubscriptionRequest.type, cancelSubscriptionSaga);
}

// Root tenant state saga
export default function* tenantStateSaga() {
  console.log('🔧 Tenant state saga initialized');
  yield all([
    fork(watchFetchTenantStates),
    fork(watchUpdateTenantState),
    fork(watchUpdateTrialStatus),
    fork(watchCancelSubscription)
  ]);
  console.log('✅ Tenant state saga watchers started');
}
