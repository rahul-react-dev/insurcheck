
import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchPlansRequest,
  fetchPlansSuccess,
  fetchPlansFailure,
  createPlanRequest,
  createPlanSuccess,
  createPlanFailure,
  updatePlanRequest,
  updatePlanSuccess,
  updatePlanFailure,
  deletePlanRequest,
  deletePlanSuccess,
  deletePlanFailure,
  fetchTenantsRequest,
  fetchTenantsSuccess,
  fetchTenantsFailure,
  assignPlanToTenantRequest,
  assignPlanToTenantSuccess,
  assignPlanToTenantFailure
} from './subscriptionSlice';

// Mock API functions - replace with real endpoints when backend is ready
const fetchPlansApi = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        planId: 'BASIC_001',
        name: 'Basic Plan',
        description: 'Perfect for small businesses getting started with compliance management',
        price: 29.99,
        billingCycle: 'Monthly',
        features: {
          maxUsers: 5,
          maxDocuments: 100,
          maxComplianceChecks: 50,
          storage: '1GB',
          support: 'Email'
        },
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z',
        tenantCount: 12
      },
      {
        id: 2,
        planId: 'PRO_002',
        name: 'Professional Plan',
        description: 'Advanced features for growing organizations with enhanced compliance needs',
        price: 99.99,
        billingCycle: 'Monthly',
        features: {
          maxUsers: 25,
          maxDocuments: 1000,
          maxComplianceChecks: 500,
          storage: '10GB',
          support: 'Priority Email + Phone'
        },
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z',
        tenantCount: 8
      },
      {
        id: 3,
        planId: 'ENT_003',
        name: 'Enterprise Plan',
        description: 'Unlimited access with dedicated support for large organizations',
        price: 299.99,
        billingCycle: 'Monthly',
        features: {
          maxUsers: 'Unlimited',
          maxDocuments: 'Unlimited',
          maxComplianceChecks: 'Unlimited',
          storage: '100GB',
          support: 'Dedicated Account Manager'
        },
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z',
        tenantCount: 3
      }
    ]
  });
};

const fetchTenantsApi = () => {
  return Promise.resolve({
    data: [
      {
        id: 1,
        name: 'TechCorp Solutions',
        email: 'admin@techcorp.com',
        status: 'Active',
        planId: 1,
        plan: {
          id: 1,
          name: 'Basic Plan',
          price: 29.99
        },
        createdAt: '2024-01-20T00:00:00Z',
        userCount: 3,
        documentCount: 45
      },
      {
        id: 2,
        name: 'Healthcare Inc',
        email: 'admin@healthcare.com',
        status: 'Active',
        planId: 2,
        plan: {
          id: 2,
          name: 'Professional Plan',
          price: 99.99
        },
        createdAt: '2024-01-18T00:00:00Z',
        userCount: 15,
        documentCount: 340
      }
    ]
  });
};

const createPlanApi = (planData) => {
  return Promise.resolve({
    data: {
      id: Date.now(),
      ...planData,
      isActive: true,
      createdAt: new Date().toISOString(),
      tenantCount: 0
    }
  });
};

const updatePlanApi = (planId, planData) => {
  return Promise.resolve({
    data: {
      id: planId,
      ...planData,
      updatedAt: new Date().toISOString()
    }
  });
};

const deletePlanApi = (planId) => {
  return Promise.resolve({ data: { success: true } });
};

const assignPlanToTenantApi = (tenantId, planId) => {
  return Promise.resolve({
    data: { tenantId, planId, assignedAt: new Date().toISOString() }
  });
};

// Saga workers
function* fetchPlansSaga() {
  try {
    const response = yield call(fetchPlansApi);
    yield put(fetchPlansSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch subscription plans';
    yield put(fetchPlansFailure(errorMessage));
  }
}

function* createPlanSaga(action) {
  try {
    const response = yield call(createPlanApi, action.payload);
    yield put(createPlanSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create subscription plan';
    yield put(createPlanFailure(errorMessage));
  }
}

function* updatePlanSaga(action) {
  try {
    const { id, ...planData } = action.payload;
    const response = yield call(updatePlanApi, id, planData);
    yield put(updatePlanSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update subscription plan';
    yield put(updatePlanFailure(errorMessage));
  }
}

function* deletePlanSaga(action) {
  try {
    yield call(deletePlanApi, action.payload);
    yield put(deletePlanSuccess(action.payload));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Cannot delete plan in use by tenants';
    yield put(deletePlanFailure(errorMessage));
  }
}

function* fetchTenantsSaga() {
  try {
    const response = yield call(fetchTenantsApi);
    yield put(fetchTenantsSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch tenants';
    yield put(fetchTenantsFailure(errorMessage));
  }
}

function* assignPlanToTenantSaga(action) {
  try {
    const { tenantId, planId } = action.payload;
    const response = yield call(assignPlanToTenantApi, tenantId, planId);
    yield put(assignPlanToTenantSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to assign plan. Please try again.';
    yield put(assignPlanToTenantFailure(errorMessage));
  }
}

// Root saga
export default function* subscriptionSaga() {
  yield takeLatest(fetchPlansRequest.type, fetchPlansSaga);
  yield takeLatest(createPlanRequest.type, createPlanSaga);
  yield takeLatest(updatePlanRequest.type, updatePlanSaga);
  yield takeLatest(deletePlanRequest.type, deletePlanSaga);
  yield takeLatest(fetchTenantsRequest.type, fetchTenantsSaga);
  yield takeLatest(assignPlanToTenantRequest.type, assignPlanToTenantSaga);
}
