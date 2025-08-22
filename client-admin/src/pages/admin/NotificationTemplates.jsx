import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTemplatesRequest,
  fetchStatsRequest,
  createTemplateRequest,
  updateTemplateRequest,
  deleteTemplateRequest,
  previewTemplateRequest,
  fetchAuditLogsRequest,
  clearCreateState,
  clearUpdateState,
  clearDeleteState,
  clearPreviewState,
} from '../../store/admin/notificationTemplatesSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import { useToast } from '../../hooks/use-toast';
import { 
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  AlertTriangle,
  Bell,
  Server,
  Edit2,
  Trash2,
  Eye,
  Save,
  X,
  RefreshCw,
  History,
  FileText,
  Calendar,
  User,
  Activity
} from 'lucide-react';

const NotificationTemplates = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // Redux selectors
  const {
    templates,
    templatesLoading,
    templatesError,
    templatesMeta,
    templateStats,
    statsLoading,
    createLoading,
    createSuccess,
    createError,
    updateLoading,
    updateSuccess,
    updateError,
    deleteLoading,
    deleteSuccess,
    deleteError,
    previewData,
    previewLoading,
    previewError,
    auditLogs,
    auditLogsLoading,
    auditLogsError,
    auditLogsMeta,
  } = useSelector(state => state.notificationTemplates);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [templateTypeFilter, setTemplateTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    templateType: 'compliance_result',
    name: '',
    subject: '',
    header: '',
    body: '',
    footer: '',
  });

  // Template type configurations
  const templateTypeConfig = {
    compliance_result: {
      icon: Shield,
      label: 'Compliance Result',
      description: 'Notifications sent after document compliance checks',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      variables: ['userName', 'organizationName', 'documentName', 'complianceStatus', 'rulesChecked', 'rulesPassed', 'rulesFailed', 'timestamp', 'detailsUrl']
    },
    audit_log: {
      icon: AlertTriangle,
      label: 'Audit Log',
      description: 'Notifications for audit events and changes',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      variables: ['userName', 'organizationName', 'action', 'resource', 'timestamp', 'ipAddress', 'details', 'logUrl']
    },
    user_notification: {
      icon: Bell,
      label: 'User Notification',
      description: 'General user notifications and updates',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      variables: ['userName', 'organizationName', 'notificationType', 'message', 'timestamp', 'actionRequired', 'actionUrl']
    },
    system_alert: {
      icon: Server,
      label: 'System Alert',
      description: 'System-wide alerts and maintenance notifications',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      variables: ['organizationName', 'alertType', 'severity', 'message', 'timestamp', 'affectedServices', 'statusUrl']
    },
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder, templateTypeFilter, statusFilter]);

  useEffect(() => {
    dispatch(fetchStatsRequest());
  }, [dispatch]);

  const fetchData = () => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      sortBy,
      sortOrder,
      templateType: templateTypeFilter,
      isActive: statusFilter,
    };
    dispatch(fetchTemplatesRequest(params));
  };

  // Handle success states
  useEffect(() => {
    if (createSuccess) {
      toast({
        title: 'Template created successfully',
        description: 'The notification template has been created.',
        variant: 'default',
      });
      setShowCreateModal(false);
      resetForm();
      dispatch(clearCreateState());
      dispatch(fetchStatsRequest());
      fetchData();
    }
  }, [createSuccess, dispatch, toast]);

  useEffect(() => {
    if (updateSuccess) {
      toast({
        title: 'Template updated successfully.',
        description: 'Changes have been applied to all future notifications.',
        variant: 'default',
      });
      setShowEditModal(false);
      resetForm();
      dispatch(clearUpdateState());
      dispatch(fetchStatsRequest());
      fetchData();
    }
  }, [updateSuccess, dispatch, toast]);

  useEffect(() => {
    if (deleteSuccess) {
      toast({
        title: 'Template deleted successfully',
        description: 'The notification template has been removed.',
        variant: 'default',
      });
      setShowDeleteModal(false);
      setSelectedTemplate(null);
      dispatch(clearDeleteState());
      dispatch(fetchStatsRequest());
      fetchData();
    }
  }, [deleteSuccess, dispatch, toast]);

  // Handle error states
  useEffect(() => {
    if (createError) {
      toast({
        title: 'Failed to create template',
        description: createError,
        variant: 'destructive',
      });
      dispatch(clearCreateState());
    }
  }, [createError, dispatch, toast]);

  useEffect(() => {
    if (updateError) {
      toast({
        title: 'Invalid template format. Please check inputs.',
        description: updateError,
        variant: 'destructive',
      });
      dispatch(clearUpdateState());
    }
  }, [updateError, dispatch, toast]);

  useEffect(() => {
    if (deleteError) {
      toast({
        title: 'Failed to delete template',
        description: deleteError,
        variant: 'destructive',
      });
      dispatch(clearDeleteState());
    }
  }, [deleteError, dispatch, toast]);

  useEffect(() => {
    if (previewError) {
      toast({
        title: 'Failed to preview template. Please try again.',
        description: previewError,
        variant: 'destructive',
      });
      dispatch(clearPreviewState());
    }
  }, [previewError, dispatch, toast]);

  // Form helpers
  const resetForm = () => {
    setFormData({
      templateType: 'compliance_result',
      name: '',
      subject: '',
      header: '',
      body: '',
      footer: '',
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Action handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleCreateTemplate = () => {
    const templateData = {
      templateType: formData.templateType,
      name: formData.name,
      subject: formData.subject,
      header: formData.header,
      body: formData.body,
      footer: formData.footer,
    };
    dispatch(createTemplateRequest(templateData));
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData({
      templateType: template.templateType,
      name: template.name,
      subject: template.subject,
      header: template.header || '',
      body: template.body,
      footer: template.footer || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateTemplate = () => {
    const templateData = {
      subject: formData.subject,
      header: formData.header,
      body: formData.body,
      footer: formData.footer,
    };
    dispatch(updateTemplateRequest({ id: selectedTemplate.id, templateData }));
  };

  const handleDeleteTemplate = (template) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = () => {
    dispatch(deleteTemplateRequest(selectedTemplate.id));
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    const previewData = {
      templateType: template.templateType,
      subject: template.subject,
      header: template.header,
      body: template.body,
      footer: template.footer,
    };
    dispatch(previewTemplateRequest(previewData));
    setShowPreviewModal(true);
  };

  const handleViewAuditLogs = (template) => {
    setSelectedTemplate(template);
    dispatch(fetchAuditLogsRequest({ templateId: template.id, page: 1, limit: 20 }));
    setShowAuditModal(true);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Mobile card view for small screens
  const renderMobileCard = (template) => {
    const config = templateTypeConfig[template.templateType];
    const IconComponent = config?.icon || Mail;

    return (
      <Card key={template.id} className="p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h3>
              <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${config?.color}`}>
                {config?.label}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => handlePreviewTemplate(template)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDeleteTemplate(template)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Subject:</strong> {template.subject}</p>
          <p><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
          <p><strong>Created by:</strong> {template.createdByName} {template.createdByLastName}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-1 ${template.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {template.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </Card>
    );
  };

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </Card>
  );

  const SkeletonTable = () => (
    <Card className="p-3 mb-4">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          </div>
        ))}
      </div>
    </Card>
  );

  // Loading state with skeletons
  if (templatesLoading && templates.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Configure Notification Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize email notifications for compliance results and audit logs to align with organizational branding.
          </p>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Table Skeleton */}
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Configure Notification Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize email notifications for compliance results and audit logs to align with organizational branding.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statsLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : templateStats.total}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Templates</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statsLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : templateStats.active}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Templates</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statsLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : (templateStats.byType?.compliance_result || 0)}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Audit Templates</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {statsLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : (templateStats.byType?.audit_log || 0)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-3 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <select
              value={templateTypeFilter}
              onChange={(e) => setTemplateTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="compliance_result">Compliance Result</option>
              <option value="audit_log">Audit Log</option>
              <option value="user_notification">User Notification</option>
              <option value="system_alert">System Alert</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </Card>

      {/* Templates Table - Desktop */}
      <div className="hidden lg:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Template Name {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('templateType')}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Type {getSortIcon('templateType')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('subject')}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Subject {getSortIcon('subject')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Created {getSortIcon('createdAt')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Status</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {templates.map((template) => {
                  const config = templateTypeConfig[template.templateType];
                  const IconComponent = config?.icon || Mail;

                  return (
                    <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{template.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              by {template.createdByName} {template.createdByLastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color}`}>
                          {config?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {template.subject}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          template.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewTemplate(template)}
                            title="Preview template"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            title="Edit template"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAuditLogs(template)}
                            title="View audit logs"
                          >
                            <History className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template)}
                            title="Delete template"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Templates Cards - Mobile */}
      <div className="lg:hidden">
        {templates.map(renderMobileCard)}
      </div>

      {/* Pagination */}
      {templatesMeta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, templatesMeta.total)} of {templatesMeta.total} templates
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {templatesMeta.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, templatesMeta.totalPages))}
              disabled={currentPage === templatesMeta.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && !templatesLoading && (
        <Card className="p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No templates found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || templateTypeFilter || statusFilter
              ? 'No templates match your current filters.'
              : 'Get started by creating your first notification template.'}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Card>
      )}

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Notification Template"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Type *
            </label>
            <select
              value={formData.templateType}
              onChange={(e) => handleInputChange('templateType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              {Object.entries(templateTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {templateTypeConfig[formData.templateType]?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter template name..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Line *
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Enter email subject..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Header
            </label>
            <textarea
              value={formData.header}
              onChange={(e) => handleInputChange('header', e.target.value)}
              placeholder="Enter email header..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Body *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Enter email body..."
              className="w-full min-h-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Footer
            </label>
            <textarea
              value={formData.footer}
              onChange={(e) => handleInputChange('footer', e.target.value)}
              placeholder="Enter email footer..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Available Variables:</strong>{' '}
              {templateTypeConfig[formData.templateType]?.variables.map(variable => `{{${variable}}}`).join(', ')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={createLoading || !formData.name || !formData.subject || !formData.body}
            >
              {createLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedTemplate(null);
        }}
        title="Edit Notification Template"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Template:</strong> {selectedTemplate?.name} ({templateTypeConfig[selectedTemplate?.templateType]?.label})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Line *
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Enter email subject..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Header
            </label>
            <textarea
              value={formData.header}
              onChange={(e) => handleInputChange('header', e.target.value)}
              placeholder="Enter email header..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Body *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Enter email body..."
              className="w-full min-h-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Footer
            </label>
            <textarea
              value={formData.footer}
              onChange={(e) => handleInputChange('footer', e.target.value)}
              placeholder="Enter email footer..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Available Variables:</strong>{' '}
              {templateTypeConfig[selectedTemplate?.templateType]?.variables.map(variable => `{{${variable}}}`).join(', ')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTemplate}
              disabled={updateLoading || !formData.subject || !formData.body}
            >
              {updateLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Template
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Template Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTemplate(null);
        }}
        title="Delete Notification Template"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the template "{selectedTemplate?.name}"? This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTemplate}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Template
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Template Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedTemplate(null);
          dispatch(clearPreviewState());
        }}
        title="Template Preview"
        size="lg"
      >
        <div className="space-y-4">
          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Generating preview...</span>
            </div>
          ) : previewData ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{previewData.subject}</h4>
              </div>
              <div className="space-y-4 text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-100">{previewData.header}</div>
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{previewData.body}</div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                  {previewData.footer}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No preview available</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Audit Logs Modal */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setSelectedTemplate(null);
        }}
        title={`Audit Logs - ${selectedTemplate?.name}`}
        size="xl"
      >
        <div className="space-y-4">
          {auditLogsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading audit logs...</span>
            </div>
          ) : auditLogs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.action === 'created' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          log.action === 'updated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          by {log.changedByName} {log.changedByLastName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {log.changeReason}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No audit logs found for this template</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NotificationTemplates;