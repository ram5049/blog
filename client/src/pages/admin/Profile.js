import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username.trim() || !formData.email.trim()) {
      setError("Username and email are required");
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      const response = await authService.updateProfile(updateData);
      updateUser(response.data.user);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All password fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setSuccess("Password changed successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.username) return <LoadingSpinner />;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="admin-form">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="admin-form-group">
                <label htmlFor="username" className="admin-form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="email" className="admin-form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="admin-form-input"
                  required
                />
              </div>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn admin-btn-primary"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="admin-form">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="admin-form-group">
                <label htmlFor="currentPassword" className="admin-form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="newPassword" className="admin-form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="confirmPassword" className="admin-form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn admin-btn-primary"
                >
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
