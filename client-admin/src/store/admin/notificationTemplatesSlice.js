import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Templates data
  templates: [],
  templatesLoading: false,
  templatesError: null,
  
  // Update template
  updateLoading: false,
  updateSuccess: false,
  updateError: null,
  
  // Preview template
  previewData: null,
  previewLoading: false,
  previewError: null,
};

const notificationTemplatesSlice = createSlice({
  name: 'notificationTemplates',
  initialState,
  reducers: {
    // Fetch templates
    fetchTemplatesRequest: (state, action) => {
      state.templatesLoading = true;
      state.templatesError = null;
    },
    fetchTemplatesSuccess: (state, action) => {
      state.templatesLoading = false;
      state.templates = action.payload.data || [];
      state.templatesError = null;
    },
    fetchTemplatesFailure: (state, action) => {
      state.templatesLoading = false;
      state.templatesError = action.payload;
    },

    // Update template
    updateTemplateRequest: (state, action) => {
      state.updateLoading = true;
      state.updateSuccess = false;
      state.updateError = null;
    },
    updateTemplateSuccess: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      state.updateError = null;
      // Update the template in the list
      const templateIndex = state.templates.findIndex(t => t.id === action.payload.id);
      if (templateIndex !== -1) {
        state.templates[templateIndex] = { ...state.templates[templateIndex], ...action.payload };
      }
    },
    updateTemplateFailure: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = false;
      state.updateError = action.payload;
    },

    // Preview template
    previewTemplateRequest: (state, action) => {
      state.previewLoading = true;
      state.previewError = null;
    },
    previewTemplateSuccess: (state, action) => {
      state.previewLoading = false;
      state.previewData = action.payload;
      state.previewError = null;
    },
    previewTemplateFailure: (state, action) => {
      state.previewLoading = false;
      state.previewError = action.payload;
    },

    // Clear states
    clearUpdateState: (state) => {
      state.updateSuccess = false;
      state.updateError = null;
    },
    clearPreviewState: (state) => {
      state.previewData = null;
      state.previewError = null;
    },
  },
});

export const {
  // Fetch templates
  fetchTemplatesRequest,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
  
  // Update template
  updateTemplateRequest,
  updateTemplateSuccess,
  updateTemplateFailure,
  
  // Preview template
  previewTemplateRequest,
  previewTemplateSuccess,
  previewTemplateFailure,
  
  // Clear states
  clearUpdateState,
  clearPreviewState,
} = notificationTemplatesSlice.actions;

export default notificationTemplatesSlice.reducer;