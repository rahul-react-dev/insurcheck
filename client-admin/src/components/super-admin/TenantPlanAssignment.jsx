
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { assignPlanToTenantRequest } from '../../store/super-admin/subscriptionSlice';

const TenantPlanAssignment = () => {
  const dispatch = useDispatch();
  const { tenants, plans, isAssigning, assignmentError } = useSelector(state => state.subscription);
  
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showAssignmentSection, setShowAssignmentSection] = useState(false);

  const handleAssignPlan = () => {
    if (!selectedTenant || !selectedPlan) {
      alert('Please select both tenant and plan');
      return;
    }

    dispatch(assignPlanToTenantRequest({
      tenantId: parseInt(selectedTenant),
      planId: parseInt(selectedPlan)
    }));

    setSelectedTenant('');
    setSelectedPlan('');
    setShowAssignmentSection(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tenant Plan Management</h2>
        <Button
          onClick={() => setShowAssignmentSection(!showAssignmentSection)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
        >
          <i className="fas fa-plus mr-2"></i>
          Assign Plan
        </Button>
      </div>

      {assignmentError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-700">{assignmentError}</p>
        </div>
      )}

      {showAssignmentSection && (
        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assign Plan to Tenant
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tenant
              </label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose tenant...</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plan
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose plan...</option>
                {plans.filter(plan => plan.isActive).map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} (${plan.price}/{plan.billingCycle.toLowerCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAssignPlan}
                disabled={!selectedTenant || !selectedPlan || isAssigning}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 disabled:opacity-50"
              >
                {isAssigning ? 'Assigning...' : 'Assign Plan'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tenant List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tenants.map(tenant => (
          <Card key={tenant.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                <p className="text-sm text-gray-600">{tenant.email}</p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                  tenant.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tenant.status}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Created</div>
                <div className="text-sm font-medium">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Users:</span>
                  <span className="ml-2 font-medium">{tenant.userCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Documents:</span>
                  <span className="ml-2 font-medium">{tenant.documentCount}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Current Plan</div>
                  <div className="text-sm text-gray-600">
                    {tenant.plan ? tenant.plan.name : 'No plan assigned'}
                  </div>
                  {tenant.plan && (
                    <div className="text-xs text-blue-600">
                      ${tenant.plan.price}/month
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTenant(tenant.id.toString());
                      setShowAssignmentSection(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Change Plan
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TenantPlanAssignment;
