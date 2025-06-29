import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  FileText,
  Plus,
  Eye,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { usePostStats } from "../../hooks/usePosts";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner, {
  CardSkeleton,
} from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";

const Dashboard = () => {
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = usePostStats();
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Get user data directly from localStorage as fallback
  const [localUser, setLocalUser] = React.useState(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Dashboard localStorage check - raw data:", storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Dashboard localStorage check - parsed user:", parsedUser);
        console.log(
          "Dashboard localStorage check - user role:",
          parsedUser?.role
        );
        setLocalUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        // Clear invalid data
        localStorage.removeItem("user");
      }
    }
    setIsInitialized(true);
  }, []);

  // Listen for changes to localStorage to handle user updates from other tabs
  React.useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "user") {
        console.log("User data changed in localStorage:", event.newValue);
        try {
          const newUser = event.newValue ? JSON.parse(event.newValue) : null;
          setLocalUser(newUser);
        } catch (error) {
          console.error("Error parsing updated user data:", error);
          setLocalUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Use context user or fallback to localStorage user, but ensure we don't show wrong user data
  const displayUser = React.useMemo(() => {
    // If auth is still loading and we haven't initialized localStorage check, show loading
    if (authLoading && !isInitialized) {
      return null;
    }

    // Prefer context user if available and it has valid data
    if (user && user.role) {
      console.log("Using context user:", user);
      return user;
    }

    // Only use localStorage user if context user is not available and localStorage has valid data
    if (localUser && localUser.role && !authLoading) {
      console.log("Using localStorage user:", localUser);
      return localUser;
    }

    // If context user exists but doesn't have role, but localStorage has role, merge them
    if (user && !user.role && localUser && localUser.role) {
      console.log("Merging context user with localStorage role");
      return { ...user, ...localUser };
    }

    console.log("No valid user found, returning null");
    return null;
  }, [user, localUser, authLoading, isInitialized]);

  // Debug logging
  useEffect(() => {
    console.log("=== Dashboard User State Debug ===");
    console.log("Dashboard - User state:", user);
    console.log("Dashboard - Local user state:", localUser);
    console.log("Dashboard - Display user:", displayUser);
    console.log("Dashboard - Auth loading:", authLoading);
    console.log("Dashboard - Is initialized:", isInitialized);
    console.log("Dashboard - Display user role:", displayUser?.role);
    console.log("===================================");
  }, [user, localUser, displayUser, authLoading, isInitialized]);

  // Refresh stats if we're coming from a post creation/edit page
  useEffect(() => {
    const state = location.state;
    if (state?.refreshStats) {
      refetchStats();
      // Clear the state to prevent infinite refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetchStats]);

  const quickActions = [
    {
      name: "Create New Post",
      description: "Write and publish a new blog post",
      href: "/admin/posts/create",
      icon: Plus,
      color: "bg-primary-500 hover:bg-primary-600",
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      name: "Manage Posts",
      description: "Edit, delete, or manage existing posts",
      href: "/admin/posts",
      icon: FileText,
      color: "bg-gray-500 hover:bg-gray-600",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
    },
    {
      name: "View Blog",
      description: "See how your blog looks to visitors",
      href: "/",
      icon: Eye,
      color: "bg-green-500 hover:bg-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, loading }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card stat-card"
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      ) : (
        <>
          <h3>{title}</h3>
          <div className="stat-number">{value}</div>
          {trend && (
            <p className="ml-2 flex items-baseline text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
  return (
    <>
      <Helmet>
        <title>Dashboard - Blog Hub Admin</title>
        <meta name="description" content="Admin dashboard for Blog Hub" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="admin-content">
        {/* Header */}
        <div className="admin-header">
          <h1>
            {!displayUser && (authLoading || !isInitialized)
              ? "Loading..."
              : displayUser?.role === "admin"
              ? "Welcome back, Admin!"
              : `Welcome back, ${
                  displayUser?.username || displayUser?.name || "User"
                }!`}
          </h1>
          <p>Here's what's happening with your blog today.</p>
        </div>

        <div style={{ padding: "0 2rem 2rem 2rem" }}>
          {/* Error Display */}
          {statsError && (
            <div className="admin-error mb-6">
              <p>Failed to load statistics: {statsError}</p>
              <button
                onClick={() => refetchStats()}
                className="mt-2 text-sm underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Posts"
              value={stats?.totalPosts || 0}
              icon={FileText}
              loading={statsLoading}
            />
            <StatCard
              title="Published Posts"
              value={stats?.publishedPosts || 0}
              icon={Eye}
              loading={statsLoading}
            />
            <StatCard
              title="Draft Posts"
              value={stats?.draftPosts || 0}
              icon={Calendar}
              loading={statsLoading}
            />
            <StatCard
              title="This Month"
              value={stats?.thisMonth || 0}
              icon={TrendingUp}
              trend={
                stats?.monthlyGrowth
                  ? `${stats.monthlyGrowth > 0 ? "+" : ""}${
                      stats.monthlyGrowth
                    }%`
                  : null
              }
              loading={statsLoading}
            />
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="quick-actions">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link to={action.href} className="quick-action-card">
                      <div className={`quick-action-icon ${action.iconBg}`}>
                        <Icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <h3 className="quick-action-title">{action.name}</h3>
                      <p className="quick-action-desc">{action.description}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="dashboard-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Posts
                </h3>
                <Link
                  to="/admin/posts"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>

              {statsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : statsError ? (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4">
                    Failed to load recent posts
                  </div>
                  <button
                    onClick={() => refetchStats()}
                    className="admin-btn admin-btn-secondary"
                  >
                    Retry
                  </button>
                </div>
              ) : stats?.recentPosts?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentPosts.slice(0, 5).map((post) => (
                    <div
                      key={post._id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(post.createdAt, "short")} • {post.status}
                        </p>
                      </div>
                      <Link
                        to={`/admin/posts/edit/${post._id}`}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    No posts yet
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Get started by creating your first blog post.
                  </p>
                  <Link
                    to="/admin/posts/create"
                    className="admin-btn admin-btn-primary"
                  >
                    Create Post
                  </Link>
                </div>
              )}
            </motion.div>

            {/* System Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="dashboard-card"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                System Overview
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Blog Status
                    </span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    Online
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Your Role
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 capitalize">
                    {!displayUser && (authLoading || !isInitialized)
                      ? "Loading..."
                      : displayUser?.role === "admin"
                      ? "Admin"
                      : displayUser?.role === "editor"
                      ? "Editor"
                      : "User"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Last Login
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">Today</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Performance
                    </span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    Excellent
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  to="/admin/profile"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage Profile
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
