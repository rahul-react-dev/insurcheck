
import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const TenantSubscriptionModal = ({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    action: "",
    reason: "",
    effectiveDate: new Date().toISOString().split('T')[0],
    notifyTenant: true,
    refundAmount: 0,
    gracePeriodDays: 0,
    allowReactivation: true,
    newPlan: "",
    billingCycle: "monthly",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tenant) {
      setFormData({
        action: "",
        reason: "",
        effectiveDate: new Date().toISOString().split('T')[0],
        notifyTenant: true,
        refundAmount: 0,
        gracePeriodDays: tenant.subscriptionStatus === 'active' ? 7 : 0,
        allowReactivation: true,
        newPlan: tenant.subscriptionPlan || "",
        billingCycle: "monthly",
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

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required";
    }

    if (formData.action === 'change_plan' && !formData.newPlan) {
      newErrors.newPlan = "New subscription plan is required";
    }

    if (formData.refundAmount && (formData.refundAmount < 0 || formData.refundAmount > 10000)) {
      newErrors.refundAmount = "Refund amount must be between 0 and 10000";
    }

    if (formData.gracePeriodDays && (formData.gracePeriodDays < 0 || formData.gracePeriodDays > 90)) {
      newErrors.gracePeriodDays = "Grace period must be between 0 and 90 days";
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

  const actionOptions = [
    {
      value: "cancel",
      label: "Cancel Subscription",
      description: "Cancel the current subscription with optional grace period",
      icon: "fas fa-ban",
      color: "red",
    },
    {
      value: "suspend",
      label: "Suspend Subscription",
      description: "Temporarily suspend access while maintaining subscription",
      icon: "fas fa-pause-circle",
      color: "orange",
    },
    {
      value: "reactivate",
      label: "Reactivate Subscription",
      description: "Restore access to a suspended or cancelled subscription",
      icon: "fas fa-play-circle",
      color: "green",
    },
    {
      value: "change_plan",
      label: "Change Plan",
      description: "Upgrade or downgrade the subscription plan",
      icon: "fas fa-exchange-alt",
      color: "blue",
    },
  ];

  const getStatusColor = () => {
    switch (tenant?.subscriptionStatus?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'suspended':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'trial':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Subscription
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage subscription settings for {tenant?.tenantName}
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
            {/* Current Subscription Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Subscription</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor()}`}>
                    {tenant?.subscriptionStatus}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Plan</span>
                  <p className="font-medium text-gray-900">{tenant?.subscriptionPlan}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Start Date</span>
                  <p className="font-medium text-gray-900">
                    {tenant?.subscriptionStartDate ? new Date(tenant.subscriptionStartDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">End Date</span>
                  <p className="font-medium text-gray-900">
                    {tenant?.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString() : 'N/A'}
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
                        ? `border-${option.color}-600 ring-2 ring-${option.color}-600`
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
                        formData.action === option.value ? `text-${option.color}-600` : 'text-gray-400'
                      }`}></i>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ml-3 ${
                        formData.action === option.value
                          ? `border-${option.color}-600 bg-${option.color}-600`
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
            {formData.action === 'change_plan' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Subscription Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.newPlan}
                    onChange={(e) => handleInputChange('newPlan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a plan</option>
                    <option value="basic">Basic Plan - $29/month</option>
                    <option value="professional">Professional Plan - $79/month</option>
                    <option value="enterprise">Enterprise Plan - $199/month</option>
                  </select>
                  {errors.newPlan && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPlan}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            )}

            {(formData.action === 'cancel' || formData.action === 'suspend') && (
              <div className="space-y-4">
                <div>
                  <Input
                    label="Grace Period (Days)"
                    type="number"
                    value={formData.gracePeriodDays}
                    onChange={(e) => handleInputChange('gracePeriodDays', parseInt(e.target.value) || 0)}
                    min={0}
                    max={90}
                    placeholder="Days of continued access"
                    error={errors.gracePeriodDays}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Number of days the tenant will maintain access after cancellation
                  </p>
                </div>

                <div>
                  <Input
                    label="Refund Amount ($)"
                    type="number"
                    value={formData.refundAmount}
                    onChange={(e) => handleInputChange('refundAmount', parseFloat(e.target.value) || 0)}
                    min={0}
                    max={10000}
                    step={0.01}
                    placeholder="0.00"
                    error={errors.refundAmount}
                  />
                </div>

                {formData.action === 'cancel' && (
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.allowReactivation}
                        onChange={(e) => handleInputChange('allowReactivation', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">Allow Reactivation</div>
                        <div className="text-gray-500">Tenant can reactivate their subscription later</div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Effective Date */}
            <div>
              <Input
                label="Effective Date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                error={errors.effectiveDate}
                required
              />
            </div>

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
                placeholder="Provide a detailed reason for this subscription change..."
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
                  <div className="text-gray-500">Send email notification about the subscription change</div>
                </div>
              </label>
            </div>

            {/* Warning Messages */}
            {formData.action === 'cancel' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 mr-3"></i>
                  <div>
                    <h3 className="text-red-800 font-medium text-sm">Warning: Subscription Cancellation</h3>
                    <p className="text-red-700 text-sm mt-1">
                      This will cancel the subscription. Access will be limited after the grace period expires.
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
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
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
                    Update Subscription
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

export default TenantSubscriptionModal;
