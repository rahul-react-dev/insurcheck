
import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const TenantStateModal = ({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    status: "",
    reason: "",
    effectiveDate: new Date().toISOString().split('T')[0],
    notifyUsers: true,
    setReadOnly: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tenant) {
      setFormData({
        status: tenant.status || "",
        reason: "",
        effectiveDate: new Date().toISOString().split('T')[0],
        notifyUsers: true,
        setReadOnly: tenant.status === 'deactivated' || tenant.status === 'suspended',
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

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.reason || formData.reason.trim().length < 5) {
      newErrors.reason = "Reason is required (minimum 5 characters)";
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = "Effective date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: "active", label: "Active", description: "Full access to all features" },
    { value: "trial", label: "Trial", description: "Limited trial access" },
    { value: "suspended", label: "Suspended", description: "Temporarily suspended access" },
    { value: "deactivated", label: "Deactivated", description: "No access, read-only documents" },
    { value: "subscription_cancelled", label: "Subscription Cancelled", description: "Cancelled subscription, limited access" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Change Tenant Status
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update the status for {tenant?.tenantName}
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
            {/* Current Status Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tenant?.status === 'active' ? 'bg-green-100 text-green-800' :
                  tenant?.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                  tenant?.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                  tenant?.status === 'deactivated' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tenant?.status?.charAt(0).toUpperCase() + tenant?.status?.slice(1)}
                </span>
                <span className="text-sm text-gray-600">
                  Last changed: {tenant?.lastStateChange ? new Date(tenant.lastStateChange).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* New Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.status === option.value
                        ? 'border-blue-600 ring-2 ring-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-gray-500">{option.description}</div>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        formData.status === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {formData.status === option.value && (
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
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
                placeholder="Provide a detailed reason for this status change..."
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Effective Date */}
            <div>
              <Input
                label="Effective Date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                error={errors.effectiveDate}
              />
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Additional Options</h3>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.notifyUsers}
                  onChange={(e) => handleInputChange('notifyUsers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Notify Users</div>
                  <div className="text-gray-500">Send email notifications to tenant users about the status change</div>
                </div>
              </label>

              {(formData.status === 'deactivated' || formData.status === 'suspended') && (
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.setReadOnly}
                    onChange={(e) => handleInputChange('setReadOnly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Set Documents to Read-Only</div>
                    <div className="text-gray-500">Restrict document editing capabilities</div>
                  </div>
                </label>
              )}
            </div>

            {/* Warning Messages */}
            {formData.status === 'deactivated' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 mr-3"></i>
                  <div>
                    <h3 className="text-red-800 font-medium text-sm">Warning: Deactivation</h3>
                    <p className="text-red-700 text-sm mt-1">
                      This will block all user access and set documents to read-only mode.
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Updating Status...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Update Status
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

export default TenantStateModal;
