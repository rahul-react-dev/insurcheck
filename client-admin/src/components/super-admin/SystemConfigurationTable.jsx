import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSystemConfigRequest, createSystemConfigRequest, resetSuccessStates } from '../../store/super-admin/systemConfigSlice';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { TableSkeleton } from '../ui/SkeletonLoader';
import Toast from '../ui/Toast';

const SystemConfigurationTable = () => {
  const dispatch = useDispatch();
  const { 
    configs, 
    totalConfigs, 
    pagination, 
    isLoading, 
    isUpdating, 
    isCreating,
    updateSuccess,
    createSuccess,
    error 
  } = useSelector(state => state.systemConfig);

  const [editingConfig, setEditingConfig] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    category: 'storage'
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Show toast notifications
  React.useEffect(() => {
    if (updateSuccess) {
      setToastMessage('Configuration updated successfully');
      setToastType('success');
      setShowToast(true);
      setEditingConfig(null);
      dispatch(resetSuccessStates());
    } else if (createSuccess) {
      setToastMessage('Configuration created successfully');
      setToastType('success');
      setShowToast(true);
      setShowCreateForm(false);
      setNewConfig({ key: '', value: '', description: '', category: 'storage' });
      dispatch(resetSuccessStates());
    } else if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [updateSuccess, createSuccess, error, dispatch]);

  const handleEdit = (config) => {
    setEditingConfig(config.id);
    setEditedValues({
      [config.id]: {
        value: config.value?.toString() || '',
        description: config.description || '',
        category: config.category || 'storage'
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setEditedValues({});
  };

  const handleSaveEdit = (config) => {
    const editedData = editedValues[config.id];
    if (editedData) {
      dispatch(updateSystemConfigRequest({
        key: config.key,
        value: editedData.value,
        description: editedData.description,
        category: editedData.category
      }));
    }
  };

  const handleInputChange = (configId, field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [configId]: {
        ...prev[configId],
        [field]: value
      }
    }));
  };

  const handleCreateConfig = () => {
    dispatch(createSystemConfigRequest(newConfig));
  };

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value?.toString() || 'N/A';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            System Configurations ({totalConfigs})
          </h3>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            disabled={isCreating}
          >
            {isCreating ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <i className="fas fa-plus mr-2"></i>
            )}
            Add Configuration
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Create New Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Configuration key"
                value={newConfig.key}
                onChange={(e) => setNewConfig(prev => ({ ...prev, key: e.target.value }))}
              />
              <Input
                placeholder="Value"
                value={newConfig.value}
                onChange={(e) => setNewConfig(prev => ({ ...prev, value: e.target.value }))}
              />
              <select
                value={newConfig.category}
                onChange={(e) => setNewConfig(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="storage">Storage</option>
                <option value="tenant">Tenant</option>
                <option value="email">Email</option>
                <option value="maintenance">Maintenance</option>
                <option value="security">Security</option>
                <option value="features">Features</option>
              </select>
              <Input
                placeholder="Description"
                value={newConfig.description}
                onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="mt-4 flex space-x-3">
              <Button
                onClick={handleCreateConfig}
                disabled={isCreating || !newConfig.key || !newConfig.value}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                {isCreating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Create
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configuration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{config.key}</div>
                      <div className="text-sm text-gray-500">{config.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingConfig === config.id ? (
                      <Input
                        value={editedValues[config.id]?.value || ''}
                        onChange={(e) => handleInputChange(config.id, 'value', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{formatValue(config.value)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingConfig === config.id ? (
                      <select
                        value={editedValues[config.id]?.category || config.category}
                        onChange={(e) => handleInputChange(config.id, 'category', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="storage">Storage</option>
                        <option value="tenant">Tenant</option>
                        <option value="email">Email</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="security">Security</option>
                        <option value="features">Features</option>
                      </select>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {config.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {config.updatedAt ? formatDate(config.updatedAt) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {editingConfig === config.id ? (
                        <>
                          <Button
                            onClick={() => handleSaveEdit(config)}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
                          >
                            {isUpdating ? <LoadingSpinner size="sm" className="mr-1" /> : <i className="fas fa-save mr-1"></i>}
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleEdit(config)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {configs.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <i className="fas fa-cog text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or create a new configuration.</p>
          </div>
        )}

        {/* Pagination info */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700">
            Showing {configs.length} of {pagination.totalItems} configurations
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={4000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default SystemConfigurationTable;