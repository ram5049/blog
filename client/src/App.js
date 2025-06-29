import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Public Pages
import Home from "./pages/public/Home";
import BlogPost from "./pages/public/BlogPost";
import NotFound from "./pages/public/NotFound";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import CreatePost from "./pages/admin/CreatePost";
import EditPost from "./pages/admin/EditPost";
import PostList from "./pages/admin/PostList";
import Profile from "./pages/admin/Profile";

// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Styles
import "./styles/main.css";

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="App min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* Admin Login Route */}
                <Route path="/admin/login" element={<Login />} />

                {/* Admin Registration Route */}
                <Route path="/admin/register" element={<Register />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="editor">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="posts" element={<PostList />} />
                  <Route path="posts/create" element={<CreatePost />} />
                  <Route path="posts/edit/:id" element={<EditPost />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Redirect old admin paths */}
                <Route
                  path="/admin/dashboard"
                  element={<Navigate to="/admin" replace />}
                />

                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>

              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#fff",
                    color: "#374151",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                    padding: "16px",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: "#6b7280",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
