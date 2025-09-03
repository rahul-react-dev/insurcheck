import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSubscriptionRequest, 
  fetchAvailablePlansRequest,
  upgradePlanRequest
} from '../../store/admin/subscriptionSlice';

const Subscription = () => {
  const dispatch = useDispatch();
  const { 
    currentSubscription, 
    availablePlans, 
    isLoading, 
    error, 
    upgradePlan 
  } = useSelector((state) => state.adminSubscription);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    dispatch(fetchSubscriptionRequest());
    dispatch(fetchAvailablePlansRequest());
  }, [dispatch]);

  const handleUpgradePlan = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlan) {
      dispatch(upgradePlanRequest({ planId: selectedPlan.id }));
      setShowUpgradeModal(false);
      setSelectedPlan(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUsagePercentage = (current, max) => {
    return Math.min(100, (current / max) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Subscription</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchSubscriptionRequest())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const daysLeft = currentSubscription?.endsAt ? calculateDaysLeft(currentSubscription.endsAt) : 0;
  const userUsage = currentSubscription?.currentUsers || 0;
  const maxUsers = currentSubscription?.plan?.maxUsers || 0;
  const storageUsage = currentSubscription?.storageUsed || 0;
  const maxStorage = currentSubscription?.plan?.storageLimit || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>
            <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription?.status)}`}>
              {currentSubscription?.status?.toUpperCase() || 'UNKNOWN'}
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
            <button
              onClick={() => handleUpgradePlan(currentSubscription?.plan)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-arrow-up mr-2"></i>
              Upgrade Plan
            </button>
          </div>

          {currentSubscription?.plan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentSubscription.plan.name}
                  </h3>
                  <p className="text-gray-600">{currentSubscription.plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(currentSubscription.plan.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    /{currentSubscription.plan.billingCycle}
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSubscription.plan.features && typeof currentSubscription.plan.features === 'object' ? 
                  Object.entries(currentSubscription.plan.features).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-gray-700 capitalize">{key.replace(/_/g, ' ')}: {String(value)}</span>
                    </div>
                  )) : 
                  Array.isArray(currentSubscription.plan.features) ?
                    currentSubscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-check-circle text-green-500"></i>
                        <span className="text-gray-700 capitalize">{feature.replace(/_/g, ' ')}</span>
                      </div>
                    )) : null
                }
              </div>
            </div>
          )}
        </div>

        {/* Billing Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Started</label>
              <p className="text-gray-900">
                {currentSubscription?.startedAt ? formatDate(currentSubscription.startedAt) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Next Billing</label>
              <p className="text-gray-900">
                {currentSubscription?.endsAt ? formatDate(currentSubscription.endsAt) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Days Remaining</label>
              <div className="flex items-center space-x-2">
                <p className={`text-xl font-bold ${daysLeft < 30 ? 'text-red-600' : 'text-green-600'}`}>
                  {daysLeft}
                </p>
                <span className="text-gray-500">days</span>
              </div>
            </div>
            {daysLeft < 30 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600"></i>
                  <span className="text-sm text-yellow-800">Subscription expires soon!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Users</h3>
              <span className="text-sm text-gray-500">
                {userUsage} / {maxUsers} users
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getUsagePercentage(userUsage, maxUsers)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {Math.round(getUsagePercentage(userUsage, maxUsers))}% used
              </span>
              <span className="text-gray-600">
                {maxUsers - userUsage} remaining
              </span>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Storage</h3>
              <span className="text-sm text-gray-500">
                {storageUsage} GB / {maxStorage} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getUsagePercentage(storageUsage, maxStorage)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {Math.round(getUsagePercentage(storageUsage, maxStorage))}% used
              </span>
              <span className="text-gray-600">
                {maxStorage - storageUsage} GB remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlans?.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                plan.id === currentSubscription?.planId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.id === currentSubscription?.planId && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-500">/{plan.billingCycle}</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Max Users</span>
                    <span className="font-semibold">{plan.maxUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Storage</span>
                    <span className="font-semibold">{plan.storageLimit} GB</span>
                  </div>
                </div>

                {plan.id !== currentSubscription?.planId && (
                  <button
                    onClick={() => handleUpgradePlan(plan)}
                    disabled={upgradePlan.isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {upgradePlan.isLoading ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : null}
                    {plan.price > currentSubscription?.plan?.price ? 'Upgrade' : 'Downgrade'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-arrow-up text-blue-600 text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Plan Change
              </h3>
              <p className="text-gray-600">
                Are you sure you want to change to the {selectedPlan.name} plan?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Plan:</span>
                <span className="font-semibold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold">
                  {formatPrice(selectedPlan.price)}/{selectedPlan.billingCycle}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                disabled={upgradePlan.isLoading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {upgradePlan.isLoading ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;