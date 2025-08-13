import { call, put, takeEvery, delay } from 'redux-saga/effects';
import {
  fetchDeletedDocumentsStart,
  fetchDeletedDocumentsSuccess,
  fetchDeletedDocumentsFailure,
  exportDeletedDocumentsStart,
  exportDeletedDocumentsSuccess,
  exportDeletedDocumentsFailure,
  documentActionStart,
  documentActionSuccess,
  documentActionFailure
} from './deletedDocumentsSlice';

// Mock data for deleted documents
const mockDeletedDocuments = [
  {
    id: 'DOC001',
    name: 'Insurance_Policy_2024_v1.2.pdf',
    version: '1.2',
    size: 2048576,
    deletedBy: 'admin1@tenant1.com',
    deletedAt: '2024-01-15T10:30:00Z',
    originalOwner: 'user1@tenant1.com',
    tenantName: 'Tenant Corp',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    deletionReason: 'Document outdated and replaced',
    tags: ['insurance', 'policy', '2024'],
    description: 'Annual insurance policy document for corporate coverage',
    downloadUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    viewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  },
  {
    id: 'DOC002',
    name: 'Claims_Report_Q4.xlsx',
    version: '2.1',
    size: 1024000,
    deletedBy: 'admin2@tenant2.com',
    deletedAt: '2024-01-14T14:20:00Z',
    originalOwner: 'user2@tenant2.com',
    tenantName: 'Insurance Solutions Ltd',
    createdAt: '2024-01-05T08:15:00Z',
    updatedAt: '2024-01-13T11:30:00Z',
    deletionReason: 'Duplicate file removed',
    tags: ['claims', 'report', 'Q4'],
    description: 'Quarterly claims analysis and reporting document',
    downloadUrl: 'https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_XLS_10.xls',
    viewUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_XLS_10.xls'
  },
  {
    id: 'DOC003',
    name: 'Risk_Assessment_Template.docx',
    version: '1.0',
    size: 512000,
    deletedBy: 'admin1@tenant1.com',
    deletedAt: '2024-01-13T09:45:00Z',
    originalOwner: 'user3@tenant1.com',
    tenantName: 'Tenant Corp',
    createdAt: '2023-12-20T10:00:00Z',
    updatedAt: '2024-01-12T15:20:00Z',
    deletionReason: 'Template updated with new version',
    tags: ['risk', 'assessment', 'template'],
    description: 'Standard risk assessment template for underwriting',
    downloadUrl: 'https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_DOCX_2MB.docx',
    viewUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_DOCX_2MB.docx'
  },
  {
    id: 'DOC004',
    name: 'Client_Presentation.pptx',
    version: '3.0',
    size: 4096000,
    deletedBy: 'admin2@tenant2.com',
    deletedAt: '2024-01-12T16:10:00Z',
    originalOwner: 'user1@tenant2.com',
    tenantName: 'Insurance Solutions Ltd',
    createdAt: '2023-12-15T14:30:00Z',
    updatedAt: '2024-01-11T12:00:00Z',
    deletionReason: 'Client requested removal',
    tags: ['presentation', 'client', 'marketing'],
    description: 'Marketing presentation for potential clients',
    downloadUrl: 'https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_PPTX_5MB.pptx',
    viewUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_PPTX_5MB.pptx'
  },
  {
    id: 'DOC005',
    name: 'Compliance_Checklist.pdf',
    version: '1.1',
    size: 768000,
    deletedBy: 'admin1@tenant1.com',
    deletedAt: '2024-01-11T13:25:00Z',
    originalOwner: 'user2@tenant1.com',
    tenantName: 'Tenant Corp',
    createdAt: '2023-11-30T09:45:00Z',
    updatedAt: '2024-01-10T10:15:00Z',
    deletionReason: 'Regulatory changes made checklist obsolete',
    tags: ['compliance', 'checklist', 'regulatory'],
    description: 'Internal compliance verification checklist',
    downloadUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    viewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  },
  {
    id: 'DOC006',
    name: 'Financial_Summary_2023.xlsx',
    version: '2.0',
    size: 1536000,
    deletedBy: 'admin2@tenant2.com',
    deletedAt: '2024-01-10T11:50:00Z',
    originalOwner: 'user3@tenant2.com',
    tenantName: 'Insurance Solutions Ltd',
    createdAt: '2023-12-01T08:00:00Z',
    updatedAt: '2024-01-09T17:30:00Z',
    deletionReason: 'Confidentiality concerns',
    tags: ['financial', 'summary', '2023'],
    description: 'Annual financial performance summary',
    downloadUrl: 'https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_XLS_10.xls',
    viewUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_XLS_10.xls'
  },
  {
    id: 'DOC007',
    name: 'Training_Manual_v2.pdf',
    version: '2.0',
    size: 3072000,
    deletedBy: 'admin1@tenant1.com',
    deletedAt: '2024-01-09T15:35:00Z',
    originalOwner: 'user1@tenant1.com',
    tenantName: 'Tenant Corp',
    createdAt: '2023-10-15T10:20:00Z',
    updatedAt: '2024-01-08T14:45:00Z',
    deletionReason: 'New training program implemented',
    tags: ['training', 'manual', 'HR'],
    description: 'Employee training and onboarding manual',
    downloadUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    viewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  },
  {
    id: 'DOC008',
    name: 'Customer_Feedback_Analysis.docx',
    version: '1.3',
    size: 896000,
    deletedBy: 'admin2@tenant2.com',
    deletedAt: '2024-01-08T12:15:00Z',
    originalOwner: 'user2@tenant2.com',
    tenantName: 'Insurance Solutions Ltd',
    createdAt: '2023-11-20T13:10:00Z',
    updatedAt: '2024-01-07T16:20:00Z',
    deletionReason: 'Data privacy compliance',
    tags: ['customer', 'feedback', 'analysis'],
    description: 'Quarterly customer satisfaction analysis',
    downloadUrl: 'https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_DOCX_2MB.docx',
    viewUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_DOCX_2MB.docx'
  },
  {
    id: 'DOC009',
    name: 'Product_Roadmap_2024.pptx',
    version: '1.0',
    size: 2560000,
    deletedBy: 'admin1@tenant1.com',
    deletedAt: '2024-01-07T10:40:00Z',
    originalOwner: 'user3@tenant1.com',
    tenantName: 'Tenant Corp',
    createdAt: '2023-12-10T11:30:00Z',
    updatedAt: '2024-01-06T09:15:00Z',
    deletionReason: 'Strategic direction changed',
    tags: ['product', 'roadmap', '2024'],
    description: 'Strategic product development roadmap',
    downloadUrl: 'https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_PPTX_5MB.pptx',
    viewUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/storage/fe8c8b0e4c4444aeae8b4c3/2017/10/file_example_PPTX_5MB.pptx'
  },
  {
    id: 'DOC010',
    name: 'Audit_Report_December.pdf',
    version: '1.0',
    size: 1280000,
    deletedBy: 'admin2@tenant2.com',
    deletedAt: '2024-01-06T14:55:00Z',
    originalOwner: 'user1@tenant2.com',
    tenantName: 'Insurance Solutions Ltd',
    createdAt: '2023-12-30T16:45:00Z',
    updatedAt: '2024-01-05T10:30:00Z',
    deletionReason: 'Audit completed, no longer needed',
    tags: ['audit', 'report', 'december'],
    description: 'Monthly internal audit findings and recommendations',
    downloadUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    viewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  }
];

function* fetchDeletedDocumentsSaga(action) {
  try {
    yield put(fetchDeletedDocumentsStart());
    yield delay(1000); // Simulate API call

    // Extract pagination and filter parameters
    const { 
      searchTerm = '', 
      deletedBy = '', 
      originalOwner = '', 
      dateRange = '', 
      documentType = '', 
      sortBy = 'deletedAt', 
      sortOrder = 'desc', 
      page = 1, 
      pageSize = 25 
    } = action.payload;

    // In a real implementation, these parameters would be sent to the API
    const apiParams = {
      searchTerm,
      deletedBy,
      originalOwner,
      dateRange,
      documentType,
      sortBy,
      sortOrder,
      page,
      pageSize
    };

    console.log('API Parameters:', apiParams); // For debugging

    // Simulate server-side filtering and pagination
    let filteredDocuments = mockDeletedDocuments.filter(doc => {
      const matchesSearch = !searchTerm || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.originalOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.deletedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tenantName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDeletedBy = !deletedBy || doc.deletedBy === deletedBy;
      const matchesOriginalOwner = !originalOwner || doc.originalOwner === originalOwner;
      const matchesDocumentType = !documentType || doc.name.toLowerCase().includes(documentType.toLowerCase());

      // Date range filtering (if provided)
      let matchesDateRange = true;
      if (dateRange) {
        // Expected format: "YYYY-MM-DD to YYYY-MM-DD" or specific date formats
        // For now, just check if the date range contains the deletion date
        const deletedDate = new Date(doc.deletedAt);
        // Add your date range logic here
        matchesDateRange = true;
      }

      return matchesSearch && matchesDeletedBy && matchesOriginalOwner && matchesDocumentType && matchesDateRange;
    });

    // Simulate server-side sorting
    if (sortBy && sortOrder) {
      filteredDocuments.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        // Handle different data types
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        } else if (aVal instanceof Date || typeof aVal === 'string') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
    }

    // Get total count after filtering (this would come from the API)
    const totalCount = filteredDocuments.length;

    // Simulate server-side pagination
    const offset = (page - 1) * pageSize;
    const paginatedDocuments = filteredDocuments.slice(offset, offset + pageSize);

    // Simulate API response structure
    const response = {
      data: paginatedDocuments,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page < Math.ceil(totalCount / pageSize),
        hasPreviousPage: page > 1
      },
      filters: {
        searchTerm,
        deletedBy,
        originalOwner,
        dateRange,
        documentType,
        sortBy,
        sortOrder
      }
    };

    yield put(fetchDeletedDocumentsSuccess({ 
      documents: response.data, 
      totalCount: response.pagination.totalCount,
      pagination: response.pagination,
      appliedFilters: response.filters
    }));

  } catch (error) {
    yield put(fetchDeletedDocumentsFailure('Failed to fetch deleted documents. Please try again.'));
  }
}

function* exportDeletedDocumentsSaga(action) {
  try {
    yield put(exportDeletedDocumentsStart());
    yield delay(2000); // Simulate export processing

    const { format } = action.payload;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Deleted_Documents_${timestamp}.${format}`;

    // In a real implementation, this would generate and download the file
    console.log(`Exporting deleted documents as ${format}: ${filename}`);

    // Simulate file download
    const blob = new Blob(['Mock exported data'], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    yield put(exportDeletedDocumentsSuccess({ format, filename }));
  } catch (error) {
    yield put(exportDeletedDocumentsFailure(`Failed to export ${action.payload.format}. Please try again.`));
  }
}

function* documentActionSaga(action) {
  try {
    yield put(documentActionStart());
    yield delay(1500); // Simulate API call

    const { documentId, action: actionType, documentName, documentExtension } = action.payload;
    console.log(`Performing action: ${actionType} on document: ${documentId}`);

    let message = '';
    let responseData = { documentId, action: actionType };

    switch (actionType) {
      case 'recover':
        message = 'Document has been recovered successfully.';
        break;
      case 'permanentlyDelete':
        message = 'Document has been permanently deleted.';
        break;
      case 'download':
        const document = mockDeletedDocuments.find(doc => doc.id === documentId);
        if (!document) {
          throw new Error('Document not found.');
        }
        
        const downloadUrl = document.downloadUrl;
        const fileExtension = documentName.split('.').pop(); // Extract extension from original name
        const formattedFileName = `${documentName.replace(`.${fileExtension}`, '')}_${documentId}.${fileExtension}`;
        
        // Simulate download initiation
        try {
          const response = yield call(fetch, downloadUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = yield call([response, 'blob']);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = formattedFileName;
          document.body.appendChild(link); // Append to body to ensure it works
          link.click();
          document.body.removeChild(link); // Clean up
          window.URL.revokeObjectURL(url);
          message = 'Document downloaded successfully.';
        } catch (downloadError) {
          console.error('Download failed:', downloadError);
          throw new Error('Failed to download document. Please try again.');
        }
        break;
      default:
        throw new Error('Unknown action type');
    }

    responseData.message = message;
    yield put(documentActionSuccess(responseData));
  } catch (error) {
    yield put(documentActionFailure({ 
      message: error.message || 'An unexpected error occurred.',
      action: action.payload.actionType 
    }));
  }
}


function* recoverDocumentSaga(action) {
  try {
    yield put(documentActionStart());
    yield delay(1500); // Simulate API call

    const { documentId } = action.payload;
    console.log(`Recovering document: ${documentId}`);

    // In a real implementation, this would call the API to recover the document
    yield put(documentActionSuccess({ 
      action: 'recover', 
      documentId,
      message: 'Document has been recovered successfully.' 
    }));
  } catch (error) {
    yield put(documentActionFailure('Unable to recover document. Please try again.'));
  }
}

function* permanentlyDeleteDocumentSaga(action) {
  try {
    yield put(documentActionStart());
    yield delay(1500); // Simulate API call

    const { documentId } = action.payload;
    console.log(`Permanently deleting document: ${documentId}`);

    // In a real implementation, this would call the API to permanently delete the document
    yield put(documentActionSuccess({ 
      action: 'delete', 
      documentId,
      message: 'Document has been permanently deleted.' 
    }));
  } catch (error) {
    yield put(documentActionFailure('Unable to delete document. Please try again.'));
  }
}

export default function* deletedDocumentsSaga() {
  yield takeEvery('FETCH_DELETED_DOCUMENTS_REQUEST', fetchDeletedDocumentsSaga);
  yield takeEvery('EXPORT_DELETED_DOCUMENTS_REQUEST', exportDeletedDocumentsSaga);
  yield takeEvery('DOCUMENT_ACTION_REQUEST', documentActionSaga); // Listening for general document actions
  yield takeEvery('RECOVER_DOCUMENT_REQUEST', recoverDocumentSaga); // Kept for backward compatibility or specific use cases
  yield takeEvery('PERMANENTLY_DELETE_DOCUMENT_REQUEST', permanentlyDeleteDocumentSaga); // Kept for backward compatibility or specific use cases
}