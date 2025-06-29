const postService = require("../services/postService");
const { sendSuccess, sendError } = require("../utils/responses");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS, POST_STATUS } = require("../utils/constants");
const logger = require("../config/logger");

/**
 * Post Controller
 * Handles HTTP requests for post operations
 */
class PostController {
  /**
   * Get all published posts (public)
   * GET /api/posts
   */
  getPublishedPosts = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search,
      tags: req.query.tags,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await postService.getPublishedPosts(options);

    return sendSuccess(
      res,
      result,
      "Posts retrieved successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get all posts including drafts (admin)
   * GET /api/posts/admin/all
   */
  getAllPostsAdmin = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      search: req.query.search,
      tags: req.query.tags,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      authorId: req.query.authorId,
    };

    // If user is not admin, only show their own posts
    if (req.user.role !== "admin") {
      options.authorId = req.user.id;
    }

    const result = await postService.getAllPosts(options);

    return sendSuccess(
      res,
      result,
      "Posts retrieved successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get single post by slug
   * GET /api/posts/:slug
   */
  getPostBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const isPublicView = !req.user; // If no user, it's a public view

    const post = await postService.getPostBySlug(slug, isPublicView);

    return sendSuccess(
      res,
      { post },
      "Post retrieved successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get post by ID
   * GET /api/posts/id/:id
   */
  getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isPublicView = !req.user; // If no user, it's a public view

    const post = await postService.getPostById(id, isPublicView);

    return sendSuccess(
      res,
      { post },
      "Post retrieved successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Create new post
   * POST /api/posts
   */
  createPost = asyncHandler(async (req, res) => {
    const postData = req.body;
    const authorId = req.user.id;

    const post = await postService.createPost(postData, authorId);

    logger.info(
      `Post created: ${post.title} (${post.slug}) by ${req.user.username}`
    );

    return sendSuccess(
      res,
      { post },
      "Post created successfully",
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Update existing post
   * PUT /api/posts/:slug
   */
  updatePost = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const updateData = req.body;
    const authorId = req.user.id;

    const post = await postService.updatePost(slug, updateData, authorId);

    logger.info(`Post updated: ${post.slug} by ${req.user.username}`);

    return sendSuccess(
      res,
      { post },
      "Post updated successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Delete post
   * DELETE /api/posts/:slug
   */
  deletePost = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const authorId = req.user.id;

    const result = await postService.deletePost(slug, authorId);

    logger.info(`Post deleted: ${slug} by ${req.user.username}`);

    return sendSuccess(res, null, result.message, HTTP_STATUS.OK);
  });

  /**
   * Delete post by ID
   * DELETE /api/posts/id/:id
   */
  deletePostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const authorId = req.user.id;

    const result = await postService.deletePostById(id, authorId);

    logger.info(`Post deleted by ID: ${id} by ${req.user.username}`);

    return sendSuccess(res, null, result.message, HTTP_STATUS.OK);
  });

  /**
   * Search posts
   * GET /api/posts/search
   */
  searchPosts = asyncHandler(async (req, res) => {
    const { q: searchTerm } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return sendError(
        res,
        "Search term must be at least 2 characters",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.user ? req.query.status : POST_STATUS.PUBLISHED, // Only published for public
    };

    const result = await postService.searchPosts(searchTerm.trim(), options);

    return sendSuccess(
      res,
      result,
      "Search completed successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get post statistics
   * GET /api/posts/admin/stats
   */
  getPostStats = asyncHandler(async (req, res) => {
    // Pass user info to filter stats for non-admin users
    const userId = req.user.role !== "admin" ? req.user.id : null;
    const stats = await postService.getPostStats(userId);

    return sendSuccess(res, stats, "Post statistics retrieved", HTTP_STATUS.OK);
  });

  /**
   * Get all tags
   * GET /api/posts/tags
   */
  getAllTags = asyncHandler(async (req, res) => {
    const tags = await postService.getAllTags();

    return sendSuccess(
      res,
      { tags },
      "Tags retrieved successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get recent posts
   * GET /api/posts/recent
   */
  getRecentPosts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;

    if (limit > 20) {
      return sendError(res, "Limit cannot exceed 20", HTTP_STATUS.BAD_REQUEST);
    }

    const posts = await postService.getRecentPosts(limit);

    return sendSuccess(
      res,
      { posts },
      "Recent posts retrieved",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get posts by tag
   * GET /api/posts/tag/:tag
   */
  getPostsByTag = asyncHandler(async (req, res) => {
    const { tag } = req.params;

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      tags: tag,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await postService.getPublishedPosts(options);

    return sendSuccess(
      res,
      {
        ...result,
        tag,
      },
      `Posts with tag '${tag}' retrieved`,
      HTTP_STATUS.OK
    );
  });

  /**
   * Get post preview (admin/editor only)
   * GET /api/posts/:slug/preview
   */
  getPostPreview = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    // Get post without incrementing views
    const post = await postService.getPostBySlug(slug, false);

    return sendSuccess(res, { post }, "Post preview retrieved", HTTP_STATUS.OK);
  });

  /**
   * Duplicate post (admin/editor only)
   * POST /api/posts/:slug/duplicate
   */
  duplicatePost = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const authorId = req.user.id;

    // Get original post
    const originalPost = await postService.getPostBySlug(slug, false);

    // Create duplicate with modified title and draft status
    const duplicateData = {
      title: `Copy of ${originalPost.title}`,
      content: originalPost.content,
      excerpt: originalPost.excerpt,
      status: POST_STATUS.DRAFT,
      featuredImage: originalPost.featuredImage,
      tags: originalPost.tags,
      metaDescription: originalPost.metaDescription,
    };

    const duplicatedPost = await postService.createPost(
      duplicateData,
      authorId
    );

    logger.info(
      `Post duplicated: ${slug} -> ${duplicatedPost.slug} by ${req.user.username}`
    );

    return sendSuccess(
      res,
      { post: duplicatedPost },
      "Post duplicated successfully",
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Get posts by author
   * GET /api/posts/author/:authorId
   */
  getPostsByAuthor = asyncHandler(async (req, res) => {
    const { authorId } = req.params;

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      authorId,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    // For public view, only show published posts
    if (!req.user) {
      const result = await postService.getPublishedPosts(options);
      return sendSuccess(res, result, "Author posts retrieved", HTTP_STATUS.OK);
    }

    // For authenticated users, show all posts if admin or own posts
    if (req.user.role === "admin" || req.user.id === authorId) {
      const result = await postService.getAllPosts(options);
      return sendSuccess(res, result, "Author posts retrieved", HTTP_STATUS.OK);
    }

    // Otherwise, only published posts
    const result = await postService.getPublishedPosts(options);
    return sendSuccess(res, result, "Author posts retrieved", HTTP_STATUS.OK);
  });

  /**
   * Bulk update posts status (admin only)
   * PUT /api/posts/bulk/status
   */
  bulkUpdateStatus = asyncHandler(async (req, res) => {
    const { postIds, status } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return sendError(
        res,
        "Post IDs array is required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!Object.values(POST_STATUS).includes(status)) {
      return sendError(res, "Invalid status value", HTTP_STATUS.BAD_REQUEST);
    }

    // Update posts
    const { Post } = require("../models");
    const updateResult = await Post.updateMany(
      { _id: { $in: postIds } },
      { status, updatedAt: new Date() }
    );

    logger.info(
      `Bulk status update: ${updateResult.modifiedCount} posts updated to ${status} by ${req.user.username}`
    );

    return sendSuccess(
      res,
      {
        updatedCount: updateResult.modifiedCount,
        status,
      },
      "Posts status updated successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Bulk delete posts (admin only)
   * DELETE /api/posts/bulk
   */
  bulkDeletePosts = asyncHandler(async (req, res) => {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return sendError(
        res,
        "Post IDs array is required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const { Post } = require("../models");
    const deleteResult = await Post.deleteMany({
      _id: { $in: postIds },
    });

    logger.info(
      `Bulk delete: ${deleteResult.deletedCount} posts deleted by ${req.user.username}`
    );

    return sendSuccess(
      res,
      {
        deletedCount: deleteResult.deletedCount,
      },
      "Posts deleted successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Publish a post
   * POST /api/posts/:id/publish
   */
  publishPost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await postService.publishPost(postId, userId);

    logger.info(`Post published: ${post.title} by ${req.user.username}`);

    return sendSuccess(
      res,
      { post },
      "Post published successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Unpublish a post
   * POST /api/posts/:id/unpublish
   */
  unpublishPost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await postService.unpublishPost(postId, userId);

    logger.info(`Post unpublished: ${post.title} by ${req.user.username}`);

    return sendSuccess(
      res,
      { post },
      "Post unpublished successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Update existing post by ID
   * PUT /api/posts/id/:id
   */
  updatePostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const authorId = req.user.id;

    const post = await postService.updatePostById(id, updateData, authorId);

    logger.info(`Post updated by ID: ${id} by ${req.user.username}`);

    return sendSuccess(
      res,
      { post },
      "Post updated successfully",
      HTTP_STATUS.OK
    );
  });
}

module.exports = new PostController();
