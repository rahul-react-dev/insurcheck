import { call, put, takeEvery, select } from 'redux-saga/effects';
import { adminAuthApi } from '../../utils/api';
import {
  fetchRulesRequest,
  fetchRulesSuccess,
  fetchRulesFailure,
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  createRuleRequest,
  createRuleSuccess,
  createRuleFailure,
  editRuleRequest,
  editRuleSuccess,
  editRuleFailure,
  deleteRuleRequest,
  deleteRuleSuccess,
  deleteRuleFailure,
  previewRuleRequest,
  previewRuleSuccess,
  previewRuleFailure,
  fetchAuditLogsRequest,
  fetchAuditLogsSuccess,
  fetchAuditLogsFailure
} from './complianceRulesSlice';

// Helper function to get current state
const getComplianceRulesState = (state) => state.complianceRules;

// Fetch rules saga
function* fetchRulesSaga(action) {
  try {
    const state = yield select(getComplianceRulesState);
    const params = {
      page: state.pagination.page,
      limit: state.pagination.limit,
      search: state.filters.search,
      ruleType: state.filters.ruleType,
      isActive: state.filters.isActive,
      sortBy: state.filters.sortBy,
      sortOrder: state.filters.sortOrder,
      ...action.payload
    };

    console.log('[ComplianceRules] Fetching rules with params:', params);
    
    const response = yield call(adminAuthApi.getComplianceRules, params);
    
    if (response?.success) {
      yield put(fetchRulesSuccess(response));
      console.log('[ComplianceRules] Fetched rules successfully:', response.data?.length);
    } else {
      yield put(fetchRulesFailure('Failed to fetch compliance rules'));
    }
  } catch (error) {
    console.error('[ComplianceRules] Error fetching rules:', error);
    const errorMessage = error.response?.data?.message || 'Failed to load compliance rules. Please try again.';
    yield put(fetchRulesFailure(errorMessage));
  }
}

// Fetch stats saga
function* fetchStatsSaga() {
  try {
    console.log('[ComplianceRules] Fetching stats');
    const response = yield call(adminAuthApi.getComplianceRuleStats);
    
    if (response?.success) {
      yield put(fetchStatsSuccess(response.data));
      console.log('[ComplianceRules] Fetched stats successfully:', response.data);
    } else {
      yield put(fetchStatsFailure('Failed to fetch rule statistics'));
    }
  } catch (error) {
    console.error('[ComplianceRules] Error fetching stats:', error);
    const errorMessage = error.response?.data?.message || 'Failed to load statistics';
    yield put(fetchStatsFailure(errorMessage));
  }
}

// Create rule saga
function* createRuleSaga(action) {
  try {
    console.log('[ComplianceRules] Creating rule:', action.payload);
    const response = yield call(adminAuthApi.createComplianceRule, action.payload);
    
    if (response?.success) {
      yield put(createRuleSuccess());
      // Refetch rules and stats
      yield put(fetchRulesRequest());
      yield put(fetchStatsRequest());
      
      // Show success notification
      if (window.showNotification) {
        window.showNotification('Rule created successfully.', 'success');
      }
      console.log('[ComplianceRules] Rule created successfully');
    } else {
      yield put(createRuleFailure('Failed to create rule'));
    }
  } catch (error) {
    console.error('[ComplianceRules] Error creating rule:', error);
    const errorMessage = error.response?.data?.message || 'Invalid rule format. Please check inputs.';
    yield put(createRuleFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

// Edit rule saga
function* editRuleSaga(action) {
  try {
    const { ruleId, ruleData } = action.payload;
    console.log('[ComplianceRules] Updating rule:', ruleId, ruleData);
    
    const response = yield call(adminAuthApi.updateComplianceRule, ruleId, ruleData);
    
    if (response?.success) {
      yield put(editRuleSuccess());
      // Refetch rules and stats
      yield put(fetchRulesRequest());
      yield put(fetchStatsRequest());
      
      // Show success notification
      if (window.showNotification) {
        window.showNotification('Rule updated successfully.', 'success');
      }
      console.log('[ComplianceRules] Rule updated successfully');
    } else {
      yield put(editRuleFailure('Failed to update rule'));
    }
  } catch (error) {
    console.error('[ComplianceRules] Error updating rule:', error);
    const errorMessage = error.response?.data?.message || 'Invalid rule format. Please check inputs.';
    yield put(editRuleFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

// Delete rule saga
function* deleteRuleSaga(action) {
  try {
    const ruleId = action.payload;
    console.log('[ComplianceRules] Deleting rule:', ruleId);
    
    const response = yield call(adminAuthApi.deleteComplianceRule, ruleId);
    
    if (response?.success) {
      yield put(deleteRuleSuccess());
      // Refetch rules and stats
      yield put(fetchRulesRequest());
      yield put(fetchStatsRequest());
      
      // Show success notification
      if (window.showNotification) {
        window.showNotification('Rule deleted successfully.', 'success');
      }
      console.log('[ComplianceRules] Rule deleted successfully');
    } else {
      yield put(deleteRuleFailure('Failed to delete rule'));
    }
  } catch (error) {
    console.error('[ComplianceRules] Error deleting rule:', error);
    const errorMessage = error.response?.data?.message || 'Failed to delete rule. Please try again.';
    yield put(deleteRuleFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

// Preview rule saga
function* previewRuleSaga(action) {
  try {
    console.log('[ComplianceRules] Previewing rule impact:', action.payload);
    const response = yield call(adminAuthApi.previewComplianceRule, action.payload);
    
    if (response?.success) {
      yield put(previewRuleSuccess(response.data));
      console.log('[ComplianceRules] Preview generated successfully');
    } else {
      yield put(previewRuleFailure('Failed to generate preview'));
    }
  } catch (error) {
    console.error('[ComplianceRules] Error previewing rule:', error);
    const errorMessage = error.response?.data?.message || 'Failed to preview rules. Please try again.';
    yield put(previewRuleFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

// Fetch audit logs saga
function* fetchAuditLogsSaga(action) {
  try {
    const { ruleId } = action.payload;
    console.log('[ComplianceRules] Fetching audit logs for rule:', ruleId);
    
    const response = yield call(adminAuthApi.getComplianceRuleAuditLogs, { ruleId });
    
    if (response?.success) {
      yield put(fetchAuditLogsSuccess(response.data));
      console.log('[ComplianceRules] Audit logs fetched successfully');
    } else {
      yield put(fetchAuditLogsFailure('Failed to fetch audit logs'));
    }
  } catch (error) {
    console.error('[ComplianceRules] Error fetching audit logs:', error);
    const errorMessage = error.response?.data?.message || 'Failed to load audit logs. Please try again.';
    yield put(fetchAuditLogsFailure(errorMessage));
    
    // Show error notification
    if (window.showNotification) {
      window.showNotification(errorMessage, 'error');
    }
  }
}

// Root saga
function* complianceRulesSaga() {
  yield takeEvery(fetchRulesRequest.type, fetchRulesSaga);
  yield takeEvery(fetchStatsRequest.type, fetchStatsSaga);
  yield takeEvery(createRuleRequest.type, createRuleSaga);
  yield takeEvery(editRuleRequest.type, editRuleSaga);
  yield takeEvery(deleteRuleRequest.type, deleteRuleSaga);
  yield takeEvery(previewRuleRequest.type, previewRuleSaga);
  yield takeEvery(fetchAuditLogsRequest.type, fetchAuditLogsSaga);
}

export default complianceRulesSaga;