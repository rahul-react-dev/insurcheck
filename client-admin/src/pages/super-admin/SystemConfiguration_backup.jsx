
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemConfigRequest } from '../../store/super-admin/systemConfigSlice';
import SystemConfigurationFilters from '../../components/super-admin/SystemConfigurationFilters';
import SystemConfigurationTable from '../../components/super-admin/SystemConfigurationTable';
import { CardSkeleton } from '../../components/ui/SkeletonLoader';
import Toast from '../../components/ui/Toast';

const SystemConfiguration = () => {
  const dispatch = useDispatch();
  
  const {
    isLoading,
    error,
    updateSuccess,
    createSuccess
  } = useSelector(state => state.systemConfig);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    dispatch(fetchSystemConfigRequest());
  }, [dispatch]);

  // Handle toast notifications
  useEffect(() => {
    if (updateSuccess) {
      setToastMessage('System configuration updated successfully');
      setToastType('success');
      setShowToast(true);
    } else if (createSuccess) {
      setToastMessage('System configuration created successfully');
      setToastType('success');
      setShowToast(true);
    } else if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [updateSuccess, createSuccess, error]);
  }, [dispatch]);

  useEffect(() => {
    if (configurationScope === 'system-wide' && configuration) {
      // Deep copy to avoid mutation issues
      setFormData(JSON.parse(JSON.stringify(configuration)));
      setHasUnsavedChanges(false);
    } else if (configurationScope === 'tenant-specific' && selectedTenantId) {
      const tenantConfig = tenantConfigurations?.[selectedTenantId];
      if (tenantConfig) {
        // Deep copy to avoid mutation issues
        setFormData(JSON.parse(JSON.stringify(tenantConfig)));
      } else {
        // Use system-wide config as default for new tenant configurations
        setFormData({
          ...JSON.parse(JSON.stringify(configuration || {})),
          inheritFromSystem: true
        });
      }
      setHasUnsavedChanges(false);
    }
  }, [configuration, tenantConfigurations, configurationScope, selectedTenantId]);

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
    
    // Create a deep copy of formData to avoid mutations
    const newFormData = JSON.parse(JSON.stringify(formData));
    
    // Navigate to nested object and create new objects along the path
    let current = newFormData;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    // Set the final value
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
    
    if (configurationScope === 'system-wide') {
      dispatch(updateSystemConfigRequest(formData));
    } else if (configurationScope === 'tenant-specific' && selectedTenantId) {
      dispatch(updateTenantConfigRequest({ 
        tenantId: selectedTenantId, 
        configuration: formData 
      }));
    }
  };

  const handleCancel = () => {
    if (configurationScope === 'system-wide' && configuration) {
      setFormData(JSON.parse(JSON.stringify(configuration)));
    } else if (configurationScope === 'tenant-specific' && selectedTenantId) {
      const tenantConfig = tenantConfigurations?.[selectedTenantId];
      if (tenantConfig) {
        setFormData(JSON.parse(JSON.stringify(tenantConfig)));
      } else {
        setFormData({
          ...JSON.parse(JSON.stringify(configuration || {})),
          inheritFromSystem: true
        });
      }
    }
    setHasUnsavedChanges(false);
    setValidationErrors({});
    dispatch(clearConfigurationErrors());
  };

  const backupFrequencyOptions = [
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' }
  ];

  const handleScopeChange = (scope) => {
    setConfigurationScope(scope);
    setSelectedTenantId('');
    setHasUnsavedChanges(false);
    setValidationErrors({});
    dispatch(clearConfigurationErrors());
  };

  const handleTenantSelect = (tenantId) => {
    setSelectedTenantId(tenantId);
    setHasUnsavedChanges(false);
    setValidationErrors({});
    dispatch(clearConfigurationErrors());
    
    if (tenantId) {
      dispatch(fetchTenantConfigRequest(tenantId));
    }
  };

  const filteredTenants = availableTenants?.filter(tenant =>
    tenant.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
    tenant.id.toLowerCase().includes(tenantSearchTerm.toLowerCase())
  ) || [];

  const selectedTenant = availableTenants?.find(tenant => tenant.id === selectedTenantId);
  
  const getTenantConfigStatus = (tenantId) => {
    return tenantConfigurations?.[tenantId] ? 'Custom' : 'Inherited';
  };

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

      {/* Configuration Scope Selector */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-globe text-blue-600"></i>
              <h3 className="text-lg font-semibold text-gray-900">Configuration Scope</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System-wide Option */}
            <div
              onClick={() => handleScopeChange('system-wide')}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${configurationScope === 'system-wide'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5
                  ${configurationScope === 'system-wide' ? 'border-blue-500' : 'border-gray-300'}
                `}>
                  {configurationScope === 'system-wide' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">System-Wide Configuration</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Apply settings globally to all tenants as default values
                  </p>
                </div>
              </div>
            </div>

            {/* Tenant-specific Option */}
            <div
              onClick={() => handleScopeChange('tenant-specific')}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${configurationScope === 'tenant-specific'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5
                  ${configurationScope === 'tenant-specific' ? 'border-blue-500' : 'border-gray-300'}
                `}>
                  {configurationScope === 'tenant-specific' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Tenant-Specific Configuration</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Override system settings for individual tenants
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Selection */}
          {configurationScope === 'tenant-specific' && (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <Input
                      placeholder="Search tenants..."
                      value={tenantSearchTerm}
                      onChange={(e) => setTenantSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {selectedTenant && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">Selected:</span>
                      <span className="font-medium text-blue-600">{selectedTenant.name}</span>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${getTenantConfigStatus(selectedTenantId) === 'Custom'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                        }
                      `}>
                        {getTenantConfigStatus(selectedTenantId)}
                      </span>
                    </div>
                  )}
                </div>

                {filteredTenants.length > 0 && (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredTenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        onClick={() => handleTenantSelect(tenant.id)}
                        className={`
                          p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors
                          ${selectedTenantId === tenant.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{tenant.name}</h4>
                            <p className="text-sm text-gray-600">{tenant.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${getTenantConfigStatus(tenant.id) === 'Custom'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                              }
                            `}>
                              {getTenantConfigStatus(tenant.id)}
                            </span>
                            {selectedTenantId === tenant.id && (
                              <i className="fas fa-check text-blue-500"></i>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredTenants.length === 0 && tenantSearchTerm && (
                  <div className="text-center py-4 text-gray-500">
                    <i className="fas fa-search text-2xl mb-2"></i>
                    <p>No tenants found matching "{tenantSearchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Configuration Status Banner */}
      {configurationScope === 'tenant-specific' && selectedTenant && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">
                Configuring: {selectedTenant.name}
              </h4>
              <p className="text-blue-700 text-sm mt-1">
                {getTenantConfigStatus(selectedTenantId) === 'Custom' 
                  ? 'This tenant has custom configuration settings that override system defaults.'
                  : 'This tenant is currently using system-wide configuration. Any changes will create tenant-specific overrides.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isUpdating || (configurationScope === 'tenant-specific' && !selectedTenantId)}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-3 text-sm sm:text-base"
        >
          <i className="fas fa-save mr-2"></i>
          {isUpdating 
            ? 'Saving...' 
            : configurationScope === 'system-wide' 
              ? 'Save System-Wide Changes'
              : 'Save Tenant Configuration'
          }
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

      {isLoading || (configurationScope === 'tenant-specific' && !selectedTenantId) ? (
        /* Loading State or No Tenant Selected */
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <i className="fas fa-building text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Tenant</h3>
              <p className="text-gray-600">
                Choose a tenant from the list above to configure their specific settings.
              </p>
            </Card>
          )}
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
            <div className="space-y-8">
              {/* Authentication Methods */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-key text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Enhance account security with multi-factor authentication</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <ConfigurationToggle
                      label="Email 2FA Authentication"
                      description="Enable two-factor authentication via email verification codes"
                      checked={formData.twoFactorAuth?.emailEnabled || false}
                      onChange={(checked) => handleInputChange('twoFactorAuth.emailEnabled', checked)}
                    />
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <ConfigurationToggle
                      label="SMS 2FA Authentication"
                      description="Enable two-factor authentication via SMS verification codes"
                      checked={formData.twoFactorAuth?.smsEnabled || false}
                      onChange={(checked) => handleInputChange('twoFactorAuth.smsEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Security Summary */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-shield-check text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
                      <p className="text-sm text-gray-600">Current security configuration overview</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.values(formData.twoFactorAuth || {}).filter(Boolean).length}/2
                    </div>
                    <div className="text-sm text-gray-500">2FA Methods Active</div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'emailEnabled', label: 'Email 2FA', icon: 'fas fa-envelope' },
                    { key: 'smsEnabled', label: 'SMS 2FA', icon: 'fas fa-mobile-alt' }
                  ].map((method) => (
                    <div
                      key={method.key}
                      className={`
                        p-4 rounded-lg border text-center transition-all
                        ${formData.twoFactorAuth?.[method.key]
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-red-100 border-red-300 text-red-800'
                        }
                      `}
                    >
                      <i className={`${method.icon} text-lg mb-2`}></i>
                      <div className="text-sm font-medium">{method.label}</div>
                      <div className="text-xs">
                        {formData.twoFactorAuth?.[method.key] ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security Recommendations */}
                {Object.values(formData.twoFactorAuth || {}).filter(Boolean).length < 2 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-lightbulb text-yellow-500 mt-0.5"></i>
                      <div>
                        <h4 className="text-yellow-800 font-medium text-sm">Security Recommendation</h4>
                        <p className="text-yellow-700 text-xs mt-1">
                          Enable both Email and SMS 2FA for maximum security across your platform.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
            <div className="space-y-8">
              {/* Core Features */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-star text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Core Features</h3>
                    <p className="text-sm text-gray-600">Essential platform functionality</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <ConfigurationToggle
                      label="Trial Extensions"
                      description="Allow extending trial periods for tenants"
                      checked={formData.featureToggles?.trialExtensions || false}
                      onChange={(checked) => handleInputChange('featureToggles.trialExtensions', checked)}
                    />
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <ConfigurationToggle
                      label="Auto Invoicing"
                      description="Automatically generate and send invoices"
                      checked={formData.featureToggles?.autoInvoicing || false}
                      onChange={(checked) => handleInputChange('featureToggles.autoInvoicing', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Document Management */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-file-alt text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Document Management</h3>
                    <p className="text-sm text-gray-600">Document handling and processing features</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <ConfigurationToggle
                      label="Document Versioning"
                      description="Enable document version control and history tracking"
                      checked={formData.featureToggles?.documentVersioning || false}
                      onChange={(checked) => handleInputChange('featureToggles.documentVersioning', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Analytics & Integration */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics & Integration</h3>
                    <p className="text-sm text-gray-600">Advanced reporting and third-party integrations</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <ConfigurationToggle
                      label="Advanced Analytics"
                      description="Enable comprehensive analytics dashboard and detailed reporting"
                      checked={formData.featureToggles?.advancedAnalytics || false}
                      onChange={(checked) => handleInputChange('featureToggles.advancedAnalytics', checked)}
                    />
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <ConfigurationToggle
                      label="API Access"
                      description="Allow REST API access for third-party integrations and custom applications"
                      checked={formData.featureToggles?.apiAccess || false}
                      onChange={(checked) => handleInputChange('featureToggles.apiAccess', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Feature Summary */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-info-circle text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Feature Summary</h3>
                      <p className="text-sm text-gray-600">Current feature activation status</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.values(formData.featureToggles || {}).filter(Boolean).length}/5
                    </div>
                    <div className="text-sm text-gray-500">Features Enabled</div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { key: 'trialExtensions', label: 'Trial Extensions', icon: 'fas fa-clock' },
                    { key: 'autoInvoicing', label: 'Auto Invoicing', icon: 'fas fa-file-invoice' },
                    { key: 'documentVersioning', label: 'Doc Versioning', icon: 'fas fa-file-alt' },
                    { key: 'advancedAnalytics', label: 'Analytics', icon: 'fas fa-chart-bar' },
                    { key: 'apiAccess', label: 'API Access', icon: 'fas fa-plug' }
                  ].map((feature) => (
                    <div
                      key={feature.key}
                      className={`
                        p-3 rounded-lg border text-center transition-all
                        ${formData.featureToggles?.[feature.key]
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-red-100 border-red-300 text-red-800'
                        }
                      `}
                    >
                      <i className={`${feature.icon} text-lg mb-1`}></i>
                      <div className="text-xs font-medium">{feature.label}</div>
                      <div className="text-xs">
                        {formData.featureToggles?.[feature.key] ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
