import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Eye,
  Settings,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: location.pathname === "/admin",
    },
    {
      name: "All Posts",
      href: "/admin/posts",
      icon: FileText,
      current: location.pathname === "/admin/posts",
    },
    {
      name: "Create Post",
      href: "/admin/posts/create",
      icon: Plus,
      current: location.pathname === "/admin/posts/create",
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: User,
      current: location.pathname === "/admin/profile",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-gray-600 opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="admin-sidebar lg:flex lg:flex-col">
        <SidebarContent
          navigation={navigation}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="admin-sidebar fixed inset-y-0 left-0 z-50 lg:hidden mobile-open"
          >
            <SidebarContent
              navigation={navigation}
              user={user}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
              isMobile
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="logo-brand">
                  <span>BH</span>
                </div>
                <span className="font-serif text-lg font-semibold text-gray-900">
                  Blog Hub
                </span>
              </div>
              <div className="w-6" /> {/* Spacer */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <Outlet />
      </div>
    </div>
  );
};

// Sidebar Content Component
const SidebarContent = ({ navigation, user, onLogout, onClose, isMobile }) => {
  return (
    <div className="flex flex-col flex-1 bg-gray-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="logo-brand">
            <span>BH</span>
          </div>
          <span className="font-serif text-lg font-semibold text-white">
            Blog Hub
          </span>
        </Link>

        {isMobile && (
          <button
            type="button"
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                ${
                  item.current
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }
              `}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="space-y-2">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <Eye className="h-4 w-4 mr-3" />
            View Blog
          </Link>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {"User" || "User"}
            </p>
            <p className="text-xs text-gray-300 truncate">
              {user?.email || "admin@example.com"}
            </p>
          </div>
        </div>

        <button onClick={onLogout} className="sign-out-btn">
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
