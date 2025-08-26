import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  CalendarIcon, Clock, Mail, MapPin, Settings, Users, Power, 
  Loader2, Plus, Edit3, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import {
  fetchInvoiceConfigRequest,
  updateInvoiceConfigRequest,
  generateInvoiceRequest
} from '../../store/super-admin/invoiceGenerationSlice';

// Simple Badge component
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Simple Switch component
const Switch = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// Simple Select component
const Select = ({ value, onChange, children, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  >
    {children}
  </select>
);

// Simple Modal component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoiceGenerationConfig = () => {
  const dispatch = useDispatch();
  const { 
    configurations,
    tenants,
    isLoading,
    error
  } = useSelector(state => state.invoiceGeneration);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    frequency: 'monthly',
    startDate: '',
    billingContactEmail: '',
    timezone: 'UTC',
    generateOnWeekend: false,
    autoSend: true,
    reminderDays: 3,
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchInvoiceConfigRequest());
  }, [dispatch]);

  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    return tenants.filter(tenant =>
      (tenant.name && tenant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tenant.email && tenant.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tenants, searchTerm]);

  const handleEdit = (tenant) => {
    const config = configurations.find(c => c.tenantId === tenant.id);
    setEditingTenant(tenant);
    setFormData({
      frequency: config?.frequency || 'monthly',
      startDate: config?.startDate ? new Date(config.startDate).toISOString().split('T')[0] : '',
      billingContactEmail: config?.billingContactEmail || tenant.email,
      timezone: config?.timezone || 'UTC',
      generateOnWeekend: config?.generateOnWeekend || false,
      autoSend: config?.autoSend !== undefined ? config.autoSend : true,
      reminderDays: config?.reminderDays || 3,
      isActive: config?.isActive !== undefined ? config.isActive : true
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateInvoiceConfigRequest({
        tenantId: editingTenant.id,
        config: {
          ...formData,
          startDate: new Date(formData.startDate).toISOString()
        }
      }));
      setShowModal(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Error updating config:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualGenerate = (tenantId) => {
    dispatch(generateInvoiceRequest(tenantId));
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'yearly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Generate All */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => handleManualGenerate('all')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Power className="h-4 w-4 mr-2" />
          Generate All
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {/* Configuration Cards */}
      <div className="space-y-4">
        {filteredTenants.map((tenant) => {
          const config = configurations.find(c => c.tenantId === tenant.id);
          const hasConfig = !!config;
          
          return (
            <Card key={tenant.id} className="hover:shadow-md transition-shadow" padding="default">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    hasConfig 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                      : 'bg-gray-100'
                  }`}>
                    <Users className={`h-6 w-6 ${
                      hasConfig ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {tenant.name}
                      </h3>
                      {hasConfig && (
                        <Badge className={getStatusColor(config.isActive)}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                    
                    {hasConfig && (
                      <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <Badge className={getFrequencyColor(config.frequency)}>
                            {config.frequency}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-gray-500">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Next: {config.nextGenerationDate ? 
                            format(new Date(config.nextGenerationDate), 'MMM dd, yyyy') : 
                            'Not scheduled'
                          }</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{config.timezone}</span>
                        </div>
                        
                        {config.autoSend && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">Auto-send</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!hasConfig && (
                      <p className="text-sm text-gray-500">
                        No invoice generation configured
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleEdit(tenant)}
                  >
                    {hasConfig ? <Edit3 className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                    {hasConfig ? 'Edit' : 'Setup'}
                  </Button>
                  
                  {hasConfig && (
                    <Button
                      size="small"
                      variant="success"
                      onClick={() => handleManualGenerate(tenant.id)}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTenants.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tenants found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No tenants available to configure'}
          </p>
        </Card>
      )}

      {/* Configuration Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={editingTenant && configurations.find(c => c.tenantId === editingTenant.id)
          ? 'Edit Invoice Configuration'
          : 'Setup Invoice Configuration'
        }
      >
        {editingTenant && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">
                  {editingTenant.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {editingTenant.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Billing Frequency
                </label>
                <Select 
                  value={formData.frequency} 
                  onChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs">{errors.startDate}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Billing Contact Email
              </label>
              <Input
                type="email"
                value={formData.billingContactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, billingContactEmail: e.target.value }))}
                className={errors.billingContactEmail ? 'border-red-500' : ''}
              />
              {errors.billingContactEmail && (
                <p className="text-red-500 text-xs">{errors.billingContactEmail}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <Select 
                  value={formData.timezone} 
                  onChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reminder Days
                </label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.reminderDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: parseInt(e.target.value) || 0 }))}
                  className={errors.reminderDays ? 'border-red-500' : ''}
                />
                {errors.reminderDays && (
                  <p className="text-red-500 text-xs">{errors.reminderDays}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Generate on Weekends
                  </label>
                  <p className="text-sm text-gray-500">Allow invoice generation on weekends</p>
                </div>
                <Switch
                  checked={formData.generateOnWeekend}
                  onChange={(checked) => setFormData(prev => ({ ...prev, generateOnWeekend: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Auto-send Invoices
                  </label>
                  <p className="text-sm text-gray-500">Automatically send generated invoices</p>
                </div>
                <Switch
                  checked={formData.autoSend}
                  onChange={(checked) => setFormData(prev => ({ ...prev, autoSend: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Configuration Active
                  </label>
                  <p className="text-sm text-gray-500">Enable automatic invoice generation</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Save Configuration
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceGenerationConfig;