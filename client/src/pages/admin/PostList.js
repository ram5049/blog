import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useAdminPosts } from "../../hooks/usePosts";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";

const PostList = () => {
  const {
    posts,
    loading,
    error,
    refetch,
    deletePost,
    publishPost,
    unpublishPost,
  } = useAdminPosts();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  const handleDelete = async (post) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${post.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(post._id);
    try {
      const result = await deletePost(post.slug);
      if (result.success) {
        toast.success("Post deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete post");
      }
    } catch (err) {
      toast.error("Failed to delete post");
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleStatus = async (post) => {
    try {
      if (post.status === "published") {
        const result = await unpublishPost(post._id);
        if (!result.success) {
          toast.error(result.error || "Failed to unpublish post");
        }
      } else {
        const result = await publishPost(post._id);
        if (!result.success) {
          toast.error(result.error || "Failed to publish post");
        }
      }
    } catch (err) {
      toast.error("Failed to update post status");
      console.error(err);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = filter === "all" || post.status === filter;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Posts - Blog Hub Admin</title>
        <meta name="description" content="Manage all your blog posts" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Posts</h1>
          <p>Manage all your blog posts</p>
        </div>

        <div style={{ padding: "0 2rem 2rem 2rem" }}>
          {error && (
            <div className="admin-error mb-6">
              {error}
              <button
                onClick={() => refetch()}
                className="ml-2 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Filters and Search */}
          <div className="dashboard-card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-form-input"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="admin-form-input"
                  style={{ width: "auto" }}
                >
                  <option value="all">All Posts</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <Link
                  to="/admin/posts/create"
                  className="admin-btn admin-btn-primary"
                >
                  Create Post
                </Link>
              </div>
            </div>
          </div>
          {/* Posts Table */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredPosts.length === 0 ? (
            <div className="dashboard-card text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm || filter !== "all"
                  ? "No posts match your criteria"
                  : "No posts found. Create your first post!"}
              </div>
              {!searchTerm && filter === "all" && (
                <Link
                  to="/admin/posts/create"
                  className="admin-btn admin-btn-primary"
                >
                  Create Your First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="dashboard-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPosts.map((post) => (
                      <motion.tr
                        key={post._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                              {post.excerpt}
                            </div>
                          )}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{post.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              post.status
                            )}`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.createdAt, "short")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.updatedAt, "short")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {/* View Post */}
                            <Link
                              to={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View post"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </Link>

                            {/* Edit Post */}
                            <Link
                              to={`/admin/posts/edit/${post.slug}`}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Edit post"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>

                            {/* Publish/Unpublish Toggle */}
                            <button
                              onClick={() => handleToggleStatus(post)}
                              className={`transition-colors ${
                                post.status === "published"
                                  ? "text-yellow-600 hover:text-yellow-900"
                                  : "text-blue-600 hover:text-blue-900"
                              }`}
                              title={
                                post.status === "published"
                                  ? "Unpublish post"
                                  : "Publish post"
                              }
                            >
                              {post.status === "published" ? "📤" : "📥"}
                            </button>

                            {/* Delete Post */}
                            <button
                              onClick={() => handleDelete(post)}
                              disabled={deleteLoading === post._id}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Delete post"
                            >
                              {deleteLoading === post._id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PostList;
