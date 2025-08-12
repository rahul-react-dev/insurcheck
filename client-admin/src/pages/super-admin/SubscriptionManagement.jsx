

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import PlanCard from '../../components/super-admin/PlanCard';
import PlanModal from '../../components/super-admin/PlanModal';
import TenantPlanAssignment from '../../components/super-admin/TenantPlanAssignment';
import Button from '../../components/ui/Button';
import {
  fetchPlansRequest,
  deletePlanRequest,
  showCreatePlanModal,
  showEditPlanModal,
  hidePlanModal,
  clearErrors
} from '../../store/super-admin/subscriptionSlice';

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    plans,
    editingPlan,
    showPlanModal,
    isLoadingPlans,
    plansError,
    user
  } = useSelector(state => ({
    plans: state.subscription.plans,
    editingPlan: state.subscription.editingPlan,
    showPlanModal: state.subscription.showPlanModal,
    isLoadingPlans: state.subscription.isLoadingPlans,
    plansError: state.subscription.plansError,
    user: state.auth.user
  }));

  const [activeTab, setActiveTab] = useState('plans');

  useEffect(() => {
    // Check if user is authenticated and has super-admin role
    if (!user || user.role !== 'super-admin') {
      navigate('/super-admin/login');
      return;
    }

    // Fetch plans
    dispatch(fetchPlansRequest());
  }, [dispatch, navigate, user]);

  const handleCreatePlan = () => {
    dispatch(showCreatePlanModal());
  };

  const handleEditPlan = (plan) => {
    dispatch(showEditPlanModal(plan));
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      dispatch(deletePlanRequest(planId));
    }
  };

  const handleCloseModal = () => {
    dispatch(hidePlanModal());
  };

  if (!user || user.role !== 'super-admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 break-words">
                Subscription Management
              </h1>
              <p className="text-purple-100 text-sm sm:text-base lg:text-lg leading-relaxed">
                Define and manage subscription plans for your tenants
              </p>
              <div className="flex items-center mt-3 sm:mt-4 space-x-2 text-xs sm:text-sm">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                <span>System Active</span>
              </div>
            </div>
            <div className="hidden lg:flex flex-shrink-0">
              <div className="bg-white bg-opacity-10 rounded-lg p-3 lg:p-4 xl:p-6">
                <i className="fas fa-credit-card text-2xl lg:text-3xl text-white opacity-80"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {plansError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0 text-sm sm:text-base"></i>
                <div className="min-w-0 flex-1">
                  <h3 className="text-red-800 font-medium text-sm sm:text-base">Error</h3>
                  <p className="text-red-700 text-xs sm:text-sm break-words mt-1">{plansError}</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(clearErrors())}
                className="text-red-400 hover:text-red-600 text-lg sm:text-xl font-bold flex-shrink-0 p-1"
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 bg-white rounded-t-lg sm:rounded-t-xl overflow-hidden">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm lg:text-base transition-colors duration-200 ${
                activeTab === 'plans'
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-layer-group text-xs sm:text-sm lg:text-base flex-shrink-0"></i>
              <span className="text-center leading-tight">
                <span className="hidden sm:inline">Subscription </span>Plans
              </span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm lg:text-base transition-colors duration-200 ${
                activeTab === 'assignments'
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-users text-xs sm:text-sm lg:text-base flex-shrink-0"></i>
              <span className="text-center leading-tight">
                <span className="hidden sm:inline">Tenant </span>Assignments
              </span>
            </button>
          </nav>
        </div>

        {/* Plans Tab Content */}
        {activeTab === 'plans' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                  Subscription Plans
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                  Create and manage subscription plans with different feature sets
                </p>
              </div>
              <Button
                onClick={handleCreatePlan}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm lg:text-base flex-shrink-0 w-full sm:w-auto justify-center"
              >
                <i className="fas fa-plus mr-1 sm:mr-2"></i>
                <span className="hidden xs:inline">Create </span>New Plan
              </Button>
            </div>

            {/* Plans Grid */}
            {isLoadingPlans ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-5 xl:p-6 animate-pulse">
                    <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 rounded w-16 sm:w-20 lg:w-24 mb-2 sm:mb-3 lg:mb-4"></div>
                    <div className="h-5 sm:h-6 lg:h-7 xl:h-8 bg-gray-200 rounded w-10 sm:w-12 lg:w-16 mb-2 sm:mb-3 lg:mb-4"></div>
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 lg:mb-6">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="h-7 sm:h-8 lg:h-9 bg-gray-200 rounded flex-1"></div>
                      <div className="h-7 sm:h-8 lg:h-9 bg-gray-200 rounded w-full sm:w-12 lg:w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : plans && plans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="w-full transform transition-all duration-200 hover:scale-[1.02]">
                    <PlanCard
                      plan={plan}
                      onEdit={handleEditPlan}
                      onDelete={handleDeletePlan}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 lg:py-12 xl:py-16 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                <div className="max-w-xs sm:max-w-sm lg:max-w-md mx-auto px-3 sm:px-4 lg:px-6">
                  <i className="fas fa-layer-group text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-gray-300 mb-2 sm:mb-3 lg:mb-4 xl:mb-6"></i>
                  <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 lg:mb-3 break-words">
                    No Plans Created
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-6 leading-relaxed">
                    Create your first subscription plan to get started with tenant management
                  </p>
                  <Button
                    onClick={handleCreatePlan}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base w-full sm:w-auto justify-center"
                  >
                    <i className="fas fa-plus mr-1 sm:mr-2"></i>
                    Create First Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab Content */}
        {activeTab === 'assignments' && (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            <div className="mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
              <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                Tenant Plan Assignments
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                Assign subscription plans to tenants and manage their access levels
              </p>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
              <div className="w-full overflow-x-auto">
                <TenantPlanAssignment />
              </div>
            </div>
          </div>
        )}

        {/* Plan Modal */}
        {showPlanModal && (
          <PlanModal
            isOpen={showPlanModal}
            onClose={handleCloseModal}
            plan={editingPlan}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default SubscriptionManagement;

