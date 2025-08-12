
import { call, put, takeLatest, select } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchActivityLogsRequest,
  fetchActivityLogsSuccess,
  fetchActivityLogsFailure,
  exportActivityLogsRequest,
  exportActivityLogsSuccess,
  exportActivityLogsFailure
} from './activityLogSlice';

// Mock API call for activity logs
const fetchActivityLogsApi = (params) => {
  console.log('Fetching activity logs with params:', params);
  
  // Mock data - replace with real API endpoint when backend is ready
  const mockLogs = [
    {
      id: 'LOG001',
      logId: 'LOG001',
      tenantName: 'TechCorp Inc.',
      tenantId: 'TENANT001',
      userEmail: 'admin@techcorp.com',
      userType: 'Admin',
      actionPerformed: 'Document Upload',
      actionDetails: 'Uploaded policy document: tech_policy_2024.pdf',
      timestamp: '2024-01-15T14:30:00Z',
      ipAddress: '192.168.1.100',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_abc123',
      resourceAffected: 'tech_policy_2024.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG002',
      logId: 'LOG002',
      tenantName: 'HealthPlus Ltd.',
      tenantId: 'TENANT002',
      userEmail: 'user@healthplus.com',
      userType: 'User',
      actionPerformed: 'Login Attempt',
      actionDetails: 'Failed login attempt - Invalid credentials',
      timestamp: '2024-01-15T13:45:00Z',
      ipAddress: '192.168.1.101',
      status: 'Failed',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_def456',
      resourceAffected: null,
      severity: 'Medium'
    },
    {
      id: 'LOG003',
      logId: 'LOG003',
      tenantName: 'InsuranceMax Corp.',
      tenantId: 'TENANT003',
      userEmail: 'manager@insurancemax.com',
      userType: 'Admin',
      actionPerformed: 'User Management',
      actionDetails: 'Created new user account for john.doe@insurancemax.com',
      timestamp: '2024-01-15T12:20:00Z',
      ipAddress: '192.168.1.102',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_ghi789',
      resourceAffected: 'john.doe@insurancemax.com',
      severity: 'Low'
    },
    {
      id: 'LOG004',
      logId: 'LOG004',
      tenantName: 'SecureLife Insurance',
      tenantId: 'TENANT004',
      userEmail: 'admin@securelife.com',
      userType: 'Admin',
      actionPerformed: 'Document Processing',
      actionDetails: 'Processed claim document: claim_form_2024.pdf',
      timestamp: '2024-01-15T11:15:00Z',
      ipAddress: '192.168.1.103',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'sess_jkl012',
      resourceAffected: 'claim_form_2024.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG005',
      logId: 'LOG005',
      tenantName: 'GlobalInsure Ltd.',
      tenantId: 'TENANT005',
      userEmail: 'user@globalinsure.com',
      userType: 'User',
      actionPerformed: 'Data Export',
      actionDetails: 'Exported customer data to CSV format',
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.104',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_mno345',
      resourceAffected: 'customer_data.csv',
      severity: 'Medium'
    },
    {
      id: 'LOG006',
      logId: 'LOG006',
      tenantName: 'TechCorp Inc.',
      tenantId: 'TENANT001',
      userEmail: 'user@techcorp.com',
      userType: 'User',
      actionPerformed: 'Document Access',
      actionDetails: 'Accessed confidential document: financial_report_2024.pdf',
      timestamp: '2024-01-15T09:45:00Z',
      ipAddress: '192.168.1.105',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_pqr678',
      resourceAffected: 'financial_report_2024.pdf',
      severity: 'High'
    },
    {
      id: 'LOG007',
      logId: 'LOG007',
      tenantName: 'AutoCare Insurance',
      tenantId: 'TENANT006',
      userEmail: 'admin@autocare.com',
      userType: 'Admin',
      actionPerformed: 'Policy Update',
      actionDetails: 'Updated auto insurance policy terms and conditions',
      timestamp: '2024-01-15T08:30:00Z',
      ipAddress: '192.168.1.106',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_stu901',
      resourceAffected: 'auto_policy_terms.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG008',
      logId: 'LOG008',
      tenantName: 'HealthPlus Ltd.',
      tenantId: 'TENANT002',
      userEmail: 'doctor@healthplus.com',
      userType: 'User',
      actionPerformed: 'Medical Record Access',
      actionDetails: 'Accessed patient medical records for claim verification',
      timestamp: '2024-01-15T07:15:00Z',
      ipAddress: '192.168.1.107',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_vwx234',
      resourceAffected: 'patient_records_001.pdf',
      severity: 'High'
    },
    {
      id: 'LOG009',
      logId: 'LOG009',
      tenantName: 'InsuranceMax Corp.',
      tenantId: 'TENANT003',
      userEmail: 'user@insurancemax.com',
      userType: 'User',
      actionPerformed: 'Claim Submission',
      actionDetails: 'Submitted new home insurance claim for water damage',
      timestamp: '2024-01-14T23:45:00Z',
      ipAddress: '192.168.1.108',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'sess_yzab567',
      resourceAffected: 'claim_home_water_damage.pdf',
      severity: 'Medium'
    },
    {
      id: 'LOG010',
      logId: 'LOG010',
      tenantName: 'SecureLife Insurance',
      tenantId: 'TENANT004',
      userEmail: 'analyst@securelife.com',
      userType: 'User',
      actionPerformed: 'Risk Assessment',
      actionDetails: 'Performed risk assessment for new life insurance applicant',
      timestamp: '2024-01-14T22:30:00Z',
      ipAddress: '192.168.1.109',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_cdef890',
      resourceAffected: 'risk_assessment_report.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG011',
      logId: 'LOG011',
      tenantName: 'GlobalInsure Ltd.',
      tenantId: 'TENANT005',
      userEmail: 'admin@globalinsure.com',
      userType: 'Admin',
      actionPerformed: 'System Configuration',
      actionDetails: 'Updated email notification settings for policy renewals',
      timestamp: '2024-01-14T21:00:00Z',
      ipAddress: '192.168.1.110',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_ghij123',
      resourceAffected: 'email_config.json',
      severity: 'Low'
    },
    {
      id: 'LOG012',
      logId: 'LOG012',
      tenantName: 'PetCare Insurance',
      tenantId: 'TENANT007',
      userEmail: 'vet@petcare.com',
      userType: 'User',
      actionPerformed: 'Veterinary Report Upload',
      actionDetails: 'Uploaded veterinary examination report for pet insurance claim',
      timestamp: '2024-01-14T19:45:00Z',
      ipAddress: '192.168.1.111',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'sess_klmn456',
      resourceAffected: 'vet_report_2024_001.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG013',
      logId: 'LOG013',
      tenantName: 'TechCorp Inc.',
      tenantId: 'TENANT001',
      userEmail: 'security@techcorp.com',
      userType: 'Admin',
      actionPerformed: 'Security Audit',
      actionDetails: 'Conducted monthly security audit and vulnerability assessment',
      timestamp: '2024-01-14T18:20:00Z',
      ipAddress: '192.168.1.112',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_opqr789',
      resourceAffected: 'security_audit_report.pdf',
      severity: 'High'
    },
    {
      id: 'LOG014',
      logId: 'LOG014',
      tenantName: 'HomeProtect Insurance',
      tenantId: 'TENANT008',
      userEmail: 'agent@homeprotect.com',
      userType: 'User',
      actionPerformed: 'Policy Renewal',
      actionDetails: 'Processed automatic renewal for home insurance policy',
      timestamp: '2024-01-14T17:05:00Z',
      ipAddress: '192.168.1.113',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_stuv012',
      resourceAffected: 'policy_renewal_HP2024001.pdf',
      severity: 'Low'
    },
    {
      id: 'LOG015',
      logId: 'LOG015',
      tenantName: 'AutoCare Insurance',
      tenantId: 'TENANT006',
      userEmail: 'user@autocare.com',
      userType: 'User',
      actionPerformed: 'Login Attempt',
      actionDetails: 'Failed login attempt - Account temporarily locked',
      timestamp: '2024-01-14T16:30:00Z',
      ipAddress: '192.168.1.114',
      status: 'Failed',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'sess_wxyz345',
      resourceAffected: null,
      severity: 'Medium'
    },
    {
      id: 'LOG016',
      logId: 'LOG016',
      tenantName: 'HealthPlus Ltd.',
      tenantId: 'TENANT002',
      userEmail: 'admin@healthplus.com',
      userType: 'Admin',
      actionPerformed: 'Database Backup',
      actionDetails: 'Initiated daily database backup process',
      timestamp: '2024-01-14T15:00:00Z',
      ipAddress: '192.168.1.115',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_abcd678',
      resourceAffected: 'database_backup_20240114.sql',
      severity: 'Low'
    },
    {
      id: 'LOG017',
      logId: 'LOG017',
      tenantName: 'TravelSafe Insurance',
      tenantId: 'TENANT009',
      userEmail: 'claims@travelsafe.com',
      userType: 'User',
      actionPerformed: 'Travel Claim Processing',
      actionDetails: 'Processed travel insurance claim for flight cancellation',
      timestamp: '2024-01-14T14:15:00Z',
      ipAddress: '192.168.1.116',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_efgh901',
      resourceAffected: 'travel_claim_TC2024001.pdf',
      severity: 'Medium'
    },
    {
      id: 'LOG018',
      logId: 'LOG018',
      tenantName: 'InsuranceMax Corp.',
      tenantId: 'TENANT003',
      userEmail: 'support@insurancemax.com',
      userType: 'User',
      actionPerformed: 'Customer Support',
      actionDetails: 'Resolved customer inquiry about policy coverage details',
      timestamp: '2024-01-14T13:30:00Z',
      ipAddress: '192.168.1.117',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      sessionId: 'sess_ijkl234',
      resourceAffected: 'support_ticket_12345.txt',
      severity: 'Low'
    },
    {
      id: 'LOG019',
      logId: 'LOG019',
      tenantName: 'SecureLife Insurance',
      tenantId: 'TENANT004',
      userEmail: 'underwriter@securelife.com',
      userType: 'User',
      actionPerformed: 'Policy Underwriting',
      actionDetails: 'Completed underwriting review for high-value life insurance policy',
      timestamp: '2024-01-14T12:45:00Z',
      ipAddress: '192.168.1.118',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_mnop567',
      resourceAffected: 'underwriting_report_SL2024001.pdf',
      severity: 'High'
    },
    {
      id: 'LOG020',
      logId: 'LOG020',
      tenantName: 'GlobalInsure Ltd.',
      tenantId: 'TENANT005',
      userEmail: 'finance@globalinsure.com',
      userType: 'Admin',
      actionPerformed: 'Financial Report Generation',
      actionDetails: 'Generated quarterly financial report for regulatory compliance',
      timestamp: '2024-01-14T11:30:00Z',
      ipAddress: '192.168.1.119',
      status: 'Success',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_qrst890',
      resourceAffected: 'financial_report_q4_2023.pdf',
      severity: 'Medium'
    }
  ];

  // Apply filters
  let filteredLogs = mockLogs;

  if (params.tenantName) {
    filteredLogs = filteredLogs.filter(log => 
      log.tenantName.toLowerCase().includes(params.tenantName.toLowerCase())
    );
  }

  if (params.userEmail) {
    filteredLogs = filteredLogs.filter(log => 
      log.userEmail.toLowerCase().includes(params.userEmail.toLowerCase())
    );
  }

  if (params.actionPerformed) {
    filteredLogs = filteredLogs.filter(log => 
      log.actionPerformed.toLowerCase().includes(params.actionPerformed.toLowerCase())
    );
  }

  if (params.dateRange?.start && params.dateRange?.end) {
    const startDate = new Date(params.dateRange.start);
    const endDate = new Date(params.dateRange.end);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // Apply sorting
  if (params.sortBy) {
    filteredLogs.sort((a, b) => {
      let aValue = a[params.sortBy];
      let bValue = b[params.sortBy];

      if (params.sortBy === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (params.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }

  // Apply pagination
  const total = filteredLogs.length;
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const totalPages = Math.ceil(total / params.limit);
  
  const result = {
    data: {
      logs: paginatedLogs,
      total: total,
      page: parseInt(params.page) || 1,
      limit: parseInt(params.limit) || 10,
      totalPages: totalPages
    }
  };
  
  console.log('Mock API response with pagination:', result);
  console.log('Pagination details:', {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    logsCount: paginatedLogs.length
  });
  return Promise.resolve(result);
};

const exportActivityLogsApi = (params) => {
  // Mock export - replace with real API endpoint when backend is ready
  return Promise.resolve({
    data: {
      downloadUrl: '/api/activity-logs/export/activity_logs_export.csv',
      filename: 'activity_logs_export.csv'
    }
  });
};

// Saga workers
function* fetchActivityLogsSaga(action) {
  try {
    const state = yield select();
    const { filters, pagination, sortBy, sortOrder } = state.activityLog;
    
    // Merge current state with any new params from action payload
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      sortBy,
      sortOrder,
      ...(action.payload || {})
    };

    const response = yield call(fetchActivityLogsApi, params);
    yield put(fetchActivityLogsSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch activity logs';
    yield put(fetchActivityLogsFailure(errorMessage));
  }
}

function* exportActivityLogsSaga(action) {
  try {
    const state = yield select();
    const { filters, sortBy, sortOrder } = state.activityLog;
    
    const params = {
      ...filters,
      sortBy,
      sortOrder,
      exportAll: true,
      ...action.payload
    };

    const response = yield call(exportActivityLogsApi, params);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = response.data.downloadUrl;
    link.download = response.data.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    yield put(exportActivityLogsSuccess());
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to export activity logs';
    yield put(exportActivityLogsFailure(errorMessage));
  }
}

// Root saga
export default function* activityLogSaga() {
  yield takeLatest(fetchActivityLogsRequest.type, fetchActivityLogsSaga);
  yield takeLatest(exportActivityLogsRequest.type, exportActivityLogsSaga);
}
