import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  FileText,
  Calendar,
  User,
  Eye,
  Mail,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import Button from './Button';
import Input from './Input';
import { Skeleton } from './LoadingSkeleton';
import { useToast } from '../../hooks/use-toast';

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
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Search form
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      search: filters.search || '',
      documentName: filters.documentName || '',
      userEmail: filters.userEmail || '',
      actionPerformed: filters.actionPerformed || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || ''
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

  // Clear filters
  const clearFilters = () => {
    reset({
      search: '',
      documentName: '',
      userEmail: '',
      actionPerformed: '',
      startDate: '',
      endDate: ''
    });
    onSearch?.({});
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
    { key: 'logId', label: 'Log ID', sortable: true, width: 'w-24' },
    { key: 'documentName', label: 'Document Name', sortable: true, width: 'w-48' },
    { key: 'version', label: 'Version', sortable: false, width: 'w-20' },
    { key: 'actionPerformed', label: 'Action Performed', sortable: false, width: 'w-40' },
    { key: 'timestamp', label: 'Timestamp', sortable: true, width: 'w-44' },
    { key: 'userEmail', label: 'User Email', sortable: false, width: 'w-48' },
    { key: 'action', label: 'Action', sortable: false, width: 'w-24' }
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
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
            {/* Search */}
            <form onSubmit={handleSubmit(onSearchSubmit)} className="flex-1 sm:flex-none">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  {...register('search')}
                  placeholder="Search by document or user..."
                  className="pl-10 w-full sm:w-64"
                  data-testid="input-search"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
              data-testid="button-filter-toggle"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            {/* Export Dropdown */}
            <div className="relative group">
              <Button
                variant="primary"
                disabled={exportLoading || data.length === 0}
                className="flex items-center space-x-2"
                data-testid="button-export"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {/* Export Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exportLoading}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    data-testid="button-export-pdf"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exportLoading}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    data-testid="button-export-csv"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={exportLoading}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    data-testid="button-export-excel"
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Export as Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <form onSubmit={handleSubmit(onSearchSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  {...register('documentName')}
                  placeholder="Document Name"
                  icon={FileText}
                  data-testid="input-document-name"
                />
                <Input
                  {...register('userEmail')}
                  placeholder="User Email"
                  icon={User}
                  data-testid="input-user-email"
                />
                <Input
                  {...register('actionPerformed')}
                  placeholder="Action Performed"
                  icon={Eye}
                  data-testid="input-action-performed"
                />
                <Input
                  {...register('startDate')}
                  type="date"
                  placeholder="Start Date"
                  icon={Calendar}
                  data-testid="input-start-date"
                />
                <Input
                  {...register('endDate')}
                  type="date"
                  placeholder="End Date"
                  icon={Calendar}
                  data-testid="input-end-date"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" size="sm" data-testid="button-apply-filters">
                    Apply Filters
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                    Clear
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: pagination.limit || 10 }).map((_, index) => (
              <div key={index} className="flex space-x-4">
                {Array.from({ length: 7 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center" data-testid="text-no-data">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs available</h3>
            <p className="text-gray-600">There are no audit logs to display for the current filters.</p>
          </div>
        ) : (
          <table className="w-full" data-testid="table-audit-logs">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width} ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
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
                  className="hover:bg-gray-50"
                  data-testid={`row-log-${log.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-log-id-${log.id}`}>
                    {log.logId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-document-name-${log.id}`}>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-xs" title={log.documentName}>
                        {log.documentName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-version-${log.id}`}>
                    {log.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-action-${log.id}`}>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {log.actionPerformed}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-timestamp-${log.id}`}>
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`text-user-email-${log.id}`}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-xs" title={log.userEmail}>
                        {log.userEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid={`button-action-${log.id}`}>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="p-1" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1" title="Email">
                        <Mail className="w-4 h-4" />
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