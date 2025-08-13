import { call, put, takeLatest, delay } from 'redux-saga/effects';
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

// Mock data
let mockPlans = [
  {
    id: '1',
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
    updatedAt: '2024-01-15T00:00:00Z',
    tenantCount: 12
  },
  {
    id: '2',
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
    updatedAt: '2024-01-15T00:00:00Z',
    tenantCount: 8
  },
  {
    id: '3',
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
    updatedAt: '2024-01-15T00:00:00Z',
    tenantCount: 3
  }
];

let mockTenants = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    status: 'Active',
    planId: '1',
    plan: {
      id: '1',
      name: 'Basic Plan',
      price: 29.99
    },
    createdAt: '2024-01-20T00:00:00Z',
    userCount: 3,
    documentCount: 45
  },
  {
    id: '2',
    name: 'Healthcare Inc',
    email: 'admin@healthcare.com',
    status: 'Active',
    planId: '2',
    plan: {
      id: '2',
      name: 'Professional Plan',
      price: 99.99
    },
    createdAt: '2024-01-18T00:00:00Z',
    userCount: 15,
    documentCount: 340
  }
];

// Mock API functions
const mockFetchPlans = () => {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(mockPlans), 500));
};

const mockCreatePlan = (planData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validation
      if (!planData.name || !planData.price || !planData.billingCycle) {
        return reject(new Error('Missing required fields: name, price, and billingCycle are required'));
      }
      if (planData.price <= 0) {
        return reject(new Error('Price must be greater than 0'));
      }
      const existingPlan = mockPlans.find(plan =>
        plan.name.toLowerCase() === planData.name.toLowerCase()
      );
      if (existingPlan) {
        return reject(new Error('A plan with this name already exists'));
      }

      const newPlan = {
        id: Date.now().toString(),
        ...planData,
        features: planData.features || {}, // Ensure features is an object
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tenantCount: 0
      };
      mockPlans.push(newPlan);
      resolve(newPlan);
    }, 1000);
  });
};

const mockUpdatePlan = (planData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validation
      if (!planData.id) {
        return reject(new Error('Plan ID is required for update'));
      }
      if (!planData.name || !planData.price || !planData.billingCycle) {
        return reject(new Error('Missing required fields: name, price, and billingCycle are required'));
      }
      if (planData.price <= 0) {
        return reject(new Error('Price must be greater than 0'));
      }

      const index = mockPlans.findIndex(plan => plan.id === planData.id);
      if (index === -1) {
        return reject(new Error('Plan not found'));
      }

      const duplicatePlan = mockPlans.find(plan =>
        plan.name.toLowerCase() === planData.name.toLowerCase() && plan.id !== planData.id
      );
      if (duplicatePlan) {
        return reject(new Error('A plan with this name already exists'));
      }

      const updatedPlan = {
        ...mockPlans[index],
        ...planData,
        features: planData.features || mockPlans[index].features, // Preserve existing features if not provided
        updatedAt: new Date().toISOString()
      };
      mockPlans[index] = updatedPlan;
      resolve(updatedPlan);
    }, 1000);
  });
};

const mockDeletePlan = (planId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockPlans.findIndex(plan => plan.id === planId);
      if (index === -1) {
        return reject(new Error('Plan not found'));
      }

      const assignedTenants = mockTenants.filter(tenant => tenant.planId === planId);
      if (assignedTenants.length > 0) {
        return reject(new Error(`Cannot delete plan. It is currently assigned to ${assignedTenants.length} tenant(s)`));
      }

      mockPlans.splice(index, 1);
      resolve(planId);
    }, 500);
  });
};

const mockFetchTenants = () => {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(mockTenants), 500));
};

const mockAssignPlanToTenant = (tenantId, planId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tenantIndex = mockTenants.findIndex(tenant => tenant.id === tenantId);
      if (tenantIndex === -1) {
        return reject(new Error('Tenant not found'));
      }

      const plan = mockPlans.find(p => p.id === planId);
      if (!plan) {
        return reject(new Error('Plan not found'));
      }
      if (!plan.isActive) {
        return reject(new Error('Cannot assign an inactive plan'));
      }

      mockTenants[tenantIndex] = {
        ...mockTenants[tenantIndex],
        planId: planId,
        plan: { id: plan.id, name: plan.name, price: plan.price }
      };
      resolve({ tenantId, planId });
    }, 1000);
  });
};

// Saga functions
function* fetchPlansSaga() {
  try {
    const plans = yield call(mockFetchPlans);
    yield put(fetchPlansSuccess(plans));
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch subscription plans';
    yield put(fetchPlansFailure(errorMessage));
  }
}

function* createPlanSaga(action) {
  try {
    const response = yield call(mockCreatePlan, action.payload);
    yield put(createPlanSuccess(response));
  } catch (error) {
    const errorMessage = error.message || 'Failed to create subscription plan';
    yield put(createPlanFailure(errorMessage));
  }
}

function* updatePlanSaga(action) {
  try {
    const response = yield call(mockUpdatePlan, action.payload);
    yield put(updatePlanSuccess(response));
  } catch (error) {
    const errorMessage = error.message || 'Failed to update subscription plan';
    yield put(updatePlanFailure(errorMessage));
  }
}

function* deletePlanSaga(action) {
  try {
    yield call(mockDeletePlan, action.payload);
    yield put(deletePlanSuccess(action.payload));
  } catch (error) {
    const errorMessage = error.message || 'Cannot delete plan in use by tenants';
    yield put(deletePlanFailure(errorMessage));
  }
}

function* fetchTenantsSaga() {
  try {
    const response = yield call(mockFetchTenants);
    yield put(fetchTenantsSuccess(response));
  } catch (error) {
    const errorMessage = error.message || 'Failed to fetch tenants';
    yield put(fetchTenantsFailure(errorMessage));
  }
}

function* assignPlanToTenantSaga(action) {
  try {
    const { tenantId, planId } = action.payload;
    const response = yield call(mockAssignPlanToTenant, tenantId, planId);
    yield put(assignPlanToTenantSuccess(response));
  } catch (error) {
    const errorMessage = error.message || 'Failed to assign plan. Please try again.';
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