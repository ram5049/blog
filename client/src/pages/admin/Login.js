import React, { useState, useEffect } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "../../styles/pages/login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || "/admin";

  useEffect(() => {
    if (error) {
      setErrors({ general: error });
    }
  }, [error]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    const result = await login(formData);
    if (!result.success) {
      setErrors({ general: result.error });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Blog Hub</title>
        <meta name="description" content="Admin login for Blog Hub dashboard" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="auth-card"
        >
          {/* Header */}
          <div className="auth-header">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="auth-logo"
            >
              <span>M</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="auth-title"
            >
              Welcome Back
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="auth-subtitle"
            >
              Sign in to access your admin dashboard
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="auth-form"
          >
            {/* General Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-general-error"
              >
                <p>{errors.general}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <div className="auth-input-wrapper">
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`auth-input ${
                      errors.username ? "auth-input-error" : ""
                    }`}
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="auth-error-message">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`auth-input ${
                      errors.password ? "auth-input-error" : ""
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="auth-error-message">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="auth-submit-btn"
              >
                {isLoading ? (
                  <>
                    <div className="auth-loading-spinner"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="auth-footer">
              <p className="auth-footer-text">
                Don't have an account?{" "}
                <Link to="/admin/register" className="auth-footer-link">
                  Create one here
                </Link>
              </p>
              <p className="auth-footer-text">
                Need help?{" "}
                <a
                  href="mailto:admin@modernblog.com"
                  className="auth-footer-link"
                >
                  Contact support
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
