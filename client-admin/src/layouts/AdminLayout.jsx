import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/super-admin/login");
  };

  const navigationItems = [
    {
      name: "System Dashboard",
      path: "/super-admin/dashboard",
      icon: "fas fa-chart-line",
      roles: ["super-admin"],
    },
    {
      name: "Manage Subscriptions",
      path: "/super-admin/subscriptions",
      icon: "fas fa-credit-card",
      roles: ["super-admin"],
    },
  ];

  const filteredNavigation = navigationItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  const isActiveRoute = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">InsurCheck</h1>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "super-admin"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavigation.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActiveRoute(item.path)
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <i className={`${item.icon} text-lg flex-shrink-0`}></i>
              <span className="font-medium truncate">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || "Super Admin"}
              </p>
              <p className="text-xs text-blue-600 capitalize font-medium">
                {user?.role || "super-admin"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 hover:border-red-300 font-medium text-sm"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {location.pathname.includes("dashboard")
                    ? "System Monitoring"
                    : location.pathname.includes("subscriptions")
                      ? "Subscription Management"
                      : "Super Admin Panel"}
                </h2>
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                  Monitor system performance and manage platform operations
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <i className="fas fa-clock"></i>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
