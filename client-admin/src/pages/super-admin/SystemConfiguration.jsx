import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSystemConfigRequest } from '../../store/super-admin/systemConfigSlice';
import SystemConfigurationFilters from '../../components/super-admin/SystemConfigurationFilters';
import SystemConfigurationTable from '../../components/super-admin/SystemConfigurationTable';
import { CardSkeleton } from '../../components/ui/SkeletonLoader';
import Toast from '../../components/ui/Toast';

const SystemConfiguration = () => {
  const dispatch = useDispatch();
  
  const {
    isLoading,
    error,
    updateSuccess,
    createSuccess
  } = useSelector(state => state.systemConfig);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    dispatch(fetchSystemConfigRequest());
  }, [dispatch]);

  // Handle toast notifications
  useEffect(() => {
    if (updateSuccess) {
      setToastMessage('System configuration updated successfully');
      setToastType('success');
      setShowToast(true);
    } else if (createSuccess) {
      setToastMessage('System configuration created successfully');
      setToastType('success');
      setShowToast(true);
    } else if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [updateSuccess, createSuccess, error]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
          <p className="mt-2 text-gray-600">Loading system configurations...</p>
        </div>
        <div className="space-y-6">
          <CardSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
            <p className="mt-2 text-gray-600">
              Manage system-wide settings and configurations for InsurCheck platform.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SystemConfigurationFilters />

      {/* Configuration Table */}
      <SystemConfigurationTable />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={4000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default SystemConfiguration;