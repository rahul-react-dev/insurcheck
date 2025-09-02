import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deletedDocuments: [],
  loading: false,
  error: null,
  filters: {
    searchTerm: '',
    deletedBy: '',
    originalOwner: '',
    dateRange: '',
    documentType: '',
    sortBy: 'deletedAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  },
  totalCount: 0,
  appliedFilters: {},
  exportLoading: false,
  actionLoading: {}
};

const deletedDocumentsSlice = createSlice({
  name: 'deletedDocuments',
  initialState,
  reducers: {
    // Fetch deleted documents
    fetchDeletedDocumentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDeletedDocumentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDeletedDocumentsSuccess: (state, action) => {
      state.loading = false;
      state.deletedDocuments = action.payload.documents;
      state.totalCount = action.payload.totalCount;

      // Update pagination metadata if provided
      if (action.payload.pagination) {
        state.pagination = {
          ...state.pagination,
          page: action.payload.pagination.currentPage,
          pageSize: action.payload.pagination.pageSize,
          totalPages: action.payload.pagination.totalPages,
          hasNextPage: action.payload.pagination.hasNextPage,
          hasPreviousPage: action.payload.pagination.hasPreviousPage
        };
      }

      // Update applied filters if provided
      if (action.payload.appliedFilters) {
        state.appliedFilters = action.payload.appliedFilters;
      }

      state.error = null;
    },
    fetchDeletedDocumentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Export documents
    exportDeletedDocumentsStart: (state) => {
      state.exportLoading = true;
      state.error = null;
    },
    exportDeletedDocumentsSuccess: (state, action) => {
      state.exportLoading = false;
      state.error = null;
      // Show success message or handle file download
    },
    exportDeletedDocumentsFailure: (state, action) => {
      state.exportLoading = false;
      state.error = action.payload;
    },

    // Document actions (recover, delete)
    documentActionStart: (state) => {
      state.actionLoading = true;
      state.error = null;
    },
    documentActionSuccess: (state, action) => {
      state.actionLoading = false;
      state.error = null;
      // Remove the document from the list if it was recovered or permanently deleted
      if (action.payload.action === 'recover' || action.payload.action === 'delete') {
        state.deletedDocuments = state.deletedDocuments.filter(
          doc => doc.id !== action.payload.documentId
        );
        state.totalCount -= 1;
      }
    },
    documentActionFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // Restore document
    restoreDocumentRequest: (state, action) => {
      const documentId = action.payload;
      state.actionLoading[`recover_${documentId}`] = true;
      state.error = null;
    },
    restoreDocumentSuccess: (state, action) => {
      const { documentId } = action.payload;
      state.actionLoading[`recover_${documentId}`] = false;
      state.deletedDocuments = state.deletedDocuments.filter(doc => doc.id !== documentId);
      state.totalCount -= 1;
      state.error = null;
    },
    restoreDocumentFailure: (state, action) => {
      const documentId = action.payload.documentId;
      state.actionLoading[`recover_${documentId}`] = false;
      state.error = action.payload.error;
    },

    // Permanently delete document
    permanentlyDeleteDocumentRequest: (state, action) => {
      const documentId = action.payload;
      state.actionLoading[`delete_${documentId}`] = true;
      state.error = null;
    },
    permanentlyDeleteDocumentSuccess: (state, action) => {
      const documentId = action.payload;
      state.actionLoading[`delete_${documentId}`] = false;
      state.deletedDocuments = state.deletedDocuments.filter(doc => doc.id !== documentId);
      state.totalCount -= 1;
      state.error = null;
    },
    permanentlyDeleteDocumentFailure: (state, action) => {
      const documentId = action.payload.documentId;
      state.actionLoading[`delete_${documentId}`] = false;
      state.error = action.payload.error;
    },

    // Bulk restore documents
    bulkRestoreDocumentsRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },
    bulkRestoreDocumentsSuccess: (state, action) => {
      state.actionLoading = false;
      const documentIds = action.payload;
      state.deletedDocuments = state.deletedDocuments.filter(
        doc => !documentIds.includes(doc.id)
      );
      state.totalCount -= documentIds.length;
      state.error = null;
    },
    bulkRestoreDocumentsFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // Bulk delete documents
    bulkDeleteDocumentsRequest: (state) => {
      state.actionLoading = true;
      state.error = null;
    },
    bulkDeleteDocumentsSuccess: (state, action) => {
      state.actionLoading = false;
      const documentIds = action.payload;
      state.deletedDocuments = state.deletedDocuments.filter(
        doc => !documentIds.includes(doc.id)
      );
      state.totalCount -= documentIds.length;
      state.error = null;
    },
    bulkDeleteDocumentsFailure: (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    },

    // Fetch deleted document details
    fetchDeletedDocumentDetailsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDeletedDocumentDetailsSuccess: (state, action) => {
      state.isLoading = false;
      state.selectedDocument = action.payload;
      state.error = null;
    },
    fetchDeletedDocumentDetailsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.restoreError = null;
      state.permanentDeleteError = null;
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Document view error
    setDocumentViewError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  fetchDeletedDocumentsRequest,
  fetchDeletedDocumentsStart,
  fetchDeletedDocumentsSuccess,
  fetchDeletedDocumentsFailure,
  fetchDeletedDocumentDetailsRequest,
  fetchDeletedDocumentDetailsSuccess,
  fetchDeletedDocumentDetailsFailure,
  restoreDocumentRequest,
  restoreDocumentSuccess,
  restoreDocumentFailure,
  permanentlyDeleteDocumentRequest,
  permanentlyDeleteDocumentSuccess,
  permanentlyDeleteDocumentFailure,
  bulkRestoreDocumentsRequest,
  bulkRestoreDocumentsSuccess,
  bulkRestoreDocumentsFailure,
  bulkDeleteDocumentsRequest,
  bulkDeleteDocumentsSuccess,
  bulkDeleteDocumentsFailure,
  documentActionStart,
  documentActionSuccess,
  documentActionFailure,
  exportDeletedDocumentsStart,
  exportDeletedDocumentsSuccess,
  exportDeletedDocumentsFailure,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
  clearErrors,
  setDocumentViewError
} = deletedDocumentsSlice.actions;

// Action creators for saga
export const fetchDeletedDocuments = (payload) => ({ type: 'FETCH_DELETED_DOCUMENTS_REQUEST', payload });
export const exportDeletedDocuments = (payload) => ({ type: 'EXPORT_DELETED_DOCUMENTS_REQUEST', payload });
export const recoverDocument = (documentId) => ({ type: 'RECOVER_DOCUMENT_REQUEST', payload: { documentId } });
export const permanentlyDeleteDocument = (documentId) => ({ type: 'PERMANENTLY_DELETE_DOCUMENT_REQUEST', payload: { documentId } });

// Additional action creators for S3 operations
export const viewDocumentRequest = (documentId) => ({
  type: 'VIEW_DOCUMENT_REQUEST',
  payload: { documentId }
});

export const downloadDocumentRequest = (documentId) => ({
  type: 'DOWNLOAD_DOCUMENT_REQUEST',
  payload: { documentId }
});

export default deletedDocumentsSlice.reducer;