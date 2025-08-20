import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';
import  Button  from '../ui/Button';
import Badge  from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { 
  History, 
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Monitor,
  MapPin,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Calendar,
  Shield,
  Activity,
  Bell,
  AlertTriangle
} from 'lucide-react';

export function NotificationTemplateAuditLogs({ templateId, onClose }) {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    ...(templateId && { templateId })
  }), [currentPage, pageSize, templateId]);

  // Fetch audit logs
  const {
    data: logsResponse,
    isLoading: isLoadingLogs,
    error: logsError,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['notificationTemplateAuditLogs', queryParams],
    queryFn: () => adminAPI.getNotificationTemplateAuditLogs(queryParams),
    keepPreviousData: true,
  });

  // Action configurations
  const actionConfig = {
    created: {
      icon: Plus,
      label: 'Created',
      color: 'bg-green-100 text-green-800',
      description: 'Template was created'
    },
    updated: {
      icon: Edit,
      label: 'Updated',
      color: 'bg-blue-100 text-blue-800',
      description: 'Template was modified'
    },
    deleted: {
      icon: Trash2,
      label: 'Deleted',
      color: 'bg-red-100 text-red-800',
      description: 'Template was deleted'
    },
    viewed: {
      icon: Eye,
      label: 'Viewed',
      color: 'bg-gray-100 text-gray-800',
      description: 'Template was viewed'
    }
  };

  // Template type configurations
  const templateTypeConfig = {
    compliance_result: {
      icon: Shield,
      label: 'Compliance Result',
      color: 'bg-blue-100 text-blue-800',
    },
    audit_log: {
      icon: Activity,
      label: 'Audit Log',
      color: 'bg-purple-100 text-purple-800',
    },
    user_notification: {
      icon: Bell,
      label: 'User Notification',
      color: 'bg-green-100 text-green-800',
    },
    system_alert: {
      icon: AlertTriangle,
      label: 'System Alert',
      color: 'bg-red-100 text-red-800',
    }
  };

  // Helper functions
  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatJsonDiff = (oldValues, newValues) => {
    const changes = [];
    
    if (oldValues && newValues) {
      // Compare old and new values
      const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
      
      allKeys.forEach(key => {
        const oldVal = oldValues[key];
        const newVal = newValues[key];
        
        if (oldVal !== newVal) {
          changes.push({
            field: key,
            oldValue: oldVal,
            newValue: newVal,
            type: oldVal === undefined ? 'added' : newVal === undefined ? 'removed' : 'modified'
          });
        }
      });
    } else if (newValues) {
      // Creation - all fields are new
      Object.entries(newValues).forEach(([key, value]) => {
        changes.push({
          field: key,
          oldValue: undefined,
          newValue: value,
          type: 'added'
        });
      });
    }
    
    return changes;
  };

  const logs = logsResponse?.data || [];
  const meta = logsResponse?.meta || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Template Audit Logs
          </h3>
          <p className="text-sm text-muted-foreground">
            {templateId ? 'View changes for this specific template' : 'View all notification template changes'}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={refetchLogs}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Logs per page:</label>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 logs</SelectItem>
              <SelectItem value="20">20 logs</SelectItem>
              <SelectItem value="50">50 logs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Trail ({meta.total || 0})</CardTitle>
              <CardDescription>
                {meta.total ? `Page ${meta.page} of ${meta.totalPages}` : 'No audit logs found'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logsError && (
            <div className="text-center py-6 text-red-600">
              Error loading audit logs: {logsError.message}
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLogs ? (
                  Array.from({ length: pageSize }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No audit logs found for the specified criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const actionConf = actionConfig[log.action] || actionConfig.updated;
                    const ActionIcon = actionConf.icon;
                    const isExpanded = expandedLogs.has(log.id);
                    const typeConfig = templateTypeConfig[log.templateType] || templateTypeConfig.user_notification;
                    const TypeIcon = typeConfig.icon;
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="secondary" className={actionConf.color}>
                            <ActionIcon className="h-3 w-3 mr-1" />
                            {actionConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.templateName ? (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{log.templateName}</div>
                              <Badge variant="secondary" className={`${typeConfig.color} text-xs`}>
                                <TypeIcon className="h-2 w-2 mr-1" />
                                {typeConfig.label}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Template deleted</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {log.changedByName || 'System'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="space-y-1">
                            <div className="text-sm">{log.changeReason || actionConf.description}</div>
                            {log.ipAddress && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-2 w-2" />
                                {log.ipAddress}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(log.oldValues || log.newValues) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLogExpansion(log.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Expanded Details */}
            {logs.map((log) => {
              const isExpanded = expandedLogs.has(log.id);
              const changes = formatJsonDiff(log.oldValues, log.newValues);

              return isExpanded && changes.length > 0 ? (
                <Collapsible key={`${log.id}-details`} open={true}>
                  <CollapsibleContent>
                    <Card className="mt-2 ml-8">
                      <CardHeader>
                        <CardTitle className="text-sm">Change Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {changes.map((change, index) => (
                            <div key={index} className="border rounded p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="secondary"
                                  className={
                                    change.type === 'added' ? 'bg-green-100 text-green-800' :
                                    change.type === 'removed' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }
                                >
                                  {change.type}
                                </Badge>
                                <span className="font-medium text-sm capitalize">
                                  {change.field.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </div>
                              
                              <div className="grid gap-2 md:grid-cols-2">
                                {change.oldValue !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Previous Value</div>
                                    <div className="text-sm bg-red-50 border border-red-200 rounded p-2 font-mono">
                                      {typeof change.oldValue === 'string' && change.oldValue.length > 100 ? 
                                        `${change.oldValue.substring(0, 100)}...` : 
                                        JSON.stringify(change.oldValue)
                                      }
                                    </div>
                                  </div>
                                )}
                                
                                {change.newValue !== undefined && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">New Value</div>
                                    <div className="text-sm bg-green-50 border border-green-200 rounded p-2 font-mono">
                                      {typeof change.newValue === 'string' && change.newValue.length > 100 ? 
                                        `${change.newValue.substring(0, 100)}...` : 
                                        JSON.stringify(change.newValue)
                                      }
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              ) : null;
            })}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoadingLogs ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </CardContent>
                </Card>
              ))
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found for the specified criteria.
              </div>
            ) : (
              logs.map((log) => {
                const actionConf = actionConfig[log.action] || actionConfig.updated;
                const ActionIcon = actionConf.icon;
                const typeConfig = templateTypeConfig[log.templateType] || templateTypeConfig.user_notification;
                const TypeIcon = typeConfig.icon;
                const isExpanded = expandedLogs.has(log.id);
                const changes = formatJsonDiff(log.oldValues, log.newValues);

                return (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className={actionConf.color}>
                            <ActionIcon className="h-3 w-3 mr-1" />
                            {actionConf.label}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {log.templateName ? (
                          <div className="space-y-1">
                            <div className="font-medium">{log.templateName}</div>
                            <Badge variant="secondary" className={`${typeConfig.color} text-xs`}>
                              <TypeIcon className="h-2 w-2 mr-1" />
                              {typeConfig.label}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">Template deleted</div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>{log.changedByName || 'System'}</span>
                          </div>
                          
                          {(log.oldValues || log.newValues) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLogExpansion(log.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {log.changeReason || actionConf.description}
                        </div>

                        {log.ipAddress && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-2 w-2" />
                            {log.ipAddress}
                            {log.userAgent && (
                              <>
                                <Monitor className="h-2 w-2 ml-2" />
                                <span className="truncate">{log.userAgent.split(' ')[0]}</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Expanded Details for Mobile */}
                        {isExpanded && changes.length > 0 && (
                          <Card className="mt-3">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Changes Made</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                {changes.map((change, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge 
                                        variant="secondary"
                                        className={
                                          change.type === 'added' ? 'bg-green-100 text-green-800' :
                                          change.type === 'removed' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'
                                        }
                                      >
                                        {change.type}
                                      </Badge>
                                      <span className="font-medium capitalize">
                                        {change.field.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                    </div>
                                    
                                    {change.oldValue !== undefined && (
                                      <div className="text-xs text-red-600 bg-red-50 p-1 rounded mb-1">
                                        Old: {typeof change.oldValue === 'string' && change.oldValue.length > 50 ? 
                                          `${change.oldValue.substring(0, 50)}...` : 
                                          JSON.stringify(change.oldValue)
                                        }
                                      </div>
                                    )}
                                    
                                    {change.newValue !== undefined && (
                                      <div className="text-xs text-green-600 bg-green-50 p-1 rounded">
                                        New: {typeof change.newValue === 'string' && change.newValue.length > 50 ? 
                                          `${change.newValue.substring(0, 50)}...` : 
                                          JSON.stringify(change.newValue)
                                        }
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
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
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, meta.total)} of {meta.total} logs
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

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={onClose}>
          Close Audit Logs
        </Button>
      </div>
    </div>
  );
}