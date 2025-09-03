import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { adminAuthApi } from '../../utils/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { 
  Search,
  Download,
  UserPlus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const AdminUsers = () => {
  const { user } = useSelector(state => state.admin);
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentlyAdded: 0
  });
  const [subscriptionLimits, setSubscriptionLimits] = useState({
    currentUserCount: 0,
    maxUsers: 0,
    remainingUsers: 0,
    planName: '',
    canInviteMore: true
  });

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    role: 'user'
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: '',
    isActive: true
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        sortBy,
        sortOrder
      };

      console.log('[AdminUsers] Fetching users with params:', params);

      const response = await adminAuthApi.getUsers(params);
      
      if (response?.success) {
        setUsers(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalUsers(response.meta?.total || 0);
        console.log('[AdminUsers] Fetched users successfully:', response.data?.length);
      } else {
        setError('Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      console.error('[AdminUsers] Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await adminAuthApi.getUserStats();
      if (response?.success) {
        setUserStats(response.data);
      }
    } catch (err) {
      console.error('[AdminUsers] Error fetching user stats:', err);
    }
  };

  // Fetch subscription limits
  const fetchSubscriptionLimits = async () => {
    try {
      const response = await adminAuthApi.getSubscriptionLimits();
      if (response?.success) {
        setSubscriptionLimits(response.data);
      }
    } catch (err) {
      console.error('[AdminUsers] Error fetching subscription limits:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
    fetchSubscriptionLimits();
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  // Handle user invitation
  const handleInviteUser = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    
    try {
      const response = await adminAuthApi.inviteUser(inviteForm);
      
      if (response?.success) {
        // Show success message
        if (window.showNotification) {
          window.showNotification(
            `User ${inviteForm.firstName} ${inviteForm.lastName} invited successfully! An invitation email has been sent to ${inviteForm.email}.`,
            'success'
          );
        }
        
        // Reset form and close modal
        setInviteForm({ firstName: '', lastName: '', email: '', phoneNumber: '', companyName: '', role: 'user' });
        setShowInviteModal(false);
        
        // Refresh users list
        fetchUsers();
        fetchUserStats();
        fetchSubscriptionLimits();
      } else {
        throw new Error(response?.message || 'Failed to invite user');
      }
    } catch (err) {
      console.error('[AdminUsers] Error inviting user:', err);
      if (window.showNotification) {
        window.showNotification(err.message || 'Failed to invite user', 'error');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  // Handle view user
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      companyName: user.companyName || '',
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  // Handle update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      const response = await adminAuthApi.updateUser(selectedUser.id, editForm);
      
      if (response?.success) {
        if (window.showNotification) {
          window.showNotification(
            `User ${editForm.firstName} ${editForm.lastName} updated successfully!`,
            'success'
          );
        }
        
        setShowEditModal(false);
        fetchUsers();
        fetchUserStats();
      } else {
        throw new Error(response?.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('[AdminUsers] Error updating user:', err);
      if (window.showNotification) {
        window.showNotification(err.message || 'Failed to update user', 'error');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    
    try {
      const response = await adminAuthApi.deleteUser(selectedUser.id);
      
      if (response?.success) {
        if (window.showNotification) {
          window.showNotification(
            `User ${selectedUser.firstName} ${selectedUser.lastName} deleted successfully!`,
            'success'
          );
        }
        
        setShowDeleteModal(false);
        fetchUsers();
        fetchUserStats();
        fetchSubscriptionLimits();
      } else {
        throw new Error(response?.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('[AdminUsers] Error deleting user:', err);
      if (window.showNotification) {
        window.showNotification(err.message || 'Failed to delete user', 'error');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      console.log(`[AdminUsers] Exporting users in ${format} format`);
      
      const response = await adminAuthApi.exportUsers(format, searchTerm);
      
      if (response.ok) {
        // Create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `Users_${timestamp}.${format}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        if (window.showNotification) {
          window.showNotification(`Users exported successfully in ${format.toUpperCase()} format!`, 'success');
        }
      } else {
        throw new Error(`Failed to export ${format.toUpperCase()}`);
      }
    } catch (err) {
      console.error('[AdminUsers] Export error:', err);
      if (window.showNotification) {
        window.showNotification(err.message || `Failed to export ${format.toUpperCase()}. Please try again.`, 'error');
      }
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullName = (firstName, lastName) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded-md ${
            currentPage === i
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage users in your organization
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserX className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recently Added</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.recentlyAdded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>

          {/* Export Dropdown */}
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No results found for your search.' : 'Get started by inviting your first user.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('firstName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Full Name</span>
                        {getSortIcon('firstName')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('email')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email Address</span>
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('phoneNumber')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Phone Number</span>
                        {getSortIcon('phoneNumber')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('companyName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Company Name</span>
                        {getSortIcon('companyName')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('createdAt')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Registration Date</span>
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {formatFullName(user.firstName, user.lastName)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phoneNumber || 'Not provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.companyName || 'Not provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            data-testid={`button-view-user-${user.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            title="View User"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            data-testid={`button-edit-user-${user.id}`}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                            title="Edit User"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            data-testid={`button-delete-user-${user.id}`}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete User"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {formatFullName(user.firstName, user.lastName)}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-900">{user.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company:</span>
                      <span className="text-gray-900">{user.companyName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Registered:</span>
                      <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Mobile Action Buttons */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      data-testid={`button-view-user-mobile-${user.id}`}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                      title="View User"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      data-testid={`button-edit-user-mobile-${user.id}`}
                      className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50 transition-colors"
                      title="Edit User"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      data-testid={`button-delete-user-mobile-${user.id}`}
                      className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete User"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Results info */}
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} results
                </div>

                {/* Page size selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-sm text-gray-700">entries per page</span>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex space-x-1">
                      {renderPagination()}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Invite New User"
          maxWidth="md"
        >
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={inviteForm.phoneNumber}
                  onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  type="text"
                  value={inviteForm.companyName}
                  onChange={(e) => setInviteForm({ ...inviteForm, companyName: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
            </div>


            {/* Subscription Limits Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-800">Current Subscription Usage</h4>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {subscriptionLimits.planName}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {subscriptionLimits.currentUserCount}
                    </div>
                    <div className="text-xs text-gray-500">Current Users</div>
                  </div>
                  <div className="text-gray-400">/</div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {subscriptionLimits.maxUsers}
                    </div>
                    <div className="text-xs text-gray-500">Max Users</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      subscriptionLimits.remainingUsers > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {subscriptionLimits.remainingUsers}
                    </div>
                    <div className="text-xs text-gray-500">Remaining</div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    subscriptionLimits.currentUserCount >= subscriptionLimits.maxUsers 
                      ? 'bg-red-500' 
                      : subscriptionLimits.remainingUsers <= 5 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min((subscriptionLimits.currentUserCount / subscriptionLimits.maxUsers) * 100, 100)}%`
                  }}
                ></div>
              </div>
              
              <p className="text-sm text-blue-700">
                {subscriptionLimits.canInviteMore ? (
                  <>You can invite <strong>{subscriptionLimits.remainingUsers}</strong> more users to your organization. The user will receive an email to set password.</>
                ) : (
                  <span className="text-red-700 font-medium">
                    ⚠️ User limit reached! Please upgrade your subscription to invite more users.
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteModal(false)}
                disabled={inviteLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={inviteLoading}
                disabled={!subscriptionLimits.canInviteMore || inviteLoading}
                className={`${
                  subscriptionLimits.canInviteMore 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white`}
                data-testid="button-send-invitation"
              >
                {subscriptionLimits.canInviteMore ? 'Send Invitation' : 'User Limit Reached'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="User Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-lg font-medium text-white">
                  {(selectedUser.firstName?.[0] || '').toUpperCase()}{(selectedUser.lastName?.[0] || '').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {formatFullName(selectedUser.firstName, selectedUser.lastName)}
                </h3>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedUser.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                  {selectedUser.firstName || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                  {selectedUser.lastName || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                  {selectedUser.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                  {selectedUser.phoneNumber || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                  {selectedUser.companyName || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                  {formatDate(selectedUser.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowViewModal(false)}
                data-testid="button-close-view-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
          size="lg"
        >
          <form onSubmit={handleUpdateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="editFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  id="editFirstName"
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  placeholder="Enter first name"
                  required
                  data-testid="input-edit-first-name"
                />
              </div>
              <div>
                <label htmlFor="editLastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  id="editLastName"
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  placeholder="Enter last name"
                  required
                  data-testid="input-edit-last-name"
                />
              </div>
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="editEmail"
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  data-testid="input-edit-email-disabled"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label htmlFor="editPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="editPhoneNumber"
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                  data-testid="input-edit-phone-number"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="editCompanyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <Input
                  id="editCompanyName"
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  placeholder="Enter company name"
                  data-testid="input-edit-company-name"
                />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">User Status</label>
                  <p className="text-xs text-gray-500">Toggle user account status</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${editForm.isActive ? 'text-gray-400' : 'text-red-600 font-medium'}`}>
                    Inactive
                  </span>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editForm.isActive ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    data-testid="toggle-user-status"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editForm.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${editForm.isActive ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={updateLoading}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-update-user"
              >
                Update User
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete User"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm User Deletion
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                Are you sure you want to delete{' '}
                <strong>{formatFullName(selectedUser.firstName, selectedUser.lastName)}</strong>{' '}
                ({selectedUser.email})? This will permanently remove their account and all associated data.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                data-testid="button-cancel-delete"
              >
                Cancel
              </Button>
              <Button
                type="button"
                loading={deleteLoading}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-confirm-delete"
              >
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;