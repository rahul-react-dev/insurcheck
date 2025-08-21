import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchRulesRequest,
  fetchStatsRequest,
  createRuleRequest,
  editRuleRequest,
  deleteRuleRequest,
  previewRuleRequest,
  fetchAuditLogsRequest,
  updateFilters,
  updatePagination,
  setShowCreateModal,
  setShowEditModal,
  setShowPreviewModal,
  setShowAuditModal,
  setSelectedRule,
  clearErrors
} from '../../store/admin/complianceRulesSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { 
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Tags,
  Edit,
  Trash2,
  Eye,
  History,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ComplianceRules = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const {
    rules,
    loading,
    error,
    stats,
    statsLoading,
    pagination,
    filters,
    showCreateModal,
    showEditModal,
    showPreviewModal,
    showAuditModal,
    selectedRule,
    createLoading,
    createError,
    editLoading,
    editError,
    deleteLoading,
    previewLoading,
    previewData,
    auditLogs,
    auditLoading
  } = useSelector(state => state.complianceRules);

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

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  // Rule type options with descriptions
  const ruleTypeOptions = [
    {
      value: 'required',
      label: 'Required Field',
      description: 'Field must have a value',
      icon: 'fas fa-asterisk',
      color: 'red'
    },
    {
      value: 'format',
      label: 'Format Validation',
      description: 'Field must match regex pattern',
      icon: 'fas fa-code',
      color: 'blue'
    },
    {
      value: 'range',
      label: 'Range Validation',
      description: 'Numeric field must be within range (e.g., "1-100")',
      icon: 'fas fa-arrows-alt-h',
      color: 'green'
    },
    {
      value: 'length',
      label: 'Length Validation',
      description: 'Text field maximum length',
      icon: 'fas fa-ruler',
      color: 'yellow'
    },
    {
      value: 'custom',
      label: 'Custom Rule',
      description: 'Custom validation logic',
      icon: 'fas fa-cogs',
      color: 'purple'
    }
  ];

  // Common field suggestions
  const fieldNameSuggestions = [
    'filename', 'originalName', 'fileSize', 'documentType',
    'policyNumber', 'clientName', 'effectiveDate', 'expirationDate',
    'coverageAmount', 'premium', 'deductible', 'agentName',
    'claimNumber', 'incidentDate', 'reportDate', 'status'
  ];

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchRulesRequest());
    dispatch(fetchStatsRequest());
    dispatch(clearErrors());
  }, [dispatch]);

  // Refetch data when filters/pagination change
  useEffect(() => {
    dispatch(fetchRulesRequest());
  }, [dispatch, pagination.page, pagination.limit, filters]);

  // Handle search
  const handleSearch = (e) => {
    dispatch(updateFilters({ search: e.target.value }));
  };

  // Handle sorting
  const handleSort = (field) => {
    const newSortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(updateFilters({ sortBy: field, sortOrder: newSortOrder }));
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(updatePagination({ page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    dispatch(updatePagination({ page: 1, limit: newSize }));
  };

  // Handle create rule
  const handleCreateRule = (e) => {
    e.preventDefault();
    dispatch(createRuleRequest(createForm));
  };

  // Handle edit rule
  const handleEditRule = (e) => {
    e.preventDefault();
    if (!selectedRule) return;
    
    dispatch(editRuleRequest({
      ruleId: selectedRule.id,
      ruleData: editForm
    }));
  };

  // Handle delete rule
  const handleDeleteRule = (rule) => {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  };

  // Confirm delete rule
  const confirmDeleteRule = () => {
    if (ruleToDelete) {
      dispatch(deleteRuleRequest(ruleToDelete.id));
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
    }
  };

  // Cancel delete rule
  const cancelDeleteRule = () => {
    setShowDeleteConfirm(false);
    setRuleToDelete(null);
  };

  // Handle preview rule
  const handlePreviewRule = (ruleData) => {
    dispatch(previewRuleRequest({
      fieldName: ruleData.fieldName,
      ruleType: ruleData.ruleType,
      value: ruleData.value
    }));
  };

  // Handle audit logs
  const handleViewAuditLogs = (rule) => {
    dispatch(setSelectedRule(rule));
    dispatch(setShowAuditModal(true));
    dispatch(fetchAuditLogsRequest({ ruleId: rule.id }));
  };

  // Open edit modal
  const openEditModal = (rule) => {
    dispatch(setSelectedRule(rule));
    setEditForm({
      fieldName: rule.fieldName,
      ruleType: rule.ruleType,
      value: rule.value,
      description: rule.description,
      isActive: rule.isActive
    });
    dispatch(setShowEditModal(true));
  };

  // Reset forms when modals close
  const handleCloseCreateModal = () => {
    setCreateForm({
      fieldName: '',
      ruleType: 'required',
      value: '',
      description: ''
    });
    dispatch(setShowCreateModal(false));
  };

  const handleCloseEditModal = () => {
    setEditForm({
      fieldName: '',
      ruleType: 'required',
      value: '',
      description: '',
      isActive: true
    });
    dispatch(setShowEditModal(false));
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

  // Safe JSON parse helper for audit log values
  const safeParseJSON = (value) => {
    if (!value) return null;
    
    // If it's already an object, return it
    if (typeof value === 'object') {
      return value;
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.warn('Failed to parse JSON:', error, 'Raw value:', value);
        return value; // Return the original string if parsing fails
      }
    }
    
    return value;
  };

  // Format audit log values for display
  const formatAuditLogValue = (value) => {
    const parsed = safeParseJSON(value);
    if (parsed === null || parsed === undefined) {
      return 'N/A';
    }
    
    if (typeof parsed === 'object') {
      return JSON.stringify(parsed, null, 2);
    }
    
    return String(parsed);
  };

  // Get rule type details
  const getRuleTypeDetails = (ruleType) => {
    return ruleTypeOptions.find(option => option.value === ruleType) || ruleTypeOptions[0];
  };

  // Get status icon
  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return filters.sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              Compliance Rules
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Define and manage document validation rules for your organization
            </p>
          </div>
          <Button
            onClick={() => dispatch(setShowCreateModal(true))}
            disabled={createLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {createLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="h-4 w-4" />
            )}
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
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                ) : (
                  stats.total || 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-green-600">
                {statsLoading ? (
                  <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                ) : (
                  stats.active || 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Rules</p>
              <p className="text-2xl font-bold text-red-600">
                {statsLoading ? (
                  <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                ) : (
                  stats.inactive || 0
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rule Types</p>
              <p className="text-2xl font-bold text-purple-600">
                {statsLoading ? (
                  <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                ) : (
                  Object.keys(stats.byType || {}).length
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tags className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search rules..."
              value={filters.search}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          
          <div>
            <select
              value={filters.ruleType}
              onChange={(e) => handleFilterChange('ruleType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Rule Types</option>
              {ruleTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div>
            <select
              value={pagination.limit}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading compliance rules...</p>
            </div>
          </div>
        ) : rules.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ShieldAlert className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No compliance rules found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first rule to get started with document validation
              </p>
              <Button
                onClick={() => dispatch(setShowCreateModal(true))}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Rule</span>
              </Button>
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('ruleId')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Rule ID</span>
                        {getSortIcon('ruleId')}
                      </div>
                    </th>
                    
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('fieldName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Field Name</span>
                        {getSortIcon('fieldName')}
                      </div>
                    </th>
                    
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('ruleType')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Rule Type</span>
                        {getSortIcon('ruleType')}
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created</span>
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-gray-200">
                  {rules.map((rule) => {
                    const ruleTypeDetails = getRuleTypeDetails(rule.ruleType);
                    
                    return (
                      <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {rule.ruleId}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {rule.fieldName}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-${ruleTypeDetails.color}-100 text-${ruleTypeDetails.color}-800`}>
                            <i className={`${ruleTypeDetails.icon} mr-1`}></i>
                            {ruleTypeDetails.label}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div
                            className="text-sm text-gray-900 truncate max-w-xs"
                            title={rule.value}
                          >
                            {rule.value}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div
                            className="text-sm text-gray-900 truncate max-w-xs"
                            title={rule.description}
                          >
                            {rule.description}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(rule.isActive)}
                            <span
                              className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                rule.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(rule.createdAt)}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handlePreviewRule(rule)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Preview Impact"
                              disabled={previewLoading}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => openEditModal(rule)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                              title="Edit Rule"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleViewAuditLogs(rule)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                              title="View Audit Logs"
                            >
                              <History className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteRule(rule)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Rule"
                              disabled={deleteLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {rules.map((rule) => {
                const ruleTypeDetails = getRuleTypeDetails(rule.ruleType);
                
                return (
                  <div key={rule.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="font-medium text-gray-900 text-lg">
                            {rule.ruleId}
                          </span>
                          <div className="flex items-center">
                            {getStatusIcon(rule.isActive)}
                            <span
                              className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                rule.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">Field:</strong> {rule.fieldName}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <strong className="text-gray-900 mr-2">Type:</strong>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${ruleTypeDetails.color}-100 text-${ruleTypeDetails.color}-800`}>
                              <i className={`${ruleTypeDetails.icon} mr-1`}></i>
                              {ruleTypeDetails.label}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">Value:</strong> {rule.value}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">Description:</strong> {rule.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {formatDate(rule.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handlePreviewRule(rule)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Preview Impact"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => openEditModal(rule)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Edit Rule"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleViewAuditLogs(rule)}
                          className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          title="View Audit Logs"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>

                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = pageNumber === pagination.page;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                            isCurrentPage
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
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
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
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
          onClose={handleCloseCreateModal}
          title="Create New Compliance Rule"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateRule} className="space-y-6">
            {/* Error display */}
            {createError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{createError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Field Name */}
              <div className="sm:col-span-2">
                <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name *
                </label>
                <input
                  id="fieldName"
                  type="text"
                  required
                  value={createForm.fieldName}
                  onChange={(e) => setCreateForm({ ...createForm, fieldName: e.target.value })}
                  placeholder="Enter field name (e.g., filename, documentType)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  list="fieldSuggestions"
                />
                <datalist id="fieldSuggestions">
                  {fieldNameSuggestions.map(field => (
                    <option key={field} value={field} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">
                  The document field this rule will validate
                </p>
              </div>

              {/* Rule Type */}
              <div>
                <label htmlFor="ruleType" className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Type *
                </label>
                <select
                  id="ruleType"
                  required
                  value={createForm.ruleType}
                  onChange={(e) => setCreateForm({ ...createForm, ruleType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ruleTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getRuleTypeDetails(createForm.ruleType).description}
                </p>
              </div>

              {/* Value */}
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                <input
                  id="value"
                  type="text"
                  required
                  value={createForm.value}
                  onChange={(e) => setCreateForm({ ...createForm, value: e.target.value })}
                  placeholder={
                    createForm.ruleType === 'required' ? 'true' :
                    createForm.ruleType === 'format' ? '^[A-Za-z0-9]+$' :
                    createForm.ruleType === 'range' ? '1-100' :
                    createForm.ruleType === 'length' ? '255' :
                    'Custom validation value'
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {createForm.ruleType === 'required' && 'Use "true" to make field mandatory'}
                  {createForm.ruleType === 'format' && 'Enter regex pattern to match'}
                  {createForm.ruleType === 'range' && 'Enter range like "1-100" for numeric values'}
                  {createForm.ruleType === 'length' && 'Enter maximum character length'}
                  {createForm.ruleType === 'custom' && 'Enter custom validation expression'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Describe what this rule validates and why it's important"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Clear description helps team members understand the rule purpose
              </p>
            </div>

            {/* Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Rule Preview
              </h4>
              <div className="text-sm text-blue-800">
                <p><strong>Field:</strong> {createForm.fieldName || 'Not specified'}</p>
                <p><strong>Type:</strong> {getRuleTypeDetails(createForm.ruleType).label}</p>
                <p><strong>Value:</strong> {createForm.value || 'Not specified'}</p>
                <p><strong>Description:</strong> {createForm.description || 'Not specified'}</p>
              </div>
              
              {createForm.fieldName && createForm.value && (
                <button
                  type="button"
                  onClick={() => handlePreviewRule(createForm)}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  disabled={previewLoading}
                >
                  {previewLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Preview Impact on Documents
                </button>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCloseCreateModal}
                variant="outline"
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading || !createForm.fieldName || !createForm.value || !createForm.description}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {createLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Rule'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Rule Modal */}
      {showEditModal && selectedRule && (
        <Modal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          title={`Edit Rule: ${selectedRule.ruleId}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditRule} className="space-y-6">
            {/* Error display */}
            {editError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{editError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Field Name */}
              <div className="sm:col-span-2">
                <label htmlFor="editFieldName" className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name *
                </label>
                <input
                  id="editFieldName"
                  type="text"
                  required
                  value={editForm.fieldName}
                  onChange={(e) => setEditForm({ ...editForm, fieldName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  list="fieldSuggestions"
                />
              </div>

              {/* Rule Type */}
              <div>
                <label htmlFor="editRuleType" className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Type *
                </label>
                <select
                  id="editRuleType"
                  required
                  value={editForm.ruleType}
                  onChange={(e) => setEditForm({ ...editForm, ruleType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ruleTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getRuleTypeDetails(editForm.ruleType).description}
                </p>
              </div>

              {/* Value */}
              <div>
                <label htmlFor="editValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                <input
                  id="editValue"
                  type="text"
                  required
                  value={editForm.value}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="editDescription"
                required
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Active Rule</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Inactive rules will not be applied to document validation
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCloseEditModal}
                variant="outline"
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading || !editForm.fieldName || !editForm.value || !editForm.description}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {editLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Rule'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => dispatch(setShowPreviewModal(false))}
          title="Rule Impact Preview"
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Preview Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-green-600">
                    {previewData.compliantDocuments || 0}
                  </div>
                  <div className="text-sm text-gray-600">Compliant Documents</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-red-600">
                    {previewData.nonCompliantDocuments || 0}
                  </div>
                  <div className="text-sm text-gray-600">Non-Compliant Documents</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-blue-600">
                    {previewData.complianceRate || '0'}%
                  </div>
                  <div className="text-sm text-gray-600">Compliance Rate</div>
                </div>
              </div>

              {previewData.sampleMatches && previewData.sampleMatches.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sample Affected Documents:</h4>
                  <div className="space-y-2">
                    {previewData.sampleMatches.slice(0, 5).map((doc, index) => (
                      <div key={index} className="bg-white rounded border p-3 text-sm">
                        <div className="font-medium text-gray-900">{doc.filename}</div>
                        <div className="text-gray-600">Status: {doc.wouldPass ? 'Pass' : 'Fail'}</div>
                        {doc.reason && (
                          <div className="text-gray-500 text-xs mt-1">Reason: {doc.reason}</div>
                        )}
                      </div>
                    ))}
                    {previewData.sampleMatches.length > 5 && (
                      <div className="text-sm text-gray-500 text-center">
                        ... and {previewData.sampleMatches.length - 5} more documents
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => dispatch(setShowPreviewModal(false))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
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
          onClose={() => dispatch(setShowAuditModal(false))}
          title={`Audit Logs: ${selectedRule.ruleId}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {auditLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading audit logs...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No audit logs found for this rule</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {auditLogs.map((log, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.action === 'create' ? 'bg-green-100 text-green-800' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'delete' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Changed by: {log.changedByName || 'System'}
                    </div>
                    
                    {log.oldValues && (
                      <div className="text-xs text-gray-500 mb-1">
                        <strong>Before:</strong> <pre className="mt-1 whitespace-pre-wrap">{formatAuditLogValue(log.oldValues)}</pre>
                      </div>
                    )}
                    
                    {log.newValues && (
                      <div className="text-xs text-gray-500">
                        <strong>After:</strong> <pre className="mt-1 whitespace-pre-wrap">{formatAuditLogValue(log.newValues)}</pre>
                      </div>
                    )}
                    
                    {log.changeReason && (
                      <div className="text-xs text-gray-600 mt-2">
                        <strong>Reason:</strong> {log.changeReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => dispatch(setShowAuditModal(false))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteRule}
        onConfirm={confirmDeleteRule}
        title="Delete Compliance Rule"
        message={
          ruleToDelete ? (
            <div>
              <p className="mb-3">
                Are you sure you want to delete rule <strong>"{ruleToDelete.ruleId}"</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">This action cannot be undone.</p>
                    <p>All audit logs for this rule will also be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : 'Are you sure?'
        }
        confirmText="Delete Rule"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        cancelButtonClass="bg-gray-500 hover:bg-gray-600 text-white"
        isLoading={deleteLoading}
        icon="fas fa-exclamation-triangle"
        iconClass="text-red-500"
      />
    </div>
  );
};

export default ComplianceRules;