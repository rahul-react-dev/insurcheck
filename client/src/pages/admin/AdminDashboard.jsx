
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.admin);

  useEffect(() => {
    // Fetch dashboard data here
    console.log('Admin Dashboard loaded for user:', user);
  }, [dispatch, user]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.email || 'Admin'}!
            </h1>
            <p className="text-gray-600">
              {user?.role === 'tenant-admin' ? 'Tenant Administrator' : 'Administrator'} Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="fas fa-file-alt text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i className="fas fa-users text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">56</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
