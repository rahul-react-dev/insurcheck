
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import ConfigurationSection from '../../components/super-admin/ConfigurationSection';
import ConfigurationToggle from '../../components/super-admin/ConfigurationToggle';
import ConfigurationSelect from '../../components/super-admin/ConfigurationSelect';
import AuditLogModal from '../../components/super-admin/AuditLogModal';
import {
  fetchSystemConfigRequest,
  updateSystemConfigRequest,
  resetConfigurationState,
  clearConfigurationErrors
} from '../../store/super-admin/systemConfigSlice';

const SystemConfiguration = () => {
  const dispatch = useDispatch();
  
  const {
    configuration,
    isLoading,
    isUpdating,
    error,
    updateSuccess,
    auditLogs
  } = useSelector(state => state.systemConfig);

  const [formData, setFormData] = useState({
    // Security Settings
    twoFactorAuth: {
      emailEnabled: false,
      smsEnabled: false
    },
    
    // File & Storage Settings
    maxFileSize: 10, // MB
    maxUsersPerTenant: 50,
    maxDocumentsPerTenant: 1000,
    
    // Email & Communication Settings
    emailRetryLimits: 3,
    
    // Backup & Maintenance Settings
    backupFrequency: 'Daily',
    autoDeleteInterval: 60, // days
    
    // Feature Toggles
    featureToggles: {
      trialExtensions: true,
      autoInvoicing: true,
      documentVersioning: false,
      advancedAnalytics: false,
      apiAccess: true
    }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(fetchSystemConfigRequest());
    
    return () => {
      dispatch(resetConfigurationState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (configuration) {
      setFormData(configuration);
      setHasUnsavedChanges(false);
    }
  }, [configuration]);

  useEffect(() => {
    if (updateSuccess) {
      setHasUnsavedChanges(false);
      setValidationErrors({});
      
      // Show success message for 3 seconds
      setTimeout(() => {
        dispatch(clearConfigurationErrors());
      }, 3000);
    }
  }, [updateSuccess, dispatch]);

  const handleInputChange = (path, value) => {
    const pathArray = path.split('.');
    const newFormData = { ...formData };
    
    // Navigate to nested object
    let current = newFormData;
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    
    setFormData(newFormData);
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    if (validationErrors[path]) {
      const newErrors = { ...validationErrors };
      delete newErrors[path];
      setValidationErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Max File Size validation
    if (!formData.maxFileSize || formData.maxFileSize <= 0) {
      errors.maxFileSize = 'Max File Size must be a positive number.';
    }
    
    // Max Users per Tenant validation
    if (!formData.maxUsersPerTenant || formData.maxUsersPerTenant <= 0 || !Number.isInteger(formData.maxUsersPerTenant)) {
      errors.maxUsersPerTenant = 'Max Users per Tenant must be a positive integer.';
    }
    
    // Max Documents per Tenant validation
    if (!formData.maxDocumentsPerTenant || formData.maxDocumentsPerTenant <= 0 || !Number.isInteger(formData.maxDocumentsPerTenant)) {
      errors.maxDocumentsPerTenant = 'Max Documents per Tenant must be a positive integer.';
    }
    
    // Email Retry Limits validation
    if (!formData.emailRetryLimits || formData.emailRetryLimits <= 0 || !Number.isInteger(formData.emailRetryLimits)) {
      errors.emailRetryLimits = 'Email Retry Limits must be a positive integer.';
    }
    
    // Auto-Delete Interval validation
    if (!formData.autoDeleteInterval || formData.autoDeleteInterval <= 0 || !Number.isInteger(formData.autoDeleteInterval)) {
      errors.autoDeleteInterval = 'Auto-Delete Interval must be a positive integer.';
    }
    
    // Backup Frequency validation
    const validFrequencies = ['Daily', 'Weekly', 'Monthly'];
    if (!validFrequencies.includes(formData.backupFrequency)) {
      errors.backupFrequency = 'Please select a valid Backup Frequency.';
    }
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    dispatch(updateSystemConfigRequest(formData));
  };

  const handleCancel = () => {
    if (configuration) {
      setFormData(configuration);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      dispatch(clearConfigurationErrors());
    }
  };

  const backupFrequencyOptions = [
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">System Configuration</h1>
            <p className="text-purple-100 text-sm sm:text-lg">Configure system-wide settings and policies</p>
            <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Configuration Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock"></i>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-cogs text-4xl text-white opacity-80"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {updateSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="fas fa-check-circle text-green-400 mt-0.5"></i>
            <div>
              <h3 className="text-green-800 font-medium">Success</h3>
              <p className="text-green-700 text-sm">Settings updated successfully.</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1">
              <i className="fas fa-exclamation-triangle text-red-400 mt-0.5"></i>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearConfigurationErrors())}
              className="text-red-400 hover:text-red-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isUpdating}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
        >
          <i className="fas fa-save mr-2"></i>
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={!hasUnsavedChanges || isUpdating}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
        >
          <i className="fas fa-times mr-2"></i>
          Cancel Changes
        </Button>
        <Button
          onClick={() => setShowAuditModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
        >
          <i className="fas fa-history mr-2"></i>
          View Audit Logs
        </Button>
      </div>

      {isLoading ? (
        /* Loading State */
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Configuration Sections */
        <div className="space-y-6">
          {/* Security Settings */}
          <ConfigurationSection
            title="Security Settings"
            description="Configure authentication and security features"
            icon="fas fa-shield-alt"
            iconColor="text-green-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigurationToggle
                label="Email 2FA Authentication"
                description="Enable two-factor authentication via email"
                checked={formData.twoFactorAuth?.emailEnabled || false}
                onChange={(checked) => handleInputChange('twoFactorAuth.emailEnabled', checked)}
              />
              <ConfigurationToggle
                label="SMS 2FA Authentication"
                description="Enable two-factor authentication via SMS"
                checked={formData.twoFactorAuth?.smsEnabled || false}
                onChange={(checked) => handleInputChange('twoFactorAuth.smsEnabled', checked)}
              />
            </div>
          </ConfigurationSection>

          {/* File & Storage Settings */}
          <ConfigurationSection
            title="File & Storage Settings"
            description="Configure file upload and storage limitations"
            icon="fas fa-database"
            iconColor="text-blue-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Max File Size (MB)"
                type="number"
                min="1"
                value={formData.maxFileSize || ''}
                onChange={(e) => handleInputChange('maxFileSize', parseFloat(e.target.value) || 0)}
                error={validationErrors.maxFileSize}
                placeholder="10"
                required
              />
              <Input
                label="Max Users per Tenant"
                type="number"
                min="1"
                value={formData.maxUsersPerTenant || ''}
                onChange={(e) => handleInputChange('maxUsersPerTenant', parseInt(e.target.value) || 0)}
                error={validationErrors.maxUsersPerTenant}
                placeholder="50"
                required
              />
              <Input
                label="Max Documents per Tenant"
                type="number"
                min="1"
                value={formData.maxDocumentsPerTenant || ''}
                onChange={(e) => handleInputChange('maxDocumentsPerTenant', parseInt(e.target.value) || 0)}
                error={validationErrors.maxDocumentsPerTenant}
                placeholder="1000"
                required
              />
            </div>
          </ConfigurationSection>

          {/* Communication Settings */}
          <ConfigurationSection
            title="Email & Communication Settings"
            description="Configure email and communication parameters"
            icon="fas fa-envelope"
            iconColor="text-purple-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email Retry Limits"
                type="number"
                min="1"
                value={formData.emailRetryLimits || ''}
                onChange={(e) => handleInputChange('emailRetryLimits', parseInt(e.target.value) || 0)}
                error={validationErrors.emailRetryLimits}
                placeholder="3"
                required
              />
            </div>
          </ConfigurationSection>

          {/* Backup & Maintenance Settings */}
          <ConfigurationSection
            title="Backup & Maintenance Settings"
            description="Configure backup frequency and document retention policies"
            icon="fas fa-server"
            iconColor="text-orange-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigurationSelect
                label="Backup Frequency"
                value={formData.backupFrequency || ''}
                onChange={(value) => handleInputChange('backupFrequency', value)}
                options={backupFrequencyOptions}
                error={validationErrors.backupFrequency}
                required
              />
              <Input
                label="Auto-Delete Interval (Days)"
                type="number"
                min="1"
                value={formData.autoDeleteInterval || ''}
                onChange={(e) => handleInputChange('autoDeleteInterval', parseInt(e.target.value) || 0)}
                error={validationErrors.autoDeleteInterval}
                placeholder="60"
                required
                helperText="Documents will be permanently deleted after this many days"
              />
            </div>
          </ConfigurationSection>

          {/* Feature Toggles */}
          <ConfigurationSection
            title="Feature Toggles"
            description="Enable or disable platform features"
            icon="fas fa-toggle-on"
            iconColor="text-indigo-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ConfigurationToggle
                label="Trial Extensions"
                description="Allow extending trial periods for tenants"
                checked={formData.featureToggles?.trialExtensions || false}
                onChange={(checked) => handleInputChange('featureToggles.trialExtensions', checked)}
              />
              <ConfigurationToggle
                label="Auto Invoicing"
                description="Automatically generate and send invoices"
                checked={formData.featureToggles?.autoInvoicing || false}
                onChange={(checked) => handleInputChange('featureToggles.autoInvoicing', checked)}
              />
              <ConfigurationToggle
                label="Document Versioning"
                description="Enable document version control"
                checked={formData.featureToggles?.documentVersioning || false}
                onChange={(checked) => handleInputChange('featureToggles.documentVersioning', checked)}
              />
              <ConfigurationToggle
                label="Advanced Analytics"
                description="Enable advanced analytics and reporting"
                checked={formData.featureToggles?.advancedAnalytics || false}
                onChange={(checked) => handleInputChange('featureToggles.advancedAnalytics', checked)}
              />
              <ConfigurationToggle
                label="API Access"
                description="Allow API access for third-party integrations"
                checked={formData.featureToggles?.apiAccess || false}
                onChange={(checked) => handleInputChange('featureToggles.apiAccess', checked)}
              />
            </div>
          </ConfigurationSection>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <i className="fas fa-exclamation-triangle text-yellow-400 mt-0.5"></i>
            <div>
              <h4 className="text-yellow-800 font-medium text-sm">Unsaved Changes</h4>
              <p className="text-yellow-700 text-xs mt-1">You have unsaved changes. Don't forget to save!</p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditModal && (
        <AuditLogModal
          isOpen={showAuditModal}
          onClose={() => setShowAuditModal(false)}
          logs={auditLogs}
          title="Configuration Audit Logs"
        />
      )}
    </div>
  );
};

export default SystemConfiguration;
