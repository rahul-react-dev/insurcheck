
import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const TenantTrialModal = ({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    action: "",
    trialEndDate: "",
    extendDays: 0,
    reason: "",
    notifyTenant: true,
    convertToSubscription: false,
    subscriptionPlan: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tenant) {
      const today = new Date();
      const defaultEndDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
      
      setFormData({
        action: "",
        trialEndDate: tenant.trialEndDate ? tenant.trialEndDate.split('T')[0] : defaultEndDate.toISOString().split('T')[0],
        extendDays: 0,
        reason: "",
        notifyTenant: true,
        convertToSubscription: false,
        subscriptionPlan: "basic",
      });
    }
  }, [tenant]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.action) {
      newErrors.action = "Please select an action";
    }

    if (!formData.reason || formData.reason.trim().length < 5) {
      newErrors.reason = "Reason is required (minimum 5 characters)";
    }

    if (formData.action === 'extend' && (!formData.extendDays || formData.extendDays < 1)) {
      newErrors.extendDays = "Extension days must be at least 1";
    }

    if (formData.action === 'modify' && !formData.trialEndDate) {
      newErrors.trialEndDate = "Trial end date is required";
    }

    if (formData.convertToSubscription && !formData.subscriptionPlan) {
      newErrors.subscriptionPlan = "Subscription plan is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        tenantId: tenant?.id,
      };
      onSubmit(submitData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const getDaysRemaining = () => {
    if (!tenant?.trialEndDate) return 0;
    const today = new Date();
    const endDate = new Date(tenant.trialEndDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const actionOptions = [
    {
      value: "extend",
      label: "Extend Trial",
      description: "Add additional days to the current trial period",
      icon: "fas fa-plus-circle",
    },
    {
      value: "modify",
      label: "Modify End Date",
      description: "Set a specific end date for the trial",
      icon: "fas fa-calendar-alt",
    },
    {
      value: "end",
      label: "End Trial Now",
      description: "Immediately end the trial period",
      icon: "fas fa-stop-circle",
    },
    {
      value: "convert",
      label: "Convert to Subscription",
      description: "End trial and activate a subscription plan",
      icon: "fas fa-arrow-up",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Trial Period
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage trial settings for {tenant?.tenantName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Trial Status */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-3">Current Trial Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-blue-600">Status</span>
                  <p className="font-medium text-blue-900">{tenant?.trialStatus}</p>
                </div>
                <div>
                  <span className="text-xs text-blue-600">Days Remaining</span>
                  <p className="font-medium text-blue-900">{getDaysRemaining()} days</p>
                </div>
                <div>
                  <span className="text-xs text-blue-600">End Date</span>
                  <p className="font-medium text-blue-900">
                    {tenant?.trialEndDate ? new Date(tenant.trialEndDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Action <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {actionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.action === option.value
                        ? 'border-blue-600 ring-2 ring-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={option.value}
                      checked={formData.action === option.value}
                      onChange={(e) => handleInputChange('action', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center">
                      <i className={`${option.icon} text-lg mr-3 ${
                        formData.action === option.value ? 'text-blue-600' : 'text-gray-400'
                      }`}></i>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ml-3 ${
                        formData.action === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {formData.action === option.value && (
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.action && (
                <p className="text-red-500 text-sm mt-1">{errors.action}</p>
              )}
            </div>

            {/* Conditional Fields */}
            {formData.action === 'extend' && (
              <div>
                <Input
                  label="Extension Days"
                  type="number"
                  value={formData.extendDays}
                  onChange={(e) => handleInputChange('extendDays', parseInt(e.target.value) || 0)}
                  min={1}
                  max={365}
                  placeholder="Enter number of days to extend"
                  error={errors.extendDays}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  New end date: {(() => {
                    const currentEnd = new Date(tenant?.trialEndDate || new Date());
                    const newEnd = new Date(currentEnd.getTime() + (formData.extendDays * 24 * 60 * 60 * 1000));
                    return newEnd.toLocaleDateString();
                  })()}
                </p>
              </div>
            )}

            {formData.action === 'modify' && (
              <div>
                <Input
                  label="New Trial End Date"
                  type="date"
                  value={formData.trialEndDate}
                  onChange={(e) => handleInputChange('trialEndDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  error={errors.trialEndDate}
                  required
                />
              </div>
            )}

            {formData.action === 'convert' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subscriptionPlan}
                  onChange={(e) => handleInputChange('subscriptionPlan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a plan</option>
                  <option value="basic">Basic Plan</option>
                  <option value="professional">Professional Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
                </select>
                {errors.subscriptionPlan && (
                  <p className="text-red-500 text-sm mt-1">{errors.subscriptionPlan}</p>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide a detailed reason for this trial change..."
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Notification Option */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.notifyTenant}
                  onChange={(e) => handleInputChange('notifyTenant', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Notify Tenant</div>
                  <div className="text-gray-500">Send email notification about the trial change</div>
                </div>
              </label>
            </div>

            {/* Warning for trial end */}
            {formData.action === 'end' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-400 mt-0.5 mr-3"></i>
                  <div>
                    <h3 className="text-yellow-800 font-medium text-sm">Warning: End Trial</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      This will immediately end the trial period. The tenant will need an active subscription to continue using the service.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Update Trial
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenantTrialModal;
