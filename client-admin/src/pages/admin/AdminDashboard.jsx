import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { adminAuthApi } from "../../utils/api";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.admin);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardStats();
    }
  }, [dispatch, user, isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const data = await adminAuthApi.getDashboardStats();
      setDashboardStats(data);
      console.log("Admin Dashboard loaded for user:", user);
      console.log("Dashboard stats:", data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            <span>Error loading dashboard: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {user?.firstName || user?.email || "Admin"}!
              </h1>
              <p className="text-green-100 text-sm sm:text-base">
                {dashboardStats?.tenant?.name || "Tenant"} -{" "}
                {user?.role === "tenant-admin"
                  ? "Tenant Administrator"
                  : "Administrator"}
              </p>
            </div>
          </div>
          {dashboardStats?.tenant && (
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="text-sm">
                <div className="text-green-100">Tenant Status</div>
                <div className="font-semibold capitalize">
                  {dashboardStats.tenant.status}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-file-alt text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.documents?.total?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                +{dashboardStats?.documents?.recent || "0"} recent uploads
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-users text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.users?.active?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                of {dashboardStats?.users?.total || "0"} total users
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.activities?.pending?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <i className="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Week Activity</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats?.activities?.thisWeek?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">User activities</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-500">
            Latest activities in your tenant
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {item}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Sample Activity {item}
                  </div>
                  <div className="text-sm text-gray-500">
                    Activity description would appear here
                  </div>
                </div>
                <div className="text-xs text-gray-400">{item}h ago</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors">
              View All Activities
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
