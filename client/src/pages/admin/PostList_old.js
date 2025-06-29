import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import postService from "../../services/postService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts();
      setPosts(response.data.posts || []);
    } catch (err) {
      setError("Failed to fetch posts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postService.deletePost(postId);
        setPosts(posts.filter((post) => post._id !== postId));
      } catch (err) {
        setError("Failed to delete post");
        console.error(err);
      }
    }
  };

  const handleToggleStatus = async (postId, currentStatus) => {
    try {
      if (currentStatus === "published") {
        await postService.unpublishPost(postId);
      } else {
        await postService.publishPost(postId);
      }
      await fetchPosts(); // Refresh the list
    } catch (err) {
      setError("Failed to update post status");
      console.error(err);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = filter === "all" || post.status === filter;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Posts</h1>
        <p>Manage all your blog posts</p>
      </div>

      <div style={{ padding: '0 2rem 2rem 2rem' }}>
        {error && (
          <div className="admin-error">
            {error}
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
                style={{ width: 'auto' }}
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
        {filteredPosts.length === 0 ? (
          <div className="dashboard-card text-center py-12">
            <div className="text-gray-500">
              {searchTerm || filter !== "all"
                ? "No posts match your criteria"
                : "No posts found. Create your first post!"}
            </div>
            {!searchTerm && filter === "all" && (
              <Link
                to="/admin/posts/create"
                className="admin-btn admin-btn-primary mt-4"
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
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {post.excerpt}
                        </div>
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
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/posts/edit/${post._id}`}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(post._id, post.status)}
                            className={`${
                              post.status === "published"
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-blue-600 hover:text-blue-900"
                            }`}
                            title={
                              post.status === "published" ? "Unpublish" : "Publish"
                            }
                          >
                            {post.status === "published" ? "📤" : "�"}
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
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
  );

      {filteredPosts.length === 0 && (
        <div className="mt-8 text-center py-12">
          <div className="text-gray-500">
            {searchTerm || filter !== "all"
              ? "No posts match your criteria"
              : "No posts yet"}
          </div>
          {!searchTerm && filter === "all" && (
            <Link
              to="/admin/posts/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Create your first post
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PostList;
