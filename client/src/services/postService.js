import api from "./api";

class PostService {
  // Public Methods (No Auth Required)
  async getPublishedPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      // Add search params
      if (params.search) queryParams.append("search", params.search);
      if (params.tag) queryParams.append("tag", params.tag);
      if (params.author) queryParams.append("author", params.author);

      // Add sorting params
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const url = `/posts${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostBySlug(slug) {
    try {
      const response = await api.get(`/posts/${slug}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostById(id) {
    try {
      const response = await api.get(`/posts/id/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentPosts(limit = 5) {
    try {
      const response = await api.get(
        `/posts?limit=${limit}&sortBy=createdAt&sortOrder=desc`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllTags() {
    try {
      const response = await api.get("/posts/tags");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchPosts(searchTerm, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...params,
      });

      const response = await api.get(`/posts/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Methods (Auth Required)
  async getAllPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.status) queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const url = `/posts/admin/all${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPost(postData) {
    try {
      const response = await api.post("/posts", postData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePost(id, postData) {
    try {
      console.log("PostService: Updating post with ID:", id);
      console.log("PostService: Update data:", postData);

      // Update directly using the ID endpoint
      const response = await api.put(`/posts/id/${id}`, postData);
      console.log("PostService: Update response:", response.data);

      return response.data;
    } catch (error) {
      console.error("PostService: Update error:", error);
      throw this.handleError(error);
    }
  }

  async deletePost(id) {
    try {
      console.log("PostService: Deleting post with ID:", id);

      // Delete directly using the ID endpoint
      const response = await api.delete(`/posts/id/${id}`);
      console.log("PostService: Delete response:", response.data);

      return response.data;
    } catch (error) {
      console.error("PostService: Delete error:", error);
      throw this.handleError(error);
    }
  }

  async publishPost(id) {
    try {
      const response = await api.post(`/posts/${id}/publish`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unpublishPost(id) {
    try {
      const response = await api.post(`/posts/${id}/unpublish`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostStats() {
    try {
      const response = await api.get("/posts/admin/stats");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility Methods
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return this.formatDate(dateString);
  }

  getReadingTime(content) {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  }

  truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  }

  handleError(error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      "An unexpected error occurred";

    const statusCode = error.response?.status;
    const errorCode = error.response?.data?.error?.code;

    return {
      message,
      statusCode,
      errorCode,
      details: error.response?.data?.error?.details,
    };
  }
}

export default new PostService();
