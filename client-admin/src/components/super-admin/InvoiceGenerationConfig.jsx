
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const InvoiceGenerationConfig = ({ 
  configurations = [], 
  tenants = [], 
  isLoading, 
  onConfigUpdate, 
  onManualGenerate 
}) => {
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    frequency: 'monthly',
    startDate: '',
    billingContactEmail: '',
    timezone: 'UTC',
    generateOnWeekend: false,
    autoSend: true,
    reminderDays: 3
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (tenant) => {
    const config = configurations.find(c => c.tenantId === tenant.id) || {};
    setEditingTenant(tenant);
    setFormData({
      frequency: config.frequency || 'monthly',
      startDate: config.startDate || '',
      billingContactEmail: config.billingContactEmail || tenant.email,
      timezone: config.timezone || 'UTC',
      generateOnWeekend: config.generateOnWeekend || false,
      autoSend: config.autoSend !== undefined ? config.autoSend : true,
      reminderDays: config.reminderDays || 3
    });
    setErrors({});
  };

  const handleSave = () => {
    const newErrors = {};

    if (!formData.billingContactEmail) {
      newErrors.billingContactEmail = 'Billing contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.billingContactEmail)) {
      newErrors.billingContactEmail = 'Please enter a valid email address';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.reminderDays < 0 || formData.reminderDays > 30) {
      newErrors.reminderDays = 'Reminder days must be between 0 and 30';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onConfigUpdate(editingTenant.id, formData);
      setEditingTenant(null);
    }
  };

  const handleCancel = () => {
    setEditingTenant(null);
    setFormData({
      frequency: 'monthly',
      startDate: '',
      billingContactEmail: '',
      timezone: 'UTC',
      generateOnWeekend: false,
      autoSend: true,
      reminderDays: 3
    });
    setErrors({});
  };

  const getConfigStatus = (tenantId) => {
    const config = configurations.find(c => c.tenantId === tenantId);
    return config?.isActive ? 'Active' : 'Inactive';
  };

  const getNextGenerationDate = (tenantId) => {
    const config = configurations.find(c => c.tenantId === tenantId);
    if (!config?.nextGenerationDate) return 'Not scheduled';
    
    return new Date(config.nextGenerationDate).toLocaleDateString();
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<i className="fas fa-search"></i>}
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredTenants.length} of {tenants.length} tenants
        </div>
      </div>

      {/* Configuration List */}
      <div className="space-y-4">
        {filteredTenants.length === 0 ? (
          <Card className="p-8 text-center">
            <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </Card>
        ) : (
          filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="overflow-hidden">
              {editingTenant?.id === tenant.id ? (
                // Edit Form
                <div className="p-6 bg-blue-50">
                  <div className="flex items-center mb-6">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-building text-blue-600"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                      <p className="text-sm text-gray-600">{tenant.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Frequency *
                      </label>
                      <select
                        value={formData.frequency}
                        onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <Input
                        label="Start Date *"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        error={errors.startDate}
                        required
                      />
                    </div>

                    <div>
                      <Input
                        label="Billing Contact Email *"
                        type="email"
                        value={formData.billingContactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, billingContactEmail: e.target.value }))}
                        error={errors.billingContactEmail}
                        leftIcon={<i className="fas fa-envelope"></i>}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>

                    <div>
                      <Input
                        label="Reminder Days Before Due"
                        type="number"
                        min="0"
                        max="30"
                        value={formData.reminderDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: parseInt(e.target.value) }))}
                        error={errors.reminderDays}
                        helperText="Days before due date to send reminder email"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center">
                      <input
                        id={`generate-weekend-${tenant.id}`}
                        type="checkbox"
                        checked={formData.generateOnWeekend}
                        onChange={(e) => setFormData(prev => ({ ...prev, generateOnWeekend: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`generate-weekend-${tenant.id}`} className="ml-3 text-sm text-gray-700">
                        Allow generation on weekends
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id={`auto-send-${tenant.id}`}
                        type="checkbox"
                        checked={formData.autoSend}
                        onChange={(e) => setFormData(prev => ({ ...prev, autoSend: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`auto-send-${tenant.id}`} className="ml-3 text-sm text-gray-700">
                        Automatically send invoices via email
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Save Configuration
                    </Button>
                    <Button
                      onClick={handleCancel}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Display View
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-building text-gray-600"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                        <p className="text-sm text-gray-600">{tenant.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getConfigStatus(tenant.id) === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full mr-1 ${
                              getConfigStatus(tenant.id) === 'Active' ? 'bg-green-400' : 'bg-gray-400'
                            }`}></div>
                            {getConfigStatus(tenant.id)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Next: {getNextGenerationDate(tenant.id)}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button
                          onClick={() => handleEdit(tenant)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Configure
                        </Button>
                        <Button
                          onClick={() => onManualGenerate(tenant.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm"
                        >
                          <i className="fas fa-magic mr-1"></i>
                          Generate Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Summary */}
                  {configurations.find(c => c.tenantId === tenant.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <span className="ml-1 font-medium capitalize">
                            {configurations.find(c => c.tenantId === tenant.id)?.frequency}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Start Date:</span>
                          <span className="ml-1 font-medium">
                            {new Date(configurations.find(c => c.tenantId === tenant.id)?.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Auto Send:</span>
                          <span className="ml-1 font-medium">
                            {configurations.find(c => c.tenantId === tenant.id)?.autoSend ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reminder:</span>
                          <span className="ml-1 font-medium">
                            {configurations.find(c => c.tenantId === tenant.id)?.reminderDays} days
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InvoiceGenerationConfig;
