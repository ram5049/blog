import { useState, useEffect, useCallback, useRef } from "react";
import postService from "../services/postService";
import toast from "react-hot-toast";

export const usePosts = (initialParams = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Use ref to store initial params to prevent infinite re-renders
  const initialParamsRef = useRef(initialParams);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchPosts = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const mergedParams = { ...initialParamsRef.current, ...params };
        const response = await postService.getPublishedPosts(mergedParams);

        setPosts(response.data.posts || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalPosts: 0,
            hasNext: false,
            hasPrev: false,
          }
        );

        // Show info if using mock data
        if (response.message === "Mock posts retrieved successfully") {
          toast(
            "Demo mode: Using sample data. Start the backend server for full functionality.",
            {
              icon: "ℹ️",
              duration: 5000,
            }
          );
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message);
        // Only show toast if this is not the initial load
        if (!isInitialLoad) {
          toast.error("Failed to fetch posts");
        }
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    },
    [] // Remove initialParams dependency
  );

  useEffect(() => {
    fetchPosts();
  }, []); // Remove fetchPosts dependency to prevent infinite calls

  const refetch = useCallback(
    (params) => {
      return fetchPosts(params);
    },
    [fetchPosts]
  );

  return {
    posts,
    loading,
    error,
    pagination,
    refetch,
  };
};

export const usePost = (slug) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await postService.getPostBySlug(slug);
        setPost(response.data.post || null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message);
        // Only show toast for specific errors, not 404s
        if (
          !err.message.includes("not found") &&
          !err.message.includes("404")
        ) {
          toast.error("Failed to fetch post");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, loading, error };
};

export const useAdminPosts = (initialParams = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Use ref to store initial params to prevent infinite re-renders
  const initialParamsRef = useRef(initialParams);

  const fetchPosts = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const mergedParams = { ...initialParamsRef.current, ...params };
        const response = await postService.getAllPosts(mergedParams);

        setPosts(response.data.posts || []);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalPosts: 0,
            hasNext: false,
            hasPrev: false,
          }
        );
      } catch (err) {
        console.error("Error fetching admin posts:", err);
        setError(err.message);
        // Only show toast if this is not the initial load
        if (!loading) {
          toast.error("Failed to fetch posts");
        }
      } finally {
        setLoading(false);
      }
    },
    [] // Remove initialParams dependency
  );

  useEffect(() => {
    fetchPosts();
  }, []); // Remove fetchPosts dependency

  const createPost = async (postData) => {
    try {
      const response = await postService.createPost(postData);
      toast.success("Post created successfully!");
      fetchPosts(); // Refetch posts
      return { success: true, post: response.data.post };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const updatePost = async (slug, postData) => {
    try {
      const response = await postService.updatePost(slug, postData);
      toast.success("Post updated successfully!");
      fetchPosts(); // Refetch posts
      return { success: true, post: response.data.post };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const deletePost = async (slug) => {
    try {
      await postService.deletePost(slug);
      toast.success("Post deleted successfully!");
      fetchPosts(); // Refetch posts
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const publishPost = async (postId) => {
    try {
      await postService.publishPost(postId);
      toast.success("Post published successfully!");
      fetchPosts(); // Refetch posts
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const unpublishPost = async (postId) => {
    try {
      await postService.unpublishPost(postId);
      toast.success("Post unpublished successfully!");
      fetchPosts(); // Refetch posts
      return { success: true };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  const refetch = useCallback(
    (params) => {
      return fetchPosts(params);
    },
    [fetchPosts]
  );

  return {
    posts,
    loading,
    error,
    pagination,
    refetch,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
  };
};

export const usePostStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postService.getPostStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching post stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    return fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch };
};

export const useTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await postService.getAllTags();
        setTags(response.data.tags);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, loading, error };
};

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchTerm, params = {}) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await postService.searchPosts(searchTerm, params);
      setResults(response.data.posts);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
};
