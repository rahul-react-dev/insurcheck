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
    planId: '',
    name: '',
    description: '',
    price: '',
    billingCycle: 'Monthly',
    features: {
      maxUsers: '',
      maxDocuments: '',
      maxComplianceChecks: '',
      storage: '',
      support: ''
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        planId: editingPlan.planId || '',
        name: editingPlan.name || '',
        description: editingPlan.description || '',
        price: editingPlan.price || '',
        billingCycle: editingPlan.billingCycle || 'Monthly',
        features: {
          maxUsers: editingPlan.features?.maxUsers || '',
          maxDocuments: editingPlan.features?.maxDocuments || '',
          maxComplianceChecks: editingPlan.features?.maxComplianceChecks || '',
          storage: editingPlan.features?.storage || '',
          support: editingPlan.features?.support || ''
        }
      });
    } else {
      setFormData({
        planId: '',
        name: '',
        description: '',
        price: '',
        billingCycle: 'Monthly',
        features: {
          maxUsers: '',
          maxDocuments: '',
          maxComplianceChecks: '',
          storage: '',
          support: ''
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

    if (!formData.planId.trim()) {
      newErrors.planId = 'Plan ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.features.maxUsers) {
      newErrors['features.maxUsers'] = 'Max users is required';
    }

    if (!formData.features.maxDocuments) {
      newErrors['features.maxDocuments'] = 'Max documents is required';
    }

    if (!formData.features.maxComplianceChecks) {
      newErrors['features.maxComplianceChecks'] = 'Max compliance checks is required';
    }

    if (!formData.features.storage.trim()) {
      newErrors['features.storage'] = 'Storage limit is required';
    }

    if (!formData.features.support.trim()) {
      newErrors['features.support'] = 'Support type is required';
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
      ...formData,
      price: parseFloat(formData.price)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Plan ID"
                  value={formData.planId}
                  onChange={(e) => handleInputChange('planId', e.target.value)}
                  placeholder="e.g., BASIC_001"
                  error={errors.planId}
                  disabled={!!editingPlan}
                  required
                />
                {editingPlan && (
                  <p className="text-xs text-gray-500 mt-1">
                    Plan ID cannot be changed after creation
                  </p>
                )}
              </div>
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
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Limits</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Max Users"
                    value={formData.features.maxUsers}
                    onChange={(e) => handleInputChange('features.maxUsers', e.target.value)}
                    placeholder="5 or Unlimited"
                    error={errors['features.maxUsers']}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Max Documents"
                    value={formData.features.maxDocuments}
                    onChange={(e) => handleInputChange('features.maxDocuments', e.target.value)}
                    placeholder="100 or Unlimited"
                    error={errors['features.maxDocuments']}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Max Compliance Checks"
                    value={formData.features.maxComplianceChecks}
                    onChange={(e) => handleInputChange('features.maxComplianceChecks', e.target.value)}
                    placeholder="50 or Unlimited"
                    error={errors['features.maxComplianceChecks']}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Storage Limit"
                    value={formData.features.storage}
                    onChange={(e) => handleInputChange('features.storage', e.target.value)}
                    placeholder="1GB, 10GB, etc."
                    error={errors['features.storage']}
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <Input
                  label="Support Type"
                  value={formData.features.support}
                  onChange={(e) => handleInputChange('features.support', e.target.value)}
                  placeholder="Email, Phone, Dedicated Manager"
                  error={errors['features.support']}
                  required
                />
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
                disabled={isLoadingPlans}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {isLoadingPlans ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default PlanModal;