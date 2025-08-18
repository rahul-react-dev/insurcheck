import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { createPlanRequest, updatePlanRequest, hidePlanModal } from '../../store/super-admin/subscriptionSlice';

const PlanModal = () => {
  const dispatch = useDispatch();
  const { showPlanModal, editingPlan, isLoadingPlans, plansError } = useSelector(state => state.subscription);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    maxUsers: '',
    storageLimit: '',
    features: {
      api_access: false,
      user_support: 'email',
      document_storage: '',
      advanced_analytics: false,
      custom_integrations: false
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name || '',
        description: editingPlan.description || '',
        price: editingPlan.price || '',
        billingCycle: editingPlan.billingCycle || 'monthly',
        maxUsers: editingPlan.maxUsers || '',
        storageLimit: editingPlan.storageLimit || '',
        features: {
          api_access: editingPlan.features?.api_access || false,
          user_support: editingPlan.features?.user_support || 'email',
          document_storage: editingPlan.features?.document_storage || '',
          advanced_analytics: editingPlan.features?.advanced_analytics || false,
          custom_integrations: editingPlan.features?.custom_integrations || false
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        billingCycle: 'monthly',
        maxUsers: '',
        storageLimit: '',
        features: {
          api_access: false,
          user_support: 'email',
          document_storage: '',
          advanced_analytics: false,
          custom_integrations: false
        }
      });
    }
    setErrors({});
  }, [editingPlan, showPlanModal]);

  const handleInputChange = (field, value) => {
    if (field.startsWith('features.')) {
      const featureKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    if (!formData.maxUsers) {
      newErrors.maxUsers = 'Max users is required';
    } else if (isNaN(formData.maxUsers) || parseInt(formData.maxUsers) <= 0) {
      newErrors.maxUsers = 'Max users must be a positive number';
    }

    if (!formData.storageLimit) {
      newErrors.storageLimit = 'Storage limit (GB) is required';
    } else if (isNaN(formData.storageLimit) || parseInt(formData.storageLimit) <= 0) {
      newErrors.storageLimit = 'Storage limit must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const planData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      billingCycle: formData.billingCycle,
      maxUsers: parseInt(formData.maxUsers),
      storageLimit: parseInt(formData.storageLimit),
      features: {
        ...formData.features,
        document_storage: `${formData.storageLimit}GB`
      }
    };

    if (editingPlan) {
      dispatch(updatePlanRequest({ ...planData, id: editingPlan.id }));
    } else {
      dispatch(createPlanRequest(planData));
    }
  };

  const handleClose = () => {
    dispatch(hidePlanModal());
  };

  if (!showPlanModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {plansError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
              <p className="text-red-700">{plansError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Plan Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Basic Plan"
                error={errors.name}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Plan description..."
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="29.99"
                  error={errors.price}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Limits</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Max Users"
                    type="number"
                    min="1"
                    value={formData.maxUsers}
                    onChange={(e) => handleInputChange('maxUsers', e.target.value)}
                    placeholder="5"
                    error={errors.maxUsers}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Storage Limit (GB)"
                    type="number"
                    min="1"
                    value={formData.storageLimit}
                    onChange={(e) => handleInputChange('storageLimit', e.target.value)}
                    placeholder="10"
                    error={errors.storageLimit}
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Type
                </label>
                <select
                  value={formData.features.user_support}
                  onChange={(e) => handleInputChange('features.user_support', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="email">Email Support</option>
                  <option value="phone+email">Phone + Email Support</option>
                  <option value="dedicated">Dedicated Manager</option>
                </select>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Additional Features</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.api_access}
                      onChange={(e) => handleInputChange('features.api_access', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">API Access</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.advanced_analytics}
                      onChange={(e) => handleInputChange('features.advanced_analytics', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Advanced Analytics</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.custom_integrations}
                      onChange={(e) => handleInputChange('features.custom_integrations', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Custom Integrations</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {editingPlan ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingPlan ? 'Update Plan' : 'Create Plan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default PlanModal;