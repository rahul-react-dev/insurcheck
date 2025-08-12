import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import ActivityLogFilters from "../../components/super-admin/ActivityLogFilters";
import ActivityLogTable from "../../components/super-admin/ActivityLogTable";
import ActivityLogDetailModal from "../../components/super-admin/ActivityLogDetailModal";
import {
  fetchActivityLogsRequest,
  setFilters,
  clearFilters,
  setSorting,
  setPage,
  setPageSize,
  setSelectedLog,
  closeDetailModal,
  exportActivityLogsRequest,
  clearErrors,
} from "../../store/super-admin/activityLogSlice";

const TenantActivityLogs = () => {
  const dispatch = useDispatch();
  const {
    activityLogs,
    isLoading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    selectedLog,
    isDetailModalOpen,
    isExporting,
    exportError,
  } = useSelector((state) => state.activityLog);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(fetchActivityLogsRequest());
  }, [dispatch, refreshKey]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchActivityLogsRequest(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchActivityLogsRequest());
  };

  const handleSort = (field, order) => {
    dispatch(setSorting({ sortBy: field, sortOrder: order }));
    dispatch(fetchActivityLogsRequest());
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchActivityLogsRequest());
  };

  const handlePageSizeChange = (newSize) => {
    dispatch(setPageSize(newSize));
    dispatch(fetchActivityLogsRequest());
  };

  const handleLogDetails = (log) => {
    dispatch(setSelectedLog(log));
  };

  const handleCloseDetailModal = () => {
    dispatch(closeDetailModal());
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    dispatch(clearErrors());
  };

  const handleExport = () => {
    dispatch(exportActivityLogsRequest());
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.tenantName) count++;
    if (filters.userEmail) count++;
    if (filters.actionPerformed) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-clipboard-list text-blue-500 mr-3 flex-shrink-0"></i>
                  <span className="truncate">Tenant Activity Logs</span>
                </h1>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">
                  Monitor and track all tenant admin and user activities across
                  the platform
                </p>

                {/* Stats */}
                <div className="mt-3 flex flex-wrap items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <i className="fas fa-database mr-1"></i>
                    Total: {pagination.total} logs
                  </span>
                  {getFilterCount() > 0 && (
                    <span className="flex items-center text-blue-600">
                      <i className="fas fa-filter mr-1"></i>
                      {getFilterCount()} filter
                      {getFilterCount() !== 1 ? "s" : ""} active
                    </span>
                  )}
                  <span className="flex items-center">
                    <i className="fas fa-sort mr-1"></i>
                    Sorted by {sortBy} ({sortOrder})
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm"
                >
                  <i
                    className={`fas fa-sync-alt mr-2 ${isLoading ? "animate-spin" : ""}`}
                  ></i>
                  Refresh
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                >
                  <i
                    className={`fas fa-download mr-2 ${isExporting ? "animate-spin" : ""}`}
                  ></i>
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Error Messages */}
            {(error || exportError) && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                  <div className="text-sm text-red-800">
                    {error && <div>Error loading logs: {error}</div>}
                    {exportError && <div>Export failed: {exportError}</div>}
                  </div>
                  <Button
                    onClick={() => dispatch(clearErrors())}
                    variant="ghost"
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filters */}
          <ActivityLogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
          />

          {/* Table */}
          <ActivityLogTable
            logs={activityLogs}
            isLoading={isLoading}
            pagination={pagination}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSort={handleSort}
            onLogDetails={handleLogDetails}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <ActivityLogDetailModal
        log={selectedLog}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default TenantActivityLogs;
