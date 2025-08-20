import React, { useState, useEffect } from 'react';
import AdminTenantLayout from '../../layouts/AdminTenantLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import * as adminAuthApi from '../../utils/api';

const ComplianceRules = () => {
  // State for rules data
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination and filtering states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    ruleType: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // Form states
  const [createForm, setCreateForm] = useState({
    fieldName: '',
    ruleType: 'required',
    value: '',
    description: ''
  });

  const [editForm, setEditForm] = useState({
    fieldName: '',
    ruleType: 'required',
    value: '',
    description: '',
    isActive: true
  });

  // Rule type options
  const ruleTypeOptions = [
    { value: 'required', label: 'Required Field', description: 'Field must have a value' },
    { value: 'format', label: 'Format Validation', description: 'Field must match regex pattern' },
    { value: 'range', label: 'Range Validation', description: 'Numeric field must be within range (e.g., "1-100")' },
    { value: 'length', label: 'Length Validation', description: 'Text field maximum length' },
    { value: 'custom', label: 'Custom Rule', description: 'Custom validation logic' }
  ];

  // Common field names for suggestions
  const fieldNameSuggestions = [
    'filename',
    'originalName', 
    'fileSize',
    'documentType',
    'policyNumber',
    'clientName',
    'effectiveDate',
    'expirationDate',
    'coverageAmount',
    'premium'
  ];

  // Fetch rules data
  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await adminAuthApi.getComplianceRules({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response?.success) {
        setRules(response.data);
        setPagination(prev => ({ ...prev, ...response.meta }));
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      setError('Failed to load compliance rules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await adminAuthApi.getComplianceRuleStats();
      if (response?.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchRules();
    fetchStats();
  }, [pagination.page, pagination.limit, filters]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Handle sorting
  const handleSort = (column) => {
    const newSortOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: newSortOrder
    }));
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle create rule
  const handleCreateRule = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const response = await adminAuthApi.createComplianceRule(createForm);
      
      if (response?.success) {
        if (window.showNotification) {
          window.showNotification('Rule created successfully!', 'success');
        }
        
        setCreateForm({ fieldName: '', ruleType: 'required', value: '', description: '' });
        setShowCreateModal(false);
        await fetchRules();
        await fetchStats();
      }
    } catch (error) {
      console.error('Create rule error:', error);
      if (window.showNotification) {
        window.showNotification(
          error.response?.data?.message || 'Failed to create rule. Please try again.',
          'error'
        );
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit rule
  const handleEditRule = async (e) => {
    e.preventDefault();
    if (!selectedRule) return;

    setEditLoading(true);

    try {
      const response = await adminAuthApi.updateComplianceRule(selectedRule.id, editForm);
      
      if (response?.success) {
        if (window.showNotification) {
          window.showNotification('Rule updated successfully!', 'success');
        }
        
        setShowEditModal(false);
        setSelectedRule(null);
        await fetchRules();
        await fetchStats();
      }
    } catch (error) {
      console.error('Update rule error:', error);
      if (window.showNotification) {
        window.showNotification(
          error.response?.data?.message || 'Failed to update rule. Please try again.',
          'error'
        );
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete rule
  const handleDeleteRule = async (rule) => {
    if (!window.confirm(`Are you sure you want to delete rule "${rule.ruleId}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await adminAuthApi.deleteComplianceRule(rule.id);
      
      if (response?.success) {
        if (window.showNotification) {
          window.showNotification('Rule deleted successfully!', 'success');
        }
        
        await fetchRules();
        await fetchStats();
      }
    } catch (error) {
      console.error('Delete rule error:', error);
      if (window.showNotification) {
        window.showNotification(
          error.response?.data?.message || 'Failed to delete rule. Please try again.',
          'error'
        );
      }
    }
  };

  // Handle preview rule impact
  const handlePreviewImpact = async (ruleData) => {
    setPreviewLoading(true);

    try {
      const response = await adminAuthApi.previewComplianceRule({
        fieldName: ruleData.fieldName,
        ruleType: ruleData.ruleType,
        value: ruleData.value
      });
      
      if (response?.success) {
        setPreviewData(response.data);
        setShowPreviewModal(true);
      }
    } catch (error) {
      console.error('Preview rule error:', error);
      if (window.showNotification) {
        window.showNotification(
          error.response?.data?.message || 'Failed to preview rules. Please try again.',
          'error'
        );
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle view audit logs
  const handleViewAuditLogs = async (rule) => {
    try {
      const response = await adminAuthApi.getComplianceRuleAuditLogs({
        ruleId: rule.id
      });
      
      if (response?.success) {
        setAuditLogs(response.data);
        setSelectedRule(rule);
        setShowAuditModal(true);
      }
    } catch (error) {
      console.error('Fetch audit logs error:', error);
      if (window.showNotification) {
        window.showNotification('Failed to load audit logs. Please try again.', 'error');
      }
    }
  };

  // Open edit modal
  const openEditModal = (rule) => {
    setSelectedRule(rule);
    setEditForm({
      fieldName: rule.fieldName,
      ruleType: rule.ruleType,
      value: rule.value,
      description: rule.description,
      isActive: rule.isActive
    });
    setShowEditModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get rule type label
  const getRuleTypeLabel = (ruleType) => {
    const option = ruleTypeOptions.find(opt => opt.value === ruleType);
    return option ? option.label : ruleType;
  };

  return (
    <AdminTenantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compliance Rules</h1>
              <p className="text-sm text-gray-600 mt-1">
                Define and manage document validation rules for your organization
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Create Rule</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-check text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Rules</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive || 0}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-times-circle text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rule Types</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.byType || {}).length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-tags text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search rules..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={filters.ruleType}
                onChange={(e) => setFilters(prev => ({ ...prev, ruleType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Rule Types</option>
                {ruleTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : rules.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-shield-check text-gray-400 text-3xl mb-4"></i>
                <p className="text-gray-600">No compliance rules found</p>
                <p className="text-sm text-gray-500 mt-2">Create your first rule to get started</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('ruleId')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Rule ID</span>
                          {filters.sortBy === 'ruleId' && (
                            <i className={`fas fa-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'} text-green-600`}></i>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('fieldName')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Field Name</span>
                          {filters.sortBy === 'fieldName' && (
                            <i className={`fas fa-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'} text-green-600`}></i>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('ruleType')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Rule Type</span>
                          {filters.sortBy === 'ruleType' && (
                            <i className={`fas fa-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'} text-green-600`}></i>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          {filters.sortBy === 'createdAt' && (
                            <i className={`fas fa-sort-${filters.sortOrder === 'asc' ? 'up' : 'down'} text-green-600`}></i>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{rule.ruleId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{rule.fieldName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getRuleTypeLabel(rule.ruleType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate max-w-xs" title={rule.value}>
                            {rule.value}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-xs" title={rule.description}>
                            {rule.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            rule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(rule.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handlePreviewImpact(rule)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Preview Impact"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => openEditModal(rule)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Edit Rule"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleViewAuditLogs(rule)}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded"
                              title="View Audit Logs"
                            >
                              <i className="fas fa-history"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete Rule"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{rule.ruleId}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            rule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Field:</strong> {rule.fieldName}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Type:</strong> {getRuleTypeLabel(rule.ruleType)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Value:</strong> {rule.value}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Description:</strong> {rule.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(rule.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handlePreviewImpact(rule)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded"
                          title="Preview Impact"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => openEditModal(rule)}
                          className="text-green-600 hover:text-green-900 p-2 rounded"
                          title="Edit Rule"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleViewAuditLogs(rule)}
                          className="text-purple-600 hover:text-purple-900 p-2 rounded"
                          title="View Audit Logs"
                        >
                          <i className="fas fa-history"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="text-red-600 hover:text-red-900 p-2 rounded"
                          title="Delete Rule"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === pagination.page;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${
                              isCurrentPage
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Rule Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="Create New Compliance Rule"
            maxWidth="lg"
          >
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <input
                    id="fieldName"
                    type="text"
                    required
                    value={createForm.fieldName}
                    onChange={(e) => setCreateForm({ ...createForm, fieldName: e.target.value })}
                    placeholder="Enter field name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    list="fieldNameSuggestions"
                  />
                  <datalist id="fieldNameSuggestions">
                    {fieldNameSuggestions.map(suggestion => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </div>
                
                <div>
                  <label htmlFor="ruleType" className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Type *
                  </label>
                  <select
                    id="ruleType"
                    required
                    value={createForm.ruleType}
                    onChange={(e) => setCreateForm({ ...createForm, ruleType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {ruleTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Value *
                </label>
                <input
                  id="value"
                  type="text"
                  required
                  value={createForm.value}
                  onChange={(e) => setCreateForm({ ...createForm, value: e.target.value })}
                  placeholder={
                    createForm.ruleType === 'format' ? 'Enter regex pattern (e.g., ^[A-Z]{3}-\\d{4}$)' :
                    createForm.ruleType === 'range' ? 'Enter range (e.g., 1-100)' :
                    createForm.ruleType === 'length' ? 'Enter maximum length (e.g., 255)' :
                    'Enter rule value'
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {createForm.ruleType && (
                  <p className="text-xs text-gray-500 mt-1">
                    {ruleTypeOptions.find(opt => opt.value === createForm.ruleType)?.description}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe what this rule validates and why it's important"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  Rules will be applied to future document validations. Use the preview feature to test rule impact.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePreviewImpact(createForm)}
                  disabled={!createForm.fieldName || !createForm.ruleType || !createForm.value || previewLoading}
                  className="flex items-center space-x-2"
                >
                  {previewLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Previewing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-eye"></i>
                      <span>Preview Impact</span>
                    </>
                  )}
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={createLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Create Rule
                  </Button>
                </div>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Rule Modal */}
        {showEditModal && selectedRule && (
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title={`Edit Rule ${selectedRule.ruleId}`}
            maxWidth="lg"
          >
            <form onSubmit={handleEditRule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editFieldName" className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <input
                    id="editFieldName"
                    type="text"
                    required
                    value={editForm.fieldName}
                    onChange={(e) => setEditForm({ ...editForm, fieldName: e.target.value })}
                    placeholder="Enter field name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    list="fieldNameSuggestions"
                  />
                </div>
                
                <div>
                  <label htmlFor="editRuleType" className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Type *
                  </label>
                  <select
                    id="editRuleType"
                    required
                    value={editForm.ruleType}
                    onChange={(e) => setEditForm({ ...editForm, ruleType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {ruleTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="editValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Value *
                </label>
                <input
                  id="editValue"
                  type="text"
                  required
                  value={editForm.value}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                  placeholder={
                    editForm.ruleType === 'format' ? 'Enter regex pattern (e.g., ^[A-Z]{3}-\\d{4}$)' :
                    editForm.ruleType === 'range' ? 'Enter range (e.g., 1-100)' :
                    editForm.ruleType === 'length' ? 'Enter maximum length (e.g., 255)' :
                    'Enter rule value'
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="editDescription"
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Describe what this rule validates and why it's important"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Rule is active</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Inactive rules are not applied during document validation
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePreviewImpact(editForm)}
                  disabled={!editForm.fieldName || !editForm.ruleType || !editForm.value || previewLoading}
                  className="flex items-center space-x-2"
                >
                  {previewLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Previewing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-eye"></i>
                      <span>Preview Impact</span>
                    </>
                  )}
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={editLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Update Rule
                  </Button>
                </div>
              </div>
            </form>
          </Modal>
        )}

        {/* Preview Impact Modal */}
        {showPreviewModal && previewData && (
          <Modal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            title="Rule Impact Preview"
            maxWidth="lg"
          >
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Rule Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Field:</span>
                    <span className="ml-2 font-medium">{previewData.ruleDetails.fieldName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{getRuleTypeLabel(previewData.ruleDetails.ruleType)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Value:</span>
                    <span className="ml-2 font-medium">{previewData.ruleDetails.value}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{previewData.preview.totalDocuments}</div>
                  <div className="text-sm text-blue-700">Total Documents</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{previewData.preview.compliant}</div>
                  <div className="text-sm text-green-700">Compliant</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{previewData.preview.nonCompliant}</div>
                  <div className="text-sm text-red-700">Non-Compliant</div>
                </div>
              </div>

              {previewData.preview.examples && previewData.preview.examples.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Non-Compliant Examples</h4>
                  <div className="space-y-2">
                    {previewData.preview.examples.map((example, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{example.filename}</div>
                          <div className="text-red-600 mt-1">{example.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  This preview is based on existing document metadata. Actual rule application may vary depending on document content.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Audit Logs Modal */}
        {showAuditModal && selectedRule && (
          <Modal
            isOpen={showAuditModal}
            onClose={() => setShowAuditModal(false)}
            title={`Audit Logs - ${selectedRule.ruleId}`}
            maxWidth="xl"
          >
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-history text-gray-400 text-3xl mb-4"></i>
                  <p className="text-gray-600">No audit logs found for this rule</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            log.action === 'created' ? 'bg-green-100 text-green-800' :
                            log.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'deleted' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600">by {log.changedByName}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      
                      {log.changeReason && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Reason:</strong> {log.changeReason}
                        </p>
                      )}

                      {log.oldValues && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Previous Values:</p>
                          <pre className="text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(log.oldValues, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.newValues && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">New Values:</p>
                          <pre className="text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(log.newValues, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminTenantLayout>
  );
};

export default ComplianceRules;