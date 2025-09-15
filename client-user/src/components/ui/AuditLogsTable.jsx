import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  User,
  Eye,
  Mail,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import Button from './Button';
import Input from './Input';
import LoadingSkeleton from './LoadingSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { viewSingleLogAsPDF } from '../../utils/exportUtils';

const AuditLogsTable = ({ 
  data = [], 
  loading = false, 
  error = null,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 0 },
  onPageChange,
  onLimitChange,
  onSort,
  onSearch,
  onExport,
  filters = {}
}) => {
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [exportLoading, setExportLoading] = useState(false);

  // Search form (simplified - filters removed)
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      search: filters.search || ''
    }
  });

  const watchedValues = watch();

  // Handle search form submission
  const onSearchSubmit = (data) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value && value.trim())
    );
    onSearch?.(cleanFilters);
  };

  // Handle sort
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  // Handle export
  const handleExport = async (format) => {
    if (!onExport) return;
    
    setExportLoading(true);
    try {
      await onExport(format, watchedValues);
      toast({
        type: 'success',
        title: 'Export Successful',
        description: `Audit logs exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Export Failed',
        description: `Failed to export ${format.toUpperCase()}. Please try again.`
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    reset({ search: '' });
    onSearch?.({ search: '' }); // Explicitly pass empty search
  };

  // Handle individual log PDF viewer
  const handleViewLogPDF = async (log) => {
    try {
      setExportLoading(true);
      const result = await viewSingleLogAsPDF(log);
      
      toast({
        type: 'success',
        title: 'PDF Opened',
        description: 'Audit log PDF has been opened in a new tab.'
      });
    } catch (error) {
      console.error('PDF viewer error:', error);
      toast({
        type: 'error',
        title: 'PDF Viewer Failed',
        description: error.message || 'Failed to open PDF viewer. Please try again.'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Handle email audit log
  const handleEmailLog = async (log) => {
    try {
      setExportLoading(true);
      
      // Show sending toast immediately
      toast({
        type: 'info',
        title: 'Sending Email...',
        description: 'Preparing to send audit log details to your email address.'
      });
      
      // Make API request to send email
      const response = await fetch('/api/user/audit-logs/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ logId: log.id })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          type: 'success',
          title: 'Email Sent Successfully',
          description: 'Audit log details with PDF attachment have been sent to your registered email address.'
        });
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email audit log error:', error);
      toast({
        type: 'error',
        title: 'Email Failed', 
        description: error.message || 'Failed to send audit log email. Please try again.'
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // Pagination info
  const startEntry = (pagination.page - 1) * pagination.limit + 1;
  const endEntry = Math.min(pagination.page * pagination.limit, pagination.total);

  // Table columns configuration
  const columns = [
    { key: 'id', label: 'Log ID', sortable: true, width: 'w-32' },
    { key: 'action', label: 'Action', sortable: true, width: 'w-40' },
    { key: 'resource', label: 'Resource', sortable: true, width: 'w-32' },
    { key: 'level', label: 'Level', sortable: false, width: 'w-24' },
    { key: 'ipAddress', label: 'IP Address', sortable: false, width: 'w-32' },
    { key: 'createdAt', label: 'Timestamp', sortable: true, width: 'w-44' },
    { key: 'actions', label: 'Actions', sortable: false, width: 'w-24' }
  ];

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center" data-testid="error-message">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Audit Logs</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Enhanced Header with Gradient */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900" data-testid="text-audit-logs-title">
              Audit Logs and Version History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track document activities and system events
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Enhanced Search */}
            <form onSubmit={handleSubmit(onSearchSubmit)} className="flex-1 sm:flex-none">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  {...register('search')}
                  placeholder="Search documents, users, or actions..."
                  className="pl-10 w-full sm:w-80 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  data-testid="input-search"
                />
                {watchedValues.search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
            
            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('csv')}
                disabled={exportLoading || loading || data.length === 0}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport('excel')}
                disabled={exportLoading || loading || data.length === 0}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
                data-testid="button-export-excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results Summary */}
        {watchedValues.search && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Searching for: <span className="font-medium text-gray-900">"{watchedValues.search}"</span>
                </span>
              </div>
              <button
                onClick={clearSearch}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Clear search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={pagination.limit} cols={7} />
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center" data-testid="text-no-data">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs available</h3>
            <p className="text-gray-600">
              {watchedValues.search 
                ? `No audit logs found matching "${watchedValues.search}".`
                : "There are no audit logs to display."
              }
            </p>
          </div>
        ) : (
          <table className="w-full" data-testid="table-audit-logs">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr className="border-b border-gray-200">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.width} ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors duration-150' : ''
                    }`}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    data-testid={`header-${column.key}`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-blue-50/50 hover:shadow-sm transition-all duration-200 border-b border-gray-100 last:border-b-0"
                  data-testid={`row-log-${log.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm" data-testid={`text-log-id-${log.id}`}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #{log.id ? String(log.id).slice(0, 8) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-action-${log.id}`}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {log.action || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-resource-${log.id}`}>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-xs" title={log.resource}>
                        {log.resource || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-level-${log.id}`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.level === 'error' ? 'bg-red-100 text-red-800' :
                      log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      log.level === 'critical' ? 'bg-red-200 text-red-900' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.level || 'info'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-ip-address-${log.id}`}>
                    {log.ipAddress || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-timestamp-${log.id}`}>
                    {log.createdAt ? format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`button-actions-${log.id}`}>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200" 
                        title="View Details as PDF"
                        onClick={() => handleViewLogPDF(log)}
                        disabled={exportLoading}
                        data-testid={`button-view-pdf-${log.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-green-100 hover:text-green-700 transition-colors duration-200" 
                        title="Email Audit Log Details"
                        onClick={() => handleEmailLog(log)}
                        disabled={exportLoading}
                        data-testid={`button-email-log-${log.id}`}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Entries per page */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={pagination.limit}
                onChange={(e) => onLimitChange?.(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-page-limit"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-gray-700" data-testid="text-pagination-info">
              Showing {startEntry} to {endEntry} of {pagination.total} entries
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = Math.max(1, pagination.page - 2) + i;
                  if (page > pagination.totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      className="min-w-[2.5rem]"
                      data-testid={`button-page-${page}`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
                data-testid="button-next-page"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsTable;