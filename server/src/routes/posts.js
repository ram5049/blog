const express = require("express");
const postController = require("../controllers/postController");
const {
  authenticateToken,
  requireRole,
  optionalAuth,
  requireOwnershipOrAdmin,
} = require("../middleware/auth");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../middleware/validation");
const {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  slugParamSchema,
} = require("../validations/postValidation");

const router = express.Router();

/**
 * Post Routes
 * Base path: /api/posts
 */

// Public routes - no authentication required
router.get(
  "/",
  validateQuery(getPostsQuerySchema),
  postController.getPublishedPosts
);

router.get(
  "/search",
  validateQuery(
    require("joi").object({
      q: require("joi").string().min(2).max(100).required(),
      page: require("joi").number().integer().min(1).default(1),
      limit: require("joi").number().integer().min(1).max(50).default(10),
      status: require("joi").string().valid("draft", "published"),
    })
  ),
  postController.searchPosts
);

router.get(
  "/recent",
  validateQuery(
    require("joi").object({
      limit: require("joi").number().integer().min(1).max(20).default(5),
    })
  ),
  postController.getRecentPosts
);

router.get("/tags", postController.getAllTags);

router.get(
  "/tag/:tag",
  validateParams(
    require("joi").object({
      tag: require("joi").string().max(50).required(),
    })
  ),
  validateQuery(getPostsQuerySchema),
  postController.getPostsByTag
);

router.get(
  "/author/:authorId",
  validateParams(
    require("joi").object({
      authorId: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    })
  ),
  validateQuery(getPostsQuerySchema),
  optionalAuth,
  postController.getPostsByAuthor
);

// Single post route - can be accessed publicly or with auth for preview
router.get(
  "/:slug",
  validateParams(slugParamSchema),
  optionalAuth,
  postController.getPostBySlug
);

// Get post by ID route (for admin/editor access)
router.get(
  "/id/:id",
  validateParams(
    require("joi").object({
      id: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    })
  ),
  authenticateToken,
  requireRole("admin", "editor"),
  postController.getPostById
);

// Update post by ID route (for admin/editor access)
router.put(
  "/id/:id",
  validateParams(
    require("joi").object({
      id: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    })
  ),
  validateBody(updatePostSchema),
  authenticateToken,
  requireRole("admin", "editor"),
  postController.updatePostById
);

// Delete post by ID route (for admin/editor access)
router.delete(
  "/id/:id",
  validateParams(
    require("joi").object({
      id: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    })
  ),
  authenticateToken,
  requireRole("admin", "editor"),
  postController.deletePostById
);

// Protected routes - require authentication
router.use(authenticateToken);

// Admin/Editor routes for managing posts
router.get(
  "/admin/all",
  requireRole("admin", "editor"),
  validateQuery(
    require("joi").object({
      page: require("joi").number().integer().min(1).default(1),
      limit: require("joi").number().integer().min(1).max(50).default(10),
      status: require("joi").string().valid("draft", "published"),
      search: require("joi").string().max(100),
      tags: require("joi").string().max(200),
      sortBy: require("joi")
        .string()
        .valid("createdAt", "updatedAt", "title", "views")
        .default("createdAt"),
      sortOrder: require("joi").string().valid("asc", "desc").default("desc"),
      authorId: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/),
    })
  ),
  postController.getAllPostsAdmin
);

router.get(
  "/admin/stats",
  requireRole("admin", "editor"),
  postController.getPostStats
);

router.post(
  "/",
  requireRole("admin", "editor"),
  validateBody(createPostSchema),
  postController.createPost
);

// Helper function to get post author ID for ownership check
const getPostAuthorId = async (req) => {
  const { Post } = require("../models");
  const post = await Post.findOne({ slug: req.params.slug });
  return post?.author;
};

router.get(
  "/:slug/preview",
  validateParams(slugParamSchema),
  requireRole("admin", "editor"),
  requireOwnershipOrAdmin(getPostAuthorId),
  postController.getPostPreview
);

router.put(
  "/:slug",
  validateParams(slugParamSchema),
  validateBody(updatePostSchema),
  requireRole("admin", "editor"),
  requireOwnershipOrAdmin(getPostAuthorId),
  postController.updatePost
);

router.delete(
  "/:slug",
  validateParams(slugParamSchema),
  requireRole("admin", "editor"),
  requireOwnershipOrAdmin(getPostAuthorId),
  postController.deletePost
);

router.post(
  "/:slug/duplicate",
  validateParams(slugParamSchema),
  requireRole("admin", "editor"),
  requireOwnershipOrAdmin(getPostAuthorId),
  postController.duplicatePost
);

// Post publishing routes (using ID instead of slug for easier access)
router.post(
  "/:id/publish",
  validateParams(
    require("joi").object({
      id: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    })
  ),
  requireRole("admin", "editor"),
  postController.publishPost
);

router.post(
  "/:id/unpublish",
  validateParams(
    require("joi").object({
      id: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    })
  ),
  requireRole("admin", "editor"),
  postController.unpublishPost
);

// Admin only routes
router.use(requireRole("admin"));

router.put(
  "/bulk/status",
  validateBody(
    require("joi").object({
      postIds: require("joi")
        .array()
        .items(
          require("joi")
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/)
        )
        .min(1)
        .max(50)
        .required(),
      status: require("joi").string().valid("draft", "published").required(),
    })
  ),
  postController.bulkUpdateStatus
);

router.delete(
  "/bulk",
  validateBody(
    require("joi").object({
      postIds: require("joi")
        .array()
        .items(
          require("joi")
            .string()
            .pattern(/^[0-9a-fA-F]{24}$/)
        )
        .min(1)
        .max(50)
        .required(),
    })
  ),
  postController.bulkDeletePosts
);

module.exports = router;
