
import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const TenantModal = ({
  isOpen,
  onClose,
  onSubmit,
  tenant = null,
  mode = "create",
  subscriptionPlans = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    tenantName: "",
    primaryContactEmail: "",
    subscriptionPlan: "",
    description: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tenant && mode === "edit") {
      setFormData({
        tenantName: tenant.tenantName || "",
        primaryContactEmail: tenant.primaryContactEmail || "",
        subscriptionPlan: tenant.subscriptionPlan || "",
        description: tenant.description || "",
        status: tenant.status || "active",
      });
    } else {
      setFormData({
        tenantName: "",
        primaryContactEmail: "",
        subscriptionPlan: "",
        description: "",
        status: "active",
      });
    }
    setErrors({});
  }, [tenant, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenantName.trim()) {
      newErrors.tenantName = "Tenant name is required";
    } else if (formData.tenantName.length < 3) {
      newErrors.tenantName = "Tenant name must be at least 3 characters";
    }

    if (!formData.primaryContactEmail.trim()) {
      newErrors.primaryContactEmail = "Primary contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      newErrors.primaryContactEmail = "Please enter a valid email address";
    }

    if (!formData.subscriptionPlan) {
      newErrors.subscriptionPlan = "Subscription plan is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              <i className="fas fa-building mr-2"></i>
              {mode === "create" ? "Create New Tenant" : "Edit Tenant"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl font-bold"
              disabled={isLoading}
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Tenant Name"
                    value={formData.tenantName}
                    onChange={(e) => handleInputChange("tenantName", e.target.value)}
                    placeholder="Enter tenant name"
                    error={errors.tenantName}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Primary Contact Email"
                    type="email"
                    value={formData.primaryContactEmail}
                    onChange={(e) =>
                      handleInputChange("primaryContactEmail", e.target.value)
                    }
                    placeholder="Enter primary contact email"
                    error={errors.primaryContactEmail}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter tenant description"
                  multiline={true}
                  rows={3}
                />
              </div>
            </div>

            {/* Subscription & Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subscription & Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Plan *
                  </label>
                  <select
                    value={formData.subscriptionPlan}
                    onChange={(e) =>
                      handleInputChange("subscriptionPlan", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.subscriptionPlan
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Select a plan</option>
                    {subscriptionPlans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name} - ${plan.price}/{plan.billingCycle}
                      </option>
                    ))}
                  </select>
                  {errors.subscriptionPlan && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subscriptionPlan}
                    </p>
                  )}
                </div>

                {mode === "edit" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="unverified">Unverified</option>
                      <option value="locked">Locked</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-info-circle text-blue-500 mt-0.5 flex-shrink-0"></i>
                <div>
                  <h4 className="text-blue-800 font-medium mb-2">
                    {mode === "create" ? "Tenant Creation" : "Tenant Update"}
                  </h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    {mode === "create" ? (
                      <>
                        <li>• A new tenant account will be created</li>
                        <li>• An admin user will be created for this tenant</li>
                        <li>• A welcome email will be sent to the primary contact</li>
                        <li>• The tenant will be assigned the selected subscription plan</li>
                      </>
                    ) : (
                      <>
                        <li>• Tenant information will be updated</li>
                        <li>• Status changes may affect tenant access</li>
                        <li>• Plan changes will be reflected in the next billing cycle</li>
                        <li>• All changes will be logged in audit logs</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-8 pt-6 border-t border-gray-200">
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
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {mode === "create" ? "Create Tenant" : "Update Tenant"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantModal;
