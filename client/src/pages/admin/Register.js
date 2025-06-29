import React, { useState, useEffect } from "react";
import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  Mail,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "../../styles/pages/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || "/admin";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      toast.success("Account created successfully! You can now sign in.");

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate("/admin/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.error?.details) {
          // Handle validation errors from backend
          const newErrors = {};
          errorData.error.details.forEach((detail) => {
            const field = detail.path[0];
            newErrors[field] = detail.message;
          });
          setErrors(newErrors);
        } else if (errorData.error?.message) {
          setErrors({ general: errorData.error.message });
        } else {
          setErrors({
            general: "Registration failed. Please check your information.",
          });
        }
      } else if (error.response?.status === 409) {
        setErrors({ general: "Username or email already exists" });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account - Blog Hub Admin</title>
        <meta
          name="description"
          content="Create your admin account to start managing your blog"
        />
      </Helmet>

      <div className="register-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="register-card"
        >
          {/* Header */}
          <div className="register-header">
            <div className="register-logo">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">
              Join our platform and start creating content
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="register-general-error">
              <p>{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {/* Full Name Field */}
            <div className="register-field">
              <label htmlFor="name" className="register-label">
                Full Name
              </label>
              <div className="register-input-wrapper">
                <UserIcon className="register-input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`register-input ${errors.name ? "error" : ""}`}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              {errors.name && <p className="register-error">{errors.name}</p>}
            </div>

            {/* Username Field */}
            <div className="register-field">
              <label htmlFor="username" className="register-label">
                Username
              </label>
              <div className="register-input-wrapper">
                <UserIcon className="register-input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`register-input ${errors.username ? "error" : ""}`}
                  placeholder="Choose a username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="register-error">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="register-field">
              <label htmlFor="email" className="register-label">
                Email Address
              </label>
              <div className="register-input-wrapper">
                <Mail className="register-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`register-input ${errors.email ? "error" : ""}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="register-error">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="register-field">
              <label htmlFor="password" className="register-label">
                Password
              </label>
              <div className="register-input-wrapper">
                <Lock className="register-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`register-input ${errors.password ? "error" : ""}`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="register-password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="register-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="register-field">
              <label htmlFor="confirmPassword" className="register-label">
                Confirm Password
              </label>
              <div className="register-input-wrapper">
                <Lock className="register-input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`register-input ${
                    errors.confirmPassword ? "error" : ""
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="register-password-toggle"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="register-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="register-submit"
            >
              {isLoading ? (
                <>
                  <div className="register-spinner"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="register-footer">
            <p className="register-footer-text">
              Already have an account?{" "}
              <Link to="/admin/login" className="register-footer-link">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Register;
