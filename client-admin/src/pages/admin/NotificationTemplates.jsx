import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
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
import { NotificationTemplateEditor } from '../../components/admin/NotificationTemplateEditor';
import { NotificationTemplatePreview } from '../../components/admin/NotificationTemplatePreview';
import { NotificationTemplateAuditLogs } from '../../components/admin/NotificationTemplateAuditLogs';

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
          <p className="text-muted-foreground">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                stats.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                stats.active || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Templates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                stats.inactive || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Disabled templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Templates</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                (stats.byType?.compliance_result || 0) + (stats.byType?.audit_log || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Compliance related</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Templates</CardTitle>
          <CardDescription>Search and filter notification templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="compliance_result">Compliance Result</SelectItem>
                  <SelectItem value="audit_log">Audit Log</SelectItem>
                  <SelectItem value="user_notification">User Notification</SelectItem>
                  <SelectItem value="system_alert">System Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Page Size</label>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Templates ({meta.total || 0})</CardTitle>
              <CardDescription>
                {meta.total ? `Page ${meta.page} of ${meta.totalPages}` : 'No templates found'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleShowAuditLogs(null)}>
              <History className="h-4 w-4 mr-2" />
              View All Audit Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {templatesError && (
            <div className="text-center py-6 text-red-600">
              Error loading templates: {templatesError.message}
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="name">Name</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="templateType">Type</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="subject">Subject</SortButton>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <SortButton field="createdAt">Created</SortButton>
                  </TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTemplates ? (
                  Array.from({ length: pageSize }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No notification templates found. Create your first template to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => {
                    const typeConfig = templateTypeConfig[template.templateType] || templateTypeConfig.user_notification;
                    const IconComponent = typeConfig.icon;

                    return (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={typeConfig.color}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {template.subject}
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(template.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {template.createdByName || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleShowAuditLogs(template.id)}>
                                <History className="h-4 w-4 mr-2" />
                                Audit Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoadingTemplates ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notification templates found. Create your first template to get started.
              </div>
            ) : (
              templates.map((template) => {
                const typeConfig = templateTypeConfig[template.templateType] || templateTypeConfig.user_notification;
                const IconComponent = typeConfig.icon;

                return (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant={template.isActive ? 'default' : 'secondary'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <Badge variant="secondary" className={typeConfig.color}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {typeConfig.label}
                        </Badge>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.subject}
                        </p>

                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(template.createdAt).toLocaleDateString()} by {template.createdByName || 'Unknown'}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => handlePreviewTemplate(template)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleShowAuditLogs(template.id)}>
                                <History className="h-4 w-4 mr-2" />
                                Audit Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

      {/* Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update the notification template settings and content.' : 'Create a new notification template for your organization.'}
            </DialogDescription>
          </DialogHeader>
          <NotificationTemplateEditor
            template={editingTemplate}
            onClose={() => setIsEditorOpen(false)}
            onSave={() => {
              setIsEditorOpen(false);
              queryClient.invalidateQueries(['notificationTemplates']);
              queryClient.invalidateQueries(['notificationTemplateStats']);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview how this notification template will look when sent to users
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <NotificationTemplatePreview
              template={previewTemplate}
              onClose={() => setIsPreviewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Logs Dialog */}
      <Dialog open={isAuditLogsOpen} onOpenChange={setIsAuditLogsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Audit Logs</DialogTitle>
            <DialogDescription>
              {auditTemplateId ? 'View the change history for this specific template' : 'View all notification template changes and modifications'}
            </DialogDescription>
          </DialogHeader>
          <NotificationTemplateAuditLogs
            templateId={auditTemplateId}
            onClose={() => setIsAuditLogsOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification template? This action cannot be undone.
              All future notifications using this template will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTemplateMutation.isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteTemplateMutation.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTemplateMutation.isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Template'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}