import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PlanCard from '../../components/super-admin/PlanCard';
import TenantPlanAssignment from '../../components/super-admin/TenantPlanAssignment';
import PlanModal from '../../components/super-admin/PlanModal';
import {
  fetchPlansRequest,
  fetchTenantsRequest,
  createPlanRequest,
  updatePlanRequest,
  deletePlanRequest,
  assignPlanToTenantRequest,
  showCreatePlanModal,
  showEditPlanModal,
  hidePlanModal,
} from '../../store/super-admin/subscriptionSlice';

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('plans');

  const {
    plans,
    tenants,
    isLoading,
    isLoadingPlans,
    isLoadingTenants,
    error,
    planError,
    tenantError,
    showPlanModal,
    editingPlan
  } = useSelector(state => state.subscription);

  useEffect(() => {
    dispatch(fetchPlansRequest());
    dispatch(fetchTenantsRequest());
  }, [dispatch]);

  const handleCreatePlan = () => {
    dispatch(showCreatePlanModal());
  };

  const handleEditPlan = (plan) => {
    dispatch(showEditPlanModal(plan));
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      dispatch(deletePlanRequest(planId));
    }
  };

  const handleAssignPlan = (tenantId, planId) => {
    dispatch(assignPlanToTenantRequest({ tenantId, planId }));
  };

  const tabs = [
    {
      id: 'plans',
      label: 'Subscription Plans',
      icon: 'fas fa-credit-card'
    },
    {
      id: 'assignments',
      label: 'Tenant Assignments',
      icon: 'fas fa-users'
    }
  ];

  return (
    <div className="min-h-full">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Subscription Management</h1>
            <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
              Define and manage subscription plans for your tenants
            </p>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Active</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <i className="fas fa-cogs text-3xl lg:text-4xl text-white opacity-80"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation and Error Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Error Display */}
        {(error || planError || tenantError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <i className="fas fa-exclamation-triangle text-red-400 mt-0.5"></i>
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700 text-sm">{error || planError || tenantError}</p>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'subscription/clearError' })}
                className="text-red-400 hover:text-red-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium
                  border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0
                  ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <i className={`${tab.icon} text-sm sm:text-base flex-shrink-0`}></i>
                <span className="truncate">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse flex-shrink-0"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 min-h-[500px]">
        {activeTab === 'plans' && (
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Plans Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Subscription Plans</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Create and manage subscription plans with different feature sets
                </p>
              </div>
              <Button
                onClick={handleCreatePlan}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base flex-shrink-0"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New Plan
              </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {isLoadingPlans ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                ))
              ) : plans && plans.length > 0 ? (
                plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={handleEditPlan}
                    onDelete={handleDeletePlan}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <i className="fas fa-credit-card text-4xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plans Found</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first subscription plan</p>
                  <Button
                    onClick={handleCreatePlan}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create First Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Tenant Assignments</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Assign subscription plans to tenants and manage their access
              </p>
            </div>

            <TenantPlanAssignment />
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <PlanModal />
    </div>
  );
};

export default SubscriptionManagement;