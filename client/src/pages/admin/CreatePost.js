import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import postService from "../../services/postService";
import PostEditor from "../../components/admin/PostEditor";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    status: "draft",
  });
  const [tagInput, setTagInput] = useState("");

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
      setLoading(true);
      await postService.createPost(formData);
      // Redirect to dashboard with refresh signal
      navigate("/admin", { state: { refreshStats: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPublish = async (e) => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, status: "published" }));
    // Wait for state update then submit
    setTimeout(() => handleSubmit(e), 0);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Create New Post</h1>
        <p>Write and publish your blog post</p>
      </div>

      <div style={{ padding: "0 2rem 2rem 2rem" }}>
        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          {/* Title */}
          <div className="admin-form-group">
            <label htmlFor="title" className="admin-form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="admin-form-input"
              placeholder="Enter post title..."
              required
            />
          </div>

          {/* Excerpt */}
          <div className="admin-form-group">
            <label htmlFor="excerpt" className="admin-form-label">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="admin-form-input admin-form-textarea"
              placeholder="Brief description of your post..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional. If not provided, will be auto-generated from content.
            </p>
          </div>

          {/* Tags */}
          <div className="admin-form-group">
            <label className="admin-form-label">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                className="tag-input"
                placeholder="Add a tag and press Enter..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="admin-form-group">
            <label className="admin-form-label">Content *</label>
            <div className="admin-editor-container">
              <PostEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Start writing your post..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="admin-form-actions">
            <button
              type="button"
              onClick={() => navigate("/admin/posts")}
              className="admin-btn admin-btn-secondary"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              <button type="submit" className="admin-btn admin-btn-secondary">
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handleSaveAndPublish}
                className="admin-btn admin-btn-primary"
              >
                Save & Publish
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
