import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import postService from "../../services/postService";
import PostEditor from "../../components/admin/PostEditor";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";
import "../../styles/pages/editPost.css";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    status: "draft",
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    console.log("EditPost component mounted with ID:", id);
    console.log("Auth token:", localStorage.getItem("authToken"));
    console.log("User data:", localStorage.getItem("user"));
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostById(id);
      const post = response.data.post;
      setFormData({
        title: post.title || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        tags: post.tags || [],
        status: post.status || "draft",
      });
    } catch (err) {
      setError("Failed to fetch post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setSaving(true);

      console.log("Updating post with ID:", id);
      console.log("Form data:", formData);

      const response = await postService.updatePost(id, formData);
      console.log("Update response:", response);

      // Show success message
      alert("Post updated successfully!");

      // Redirect to dashboard with refresh signal
      navigate("/admin", { state: { refreshStats: true } });
    } catch (err) {
      console.error("Update error:", err);
      console.error("Error response:", err.response);

      // More detailed error handling
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update post. Please try again.";

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setSaving(true);
      if (formData.status === "published") {
        await postService.unpublishPost(id);
        setFormData((prev) => ({ ...prev, status: "draft" }));
      } else {
        await postService.publishPost(id);
        setFormData((prev) => ({ ...prev, status: "published" }));
      }
    } catch (err) {
      setError("Failed to update post status");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      try {
        setSaving(true);
        setError(""); // Clear any previous errors

        console.log("Deleting post with ID:", id);
        const response = await postService.deletePost(id);
        console.log("Delete response:", response);

        // Show success message
        alert("Post deleted successfully!");

        // Redirect to dashboard with refresh signal
        navigate("/admin", { state: { refreshStats: true } });
      } catch (err) {
        console.error("Delete error:", err);
        console.error("Error response:", err.response);

        // More detailed error handling
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete post. Please try again.";

        setError(errorMessage);
        setSaving(false);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      className="edit-post-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>Edit Post - Admin Dashboard</title>
        <meta name="description" content="Edit your blog post" />
      </Helmet>

      {/* Header */}
      <div className="admin-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
            <p className="mt-2 text-gray-600">Make changes to your blog post</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`edit-post-status ${formData.status}`}>
              {formData.status}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="edit-post-form">
        <div className="edit-post-grid">
          {/* Main Content */}
          <div className="edit-post-main">
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="edit-post-field">
                <label htmlFor="title" className="edit-post-label">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="edit-post-input title-input"
                  placeholder="Enter an engaging title for your post..."
                  required
                />
              </div>

              {/* Excerpt */}
              <div className="edit-post-field">
                <label htmlFor="excerpt" className="edit-post-label">
                  Excerpt
                  <span className="edit-post-label-hint">
                    Brief description that appears in post previews
                  </span>
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="edit-post-input excerpt-input"
                  placeholder="Write a compelling excerpt to draw readers in..."
                />
              </div>

              {/* Content */}
              <div className="edit-post-field">
                <label className="edit-post-label">
                  Content *
                  <span className="edit-post-label-hint">
                    Write your post content using the rich text editor
                  </span>
                </label>
                <div className="edit-post-editor">
                  <PostEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your amazing post..."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="edit-post-sidebar">
            {/* Tags */}
            <div className="edit-post-card">
              <h3 className="edit-post-card-title">Tags</h3>
              <div className="edit-post-tags">
                <div className="edit-post-tag-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="edit-post-tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="edit-post-tag-remove"
                        aria-label={`Remove ${tag} tag`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="edit-post-tag-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                    className="edit-post-input tag-input"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="edit-post-tag-add-btn"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Post Settings */}
            <div className="edit-post-card">
              <h3 className="edit-post-card-title">Post Settings</h3>
              <div className="edit-post-settings">
                <div className="edit-post-setting">
                  <span className="edit-post-setting-label">Status</span>
                  <span className={`edit-post-status-badge ${formData.status}`}>
                    {formData.status}
                  </span>
                </div>
                <div className="edit-post-setting">
                  <span className="edit-post-setting-label">Last Modified</span>
                  <span className="edit-post-setting-value">
                    {formatDate(new Date())}
                  </span>
                </div>
                <div className="edit-post-setting">
                  <span className="edit-post-setting-label">Word Count</span>
                  <span className="edit-post-setting-value">
                    {
                      formData.content
                        .replace(/<[^>]*>/g, "")
                        .split(/\s+/)
                        .filter((word) => word.length > 0).length
                    }{" "}
                    words
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="edit-post-card">
              <h3 className="edit-post-card-title">Actions</h3>
              <div className="edit-post-actions">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`edit-post-action-btn ${
                    formData.status === "published" ? "unpublish" : "publish"
                  }`}
                  disabled={saving}
                >
                  {saving
                    ? "Updating..."
                    : formData.status === "published"
                    ? "Unpublish Post"
                    : "Publish Post"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log("Delete button clicked!");
                    handleDelete();
                  }}
                  className="edit-post-action-btn delete"
                  disabled={saving}
                >
                  {saving ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="edit-post-bottom-actions">
          <div className="edit-post-bottom-left">
            <button
              type="button"
              onClick={() => navigate("/admin/posts")}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ← Back to Posts
            </button>
          </div>
          <div className="edit-post-bottom-right">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => {
                console.log("Save Changes button clicked!");
                handleSubmit(e);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditPost;
