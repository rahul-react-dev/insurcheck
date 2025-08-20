import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAuthApi } from "../../utils/api";
import Button from "../ui/Button";
import Card from "../ui/Card";
import {
  History,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Edit,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

export default function NotificationTemplateAuditLogs({ templateId, isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch audit logs
  const {
    data: logsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notificationTemplateAuditLogs', { templateId, search, page: currentPage, limit: pageSize }],
    queryFn: () => adminAuthApi.getNotificationTemplateAuditLogs({
      templateId,
      search: search.trim(),
      page: currentPage,
      limit: pageSize
    }),
    enabled: isOpen,
    keepPreviousData: true,
  });

  const logs = logsResponse?.data || [];
  const meta = logsResponse?.meta || {};

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Action type configurations
  const actionConfig = {
    create: {
      icon: Plus,
      label: 'Created',
      color: 'bg-green-100 text-green-800',
      description: 'Template was created'
    },
    update: {
      icon: Edit,
      label: 'Updated',
      color: 'bg-blue-100 text-blue-800',
      description: 'Template was modified'
    },
    delete: {
      icon: Trash2,
      label: 'Deleted',
      color: 'bg-red-100 text-red-800',
      description: 'Template was deleted'
    }
  };

  // Format changes for display
  const formatChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return null;

    return Object.entries(changes).map(([field, change]) => {
      const { oldValue, newValue } = change;
      return {
        field: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
        oldValue: oldValue || 'Not set',
        newValue: newValue || 'Not set'
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {templateId ? 'Template Audit Log' : 'All Template Audit Logs'}
              </h2>
              <p className="text-sm text-gray-500">
                Track all changes made to notification templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by template name, user, or action..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Logs List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6">
                {Array.from({ length: pageSize }).map((_, index) => (
                  <div key={index} className="mb-4 animate-pulse">
                    <div className="bg-gray-200 rounded h-20"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-600 mb-4">
                  Error loading audit logs: {error.message}
                </div>
                <Button onClick={refetch} size="sm">
                  Retry
                </Button>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-6 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No audit logs found</p>
                <p className="text-sm text-gray-500">
                  {search ? 'Try adjusting your search criteria.' : 'Audit logs will appear here as templates are modified.'}
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {logs.map((log, index) => {
                  const config = actionConfig[log.action] || actionConfig.update;
                  const ActionIcon = config.icon;
                  const isSelected = selectedLog?.id === log.id;

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(isSelected ? null : log)}
                      className={`cursor-pointer rounded-lg border transition-all ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                              <ActionIcon className="h-4 w-4" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                                {config.label}
                              </span>
                              <span className="text-sm text-gray-500">
                                {log.templateName || 'Unknown Template'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{log.userName || 'Unknown User'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(log.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {log.changes && (
                              <div className="text-sm text-gray-700">
                                {Object.keys(log.changes).length} field(s) modified: {' '}
                                <span className="text-gray-600">
                                  {Object.keys(log.changes).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isSelected && log.changes && (
                        <div className="border-t border-blue-200 bg-blue-25 px-4 py-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Change Details</h4>
                          <div className="space-y-3">
                            {formatChanges(log.changes).map((change, changeIndex) => (
                              <div key={changeIndex} className="bg-white rounded border border-gray-200 p-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                  {change.field}
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                  <div>
                                    <span className="text-xs text-red-600 font-medium">Previous:</span>
                                    <div className="text-sm text-gray-700 bg-red-50 p-2 rounded mt-1 border border-red-200">
                                      {change.oldValue.length > 100 
                                        ? `${change.oldValue.substring(0, 100)}...` 
                                        : change.oldValue}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-green-600 font-medium">New:</span>
                                    <div className="text-sm text-gray-700 bg-green-50 p-2 rounded mt-1 border border-green-200">
                                      {change.newValue.length > 100 
                                        ? `${change.newValue.substring(0, 100)}...` 
                                        : change.newValue}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, meta.total)} of {meta.total} logs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === meta.totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}