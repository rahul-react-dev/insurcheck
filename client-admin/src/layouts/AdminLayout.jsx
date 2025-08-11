
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../components/ui/Button';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/super-admin/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/super-admin/dashboard',
      icon: 'fas fa-tachometer-alt',
      roles: ['super-admin']
    },
    {
      name: 'System Monitoring',
      path: '/super-admin/dashboard',
      icon: 'fas fa-chart-line',
      roles: ['super-admin']
    },
    {
      name: 'Error Logs',
      path: '/super-admin/dashboard',
      icon: 'fas fa-exclamation-triangle',
      roles: ['super-admin']
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-neutral-light flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">InsurCheck</h1>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavigation.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActiveRoute(item.path)
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-gray-600 text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Super Admin'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'super-admin'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {location.pathname.includes('dashboard') ? 'System Monitoring Dashboard' : 'Super Admin Panel'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Monitor system performance and manage platform operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <i className="fas fa-clock"></i>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-neutral-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
