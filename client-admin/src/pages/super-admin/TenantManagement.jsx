import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TenantFilters from "../../components/super-admin/TenantFilters";
import TenantTable from "../../components/super-admin/TenantTable";
import TenantModal from "../../components/super-admin/TenantModal";
import ConfirmModal from "../../components/ui/ConfirmModal";

import {
  fetchTenantsRequest,
  createTenantRequest,
  updateTenantRequest,
  deleteTenantRequest,
  clearErrors,
} from "../../store/super-admin/tenantSlice";

const TenantManagement = () => {
  const dispatch = useDispatch();

  const {
    tenants,
    totalTenants,
    statusCounts,
    isLoading,
    error,
    filters,
    pagination,
    hasInitialLoad,
  } = useSelector((state) => state.tenant);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    tenantId: null,
    tenantName: "",
  });

  // Mock subscription plans
  const subscriptionPlans = [
    { id: 1, name: "Basic" },
    { id: 2, name: "Standard" },
    { id: 3, name: "Premium" },
    { id: 4, name: "Enterprise" },
  ];

  useEffect(() => {
    if (!hasInitialLoad) {
      dispatch(fetchTenantsRequest({ 
        ...filters, 
        page: pagination.page, 
        limit: pagination.limit 
      }));
    }
  }, [dispatch, hasInitialLoad]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleFilterChange = (newFilters) => {
    dispatch(fetchTenantsRequest({ 
      ...newFilters, 
      page: 1, 
      limit: pagination.limit 
    }));
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchTenantsRequest({ 
      ...filters, 
      page: newPage, 
      limit: pagination.limit 
    }));
  };

  const handlePageSizeChange = (newLimit) => {
    dispatch(fetchTenantsRequest({ 
      ...filters, 
      page: 1, 
      limit: newLimit 
    }));
  };

  const handleRefresh = () => {
    dispatch(fetchTenantsRequest({ 
      ...filters, 
      page: pagination.page, 
      limit: pagination.limit 
    }));
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteTenant = (tenant) => {
    setDeleteConfirm({
      isOpen: true,
      tenantId: tenant.id,
      tenantName: tenant.tenantName,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.tenantId) {
      dispatch(deleteTenantRequest(deleteConfirm.tenantId));
    }
    setDeleteConfirm({ isOpen: false, tenantId: null, tenantName: "" });
  };

  const handleSubmit = (tenantData) => {
    if (selectedTenant) {
      dispatch(updateTenantRequest({ id: selectedTenant.id, ...tenantData }));
    } else {
      dispatch(createTenantRequest(tenantData));
    }
    setIsModalOpen(false);
  };

  const handleClearErrors = () => {
    dispatch(clearErrors());
  };

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Tenant Management
            </h1>
            <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
              Manage tenant accounts, subscriptions, and access controls
            </p>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Tenant System Online</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-building text-3xl lg:text-4xl text-white opacity-80"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {/* Total Tenants */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-building text-xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {totalTenants || 0}
              </p>
              <p className="text-sm text-gray-600">Total Tenants</p>
            </div>
          </div>
        </Card>

        {/* Active */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-check-circle text-xl text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {statusCounts.active || 0}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </Card>

        {/* Suspended */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <i className="fas fa-pause-circle text-xl text-red-600"></i>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {statusCounts.suspended || 0}
              </p>
              <p className="text-sm text-gray-600">Suspended</p>
            </div>
          </div>
        </Card>

        {/* Unverified */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <i className="fas fa-exclamation-triangle text-xl text-yellow-600"></i>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {statusCounts.unverified || 0}
              </p>
              <p className="text-sm text-gray-600">Unverified</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <i className="fas fa-exclamation-triangle text-red-400 mt-0.5"></i>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={handleClearErrors}
              className="text-red-400 hover:text-red-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex-1">
            <TenantFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              subscriptionPlans={subscriptionPlans}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleRefresh}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
              disabled={isLoading}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </Button>
            <Button
              onClick={handleCreateTenant}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Tenant
            </Button>
          </div>
        </div>
      </Card>

      {/* Tenants Table */}
      <Card className="overflow-hidden">
        <TenantTable
          tenants={tenants}
          totalTenants={totalTenants}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEditTenant}
          onDelete={handleDeleteTenant}
        />
      </Card>

      {/* Create/Edit Tenant Modal */}
      {isModalOpen && (
        <TenantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          tenant={selectedTenant}
          subscriptionPlans={subscriptionPlans}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() =>
            setDeleteConfirm({ isOpen: false, tenantId: null, tenantName: "" })
          }
          onConfirm={confirmDelete}
          title="Delete Tenant"
          message={`Are you sure you want to delete tenant "${deleteConfirm.tenantName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};

export default TenantManagement;