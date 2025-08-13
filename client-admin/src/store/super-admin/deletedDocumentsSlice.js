
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
    pageSize: 25
  },
  totalCount: 0,
  exportLoading: false,
  actionLoading: false
};

const deletedDocumentsSlice = createSlice({
  name: 'deletedDocuments',
  initialState,
  reducers: {
    // Fetch deleted documents
    fetchDeletedDocumentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDeletedDocumentsSuccess: (state, action) => {
      state.loading = false;
      state.deletedDocuments = action.payload.documents;
      state.totalCount = action.payload.totalCount;
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
  fetchDeletedDocumentsStart,
  fetchDeletedDocumentsSuccess,
  fetchDeletedDocumentsFailure,
  exportDeletedDocumentsStart,
  exportDeletedDocumentsSuccess,
  exportDeletedDocumentsFailure,
  documentActionStart,
  documentActionSuccess,
  documentActionFailure,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
  setDocumentViewError
} = deletedDocumentsSlice.actions;

// Action creators for saga
export const fetchDeletedDocuments = (payload) => ({ type: 'FETCH_DELETED_DOCUMENTS_REQUEST', payload });
export const exportDeletedDocuments = (payload) => ({ type: 'EXPORT_DELETED_DOCUMENTS_REQUEST', payload });
export const recoverDocument = (documentId) => ({ type: 'RECOVER_DOCUMENT_REQUEST', payload: { documentId } });
export const permanentlyDeleteDocument = (documentId) => ({ type: 'PERMANENTLY_DELETE_DOCUMENT_REQUEST', payload: { documentId } });

export default deletedDocumentsSlice.reducer;
