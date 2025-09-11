import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, FileText, BarChart3, Bell, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { useAuditLogs } from '../hooks/useAuditLogs';
import Button from '../components/ui/Button';
import AuditLogsTable from '../components/ui/AuditLogsTable';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Initialize inactivity logout
  useInactivityLogout();

  // Initialize audit logs functionality
  const {
    data: auditLogsData,
    loading: auditLogsLoading,
    error: auditLogsError,
    pagination: auditLogsPagination,
    filters: auditLogsFilters,
    handlePageChange: handleAuditLogsPageChange,
    handleLimitChange: handleAuditLogsLimitChange,
    handleSort: handleAuditLogsSort,
    handleSearch: handleAuditLogsSearch,
    handleExport: handleAuditLogsExport
  } = useAuditLogs();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const dashboardCards = [
    {
      title: 'Policies',
      description: 'Manage your insurance policies',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      count: '5 Active'
    },
    {
      title: 'Claims',
      description: 'Track your insurance claims',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      count: '2 Pending'
    },
    {
      title: 'Analytics',
      description: 'View your insurance analytics',
      icon: BarChart3,
      color: 'from-purple-500 to-indigo-500',
      count: 'Last 30 days'
    },
    {
      title: 'Settings',
      description: 'Manage account settings',
      icon: Settings,
      color: 'from-orange-500 to-red-500',
      count: 'Profile'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">InsurCheck</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, {user?.firstName || user?.email || 'User'}!
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your insurance policies and claims in one place.</p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500">{card.count}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Audit Logs and Version History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <AuditLogsTable
            data={auditLogsData}
            loading={auditLogsLoading}
            error={auditLogsError}
            pagination={auditLogsPagination}
            filters={auditLogsFilters}
            onPageChange={handleAuditLogsPageChange}
            onLimitChange={handleAuditLogsLimitChange}
            onSort={handleAuditLogsSort}
            onSearch={handleAuditLogsSearch}
            onExport={handleAuditLogsExport}
          />
        </motion.div>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Session Type: </span>
              <span className="text-gray-600">
                {localStorage.getItem('sessionType') === 'remember' ? 'Remember Me (30 days)' : 'Standard (30 minutes)'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Expires: </span>
              <span className="text-gray-600">
                {localStorage.getItem('sessionExpiry') 
                  ? new Date(localStorage.getItem('sessionExpiry')).toLocaleString()
                  : 'Not set'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Last Activity: </span>
              <span className="text-gray-600">
                {localStorage.getItem('lastActivity')
                  ? new Date(localStorage.getItem('lastActivity')).toLocaleString()
                  : 'Not set'
                }
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;