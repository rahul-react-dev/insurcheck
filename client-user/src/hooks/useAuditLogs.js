import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
// import { exportToPDF, exportToExcel, exportToCSV } from '../utils/exportUtils'; // Temporarily disabled

/**
 * Custom hook for managing audit logs data and operations
 */
export const useAuditLogs = () => {
  const { token } = useSelector((state) => state.auth);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    documentName: '',
    userEmail: '',
    actionPerformed: '',
    startDate: '',
    endDate: ''
  });

  // API base configuration
  const apiConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  /**
   * Fetch audit logs from API
   */
  const fetchLogs = useCallback(async (customFilters = {}, customPagination = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: customPagination.page || pagination.page,
        limit: customPagination.limit || pagination.limit,
        ...filters,
        ...customFilters
      };

      // Remove empty filters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      console.log('🔍 Fetching audit logs with params:', cleanParams);

      const response = await axios.get('/api/user/activity-logs', {
        params: cleanParams,
        ...apiConfig
      });

      if (response.data.data) {
        // Map server data to match frontend expectations
        const mappedData = response.data.data.map(log => ({
          id: log.id,
          logId: log.id ? String(log.id).slice(0, 8) : 'N/A', // Convert to string first to avoid crash
          documentName: log.documentName || log.affectedDocument || 'N/A',
          version: log.version || '1.0', // Default version
          actionPerformed: log.action || log.actionPerformed || 'Unknown Action',
          timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
          userEmail: log.userEmail || 'System',
          action: 'View', // Default action for UI
          details: log.details || 'No details available',
          level: log.level || 'info',
          resource: log.resource || 'document',
          ipAddress: log.ipAddress || 'Unknown'
        }));
        
        setData(mappedData);
        setPagination(response.data.pagination || pagination);
        
        console.log(`✅ Loaded ${mappedData.length} audit logs`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching audit logs:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view audit logs.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid request parameters.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to load audit logs. Please try again.');
      }
      
      setData([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, token]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
    fetchLogs({}, { page });
  }, [fetchLogs]);

  /**
   * Handle limit change
   */
  const handleLimitChange = useCallback((limit) => {
    const newPagination = { page: 1, limit };
    setPagination(prev => ({ ...prev, ...newPagination }));
    fetchLogs({}, newPagination);
  }, [fetchLogs]);

  /**
   * Handle sorting - Map frontend sort keys to backend fields
   */
  const handleSort = useCallback((sortBy, sortOrder) => {
    // Map frontend sort keys to backend database fields
    const sortFieldMap = {
      'logId': 'id',
      'timestamp': 'timestamp', // Backend uses timestamp, not createdAt for this endpoint
      'documentName': 'documentName'
    };
    
    const backendSortBy = sortFieldMap[sortBy] || sortBy;
    const newFilters = { ...filters, sortBy: backendSortBy, sortOrder };
    setFilters(newFilters);
    fetchLogs(newFilters, { page: 1 });
  }, [filters, fetchLogs]);

  /**
   * Handle search and filtering
   */
  const handleSearch = useCallback((searchFilters) => {
    const newFilters = { ...filters, ...searchFilters };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs(newFilters, { page: 1 });
  }, [filters, fetchLogs]);

  /**
   * Handle export functionality - Temporarily Disabled
   */
  const handleExport = useCallback(async (format, exportFilters = {}) => {
    // Export functionality temporarily disabled
    console.log('Export feature is temporarily disabled');
    return Promise.resolve();
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: '',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      documentName: '',
      userEmail: '',
      actionPerformed: '',
      startDate: '',
      endDate: ''
    };
    setFilters(defaultFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs(defaultFilters, { page: 1 });
  }, [fetchLogs]);

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]); // Only depend on token to avoid unnecessary refetches

  // Return hook interface
  return {
    // Data
    data,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    handlePageChange,
    handleLimitChange,
    handleSort,
    handleSearch,
    handleExport,
    refresh,
    resetFilters,
    
    // Utils
    hasData: data.length > 0,
    isEmpty: !loading && data.length === 0 && !error
  };
};