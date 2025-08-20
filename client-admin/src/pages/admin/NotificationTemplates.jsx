import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/use-toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  History, 
  Mail,
  Filter,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Activity,
  Bell,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export function NotificationTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [templateType, setTemplateType] = useState('');
  const [isActive, setIsActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [auditTemplateId, setAuditTemplateId] = useState(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState(null);

  // Template type configurations
  const templateTypeConfig = {
    compliance_result: {
      icon: Shield,
      label: 'Compliance Result',
      color: 'bg-blue-100 text-blue-800',
      description: 'Notifications sent when compliance checks are completed'
    },
    audit_log: {
      icon: Activity,
      label: 'Audit Log',
      color: 'bg-purple-100 text-purple-800',
      description: 'Notifications for audit trail events and security logs'
    },
    user_notification: {
      icon: Bell,
      label: 'User Notification',
      color: 'bg-green-100 text-green-800',
      description: 'General user notifications and account updates'
    },
    system_alert: {
      icon: AlertTriangle,
      label: 'System Alert',
      color: 'bg-red-100 text-red-800',
      description: 'System maintenance and critical alerts'
    }
  };

  // Query parameters object
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: search.trim(),
    sortBy,
    sortOrder,
    templateType,
    isActive,
  }), [currentPage, pageSize, search, sortBy, sortOrder, templateType, isActive]);

  // Fetch templates
  const {
    data: templatesResponse,
    isLoading: isLoadingTemplates,
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ['notificationTemplates', queryParams],
    queryFn: () => adminAPI.getNotificationTemplates(queryParams),
    keepPreviousData: true,
  });

  // Fetch statistics
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['notificationTemplateStats'],
    queryFn: () => adminAPI.getNotificationTemplateStats(),
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId) => adminAPI.deleteNotificationTemplate(templateId),
    onSuccess: () => {
      toast({
        title: 'Template deleted',
        description: 'The notification template has been successfully deleted.',
      });
      queryClient.invalidateQueries(['notificationTemplates']);
      queryClient.invalidateQueries(['notificationTemplateStats']);
      setDeleteTemplateId(null);
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete template. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handler functions
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleShowAuditLogs = (templateId = null) => {
    setAuditTemplateId(templateId);
    setIsAuditLogsOpen(true);
  };

  const handleDeleteTemplate = (templateId) => {
    setDeleteTemplateId(templateId);
  };

  const confirmDelete = () => {
    if (deleteTemplateId) {
      deleteTemplateMutation.mutate(deleteTemplateId);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setTemplateType('');
    setIsActive('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const refreshData = () => {
    refetchTemplates();
    refetchStats();
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, templateType, isActive]);

  const templates = templatesResponse?.data || [];
  const meta = templatesResponse?.meta || {};
  const stats = statsResponse?.data || {};

  const SortButton = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center gap-1">
        {children}
        {sortBy === field && (
          sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        )}
      </span>
    </Button>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Templates</h1>
          <p className="text-gray-600">
            Create and manage email templates for compliance results, audit logs, and system notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Templates</h3>
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              stats.total || 0
            )}
          </div>
          <p className="text-xs text-gray-500">Across all types</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Templates</h3>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold">
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              stats.active || 0
            )}
          </div>
          <p className="text-xs text-gray-500">Ready to use</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Inactive Templates</h3>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              stats.inactive || 0
            )}
          </div>
          <p className="text-xs text-gray-500">Disabled templates</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Compliance Templates</h3>
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">
            {isLoadingStats ? (
              <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
            ) : (
              (stats.byType?.compliance_result || 0) + (stats.byType?.audit_log || 0)
            )}
          </div>
          <p className="text-xs text-gray-500">Compliance related</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Filter Templates</h3>
        <p className="text-sm text-gray-500 mb-4">Search and filter notification templates</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, subject, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Template Type</label>
            <select 
              value={templateType} 
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All types</option>
              <option value="compliance_result">Compliance Result</option>
              <option value="audit_log">Audit Log</option>
              <option value="user_notification">User Notification</option>
              <option value="system_alert">System Alert</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select 
              value={isActive} 
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Templates List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Templates ({meta.total || 0})</h3>
            <p className="text-sm text-gray-500">
              {meta.total ? `Page ${meta.page} of ${meta.totalPages}` : 'No templates found'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleShowAuditLogs(null)}>
            <History className="h-4 w-4 mr-2" />
            View All Audit Logs
          </Button>
        </div>

        {templatesError && (
          <div className="text-center py-6 text-red-600">
            Error loading templates: {templatesError.message}
          </div>
        )}

        {/* Templates Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="name">Name</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="templateType">Type</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="subject">Subject</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">
                  <SortButton field="createdAt">Created</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-600">Created By</th>
                <th className="text-right p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTemplates ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-6 w-24 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No notification templates found. Create your first template to get started.
                  </td>
                </tr>
              ) : (
                templates.map((template) => {
                  const typeConfig = templateTypeConfig[template.templateType] || templateTypeConfig.user_notification;
                  const IconComponent = typeConfig.icon;

                  return (
                    <tr key={template.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium">{template.name}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate">
                        {template.subject}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {template.createdByName || 'Unknown'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewTemplate(template)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowAuditLogs(template.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, meta.total)} of {meta.total} templates
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === meta.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteTemplateId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Template</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this notification template? This action cannot be undone.
              All future notifications using this template will be affected.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                onClick={() => setDeleteTemplateId(null)}
                variant="outline"
                disabled={deleteTemplateMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteTemplateMutation.isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteTemplateMutation.isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Template'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}