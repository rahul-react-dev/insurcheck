import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CalendarIcon, Clock, Mail, MapPin, Settings, Users, Power, Loader2, Plus, Edit3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import {
  fetchInvoiceConfigRequest,
  updateInvoiceConfigRequest,
  generateInvoiceRequest
} from '../../store/super-admin/invoiceGenerationSlice';

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
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'monthly': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'quarterly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'yearly': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div className="flex-1 max-w-md">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            className="pl-4 pr-4 py-2"
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
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
          <CardContent className="flex items-center space-x-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Configuration Cards */}
      <div className="space-y-4">
        {filteredTenants.map((tenant) => {
          const config = configurations.find(c => c.tenantId === tenant.id);
          const hasConfig = !!config;
          
          return (
            <Card key={tenant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      hasConfig 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Users className={`h-6 w-6 ${
                        hasConfig ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {tenant.name}
                        </h3>
                        {hasConfig && (
                          <Badge className={getStatusColor(config.isActive)}>
                            {config.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
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
                              <span className="text-green-600 dark:text-green-400">Auto-send</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!hasConfig && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No invoice generation configured
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(tenant)}
                    >
                      {hasConfig ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {hasConfig ? 'Edit' : 'Setup'}
                    </Button>
                    
                    {hasConfig && (
                      <Button
                        size="sm"
                        onClick={() => handleManualGenerate(tenant.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Power className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTenants.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tenants found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'No tenants available to configure'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Configuration Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTenant && configurations.find(c => c.tenantId === editingTenant.id)
                ? 'Edit Invoice Configuration'
                : 'Setup Invoice Configuration'
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingTenant && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {editingTenant.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingTenant.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Billing Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, frequency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
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
                <Label htmlFor="billingContactEmail">Billing Contact Email</Label>
                <Input
                  id="billingContactEmail"
                  type="email"
                  value={formData.billingContactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingContactEmail: e.target.value }))}
                  className={errors.billingContactEmail ? 'border-red-500' : ''}
                />
                {errors.billingContactEmail && (
                  <p className="text-red-500 text-xs">{errors.billingContactEmail}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, timezone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Reminder Days</Label>
                  <Input
                    id="reminderDays"
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
                    <Label htmlFor="generateOnWeekend">Generate on Weekends</Label>
                    <p className="text-sm text-gray-500">Allow invoice generation on weekends</p>
                  </div>
                  <Switch
                    id="generateOnWeekend"
                    checked={formData.generateOnWeekend}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, generateOnWeekend: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="autoSend">Auto-send Invoices</Label>
                    <p className="text-sm text-gray-500">Automatically send generated invoices</p>
                  </div>
                  <Switch
                    id="autoSend"
                    checked={formData.autoSend}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSend: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="isActive">Configuration Active</Label>
                    <p className="text-sm text-gray-500">Enable automatic invoice generation</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceGenerationConfig;