const express = require("express");
const authRoutes = require("./auth");
const postRoutes = require("./posts");

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Blog API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);

// API documentation endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Blog API v1.0.0",
    documentation: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login user",
        "POST /api/auth/logout": "Logout user (requires auth)",
        "POST /api/auth/refresh": "Refresh access token",
        "GET /api/auth/profile": "Get user profile (requires auth)",
        "PUT /api/auth/profile": "Update user profile (requires auth)",
        "PUT /api/auth/change-password": "Change password (requires auth)",
      },
      posts: {
        "GET /api/posts": "Get all published posts (public)",
        "GET /api/posts/search": "Search posts (public)",
        "GET /api/posts/tags": "Get all tags (public)",
        "GET /api/posts/stats": "Get posts statistics (public)",
        "GET /api/posts/my": "Get current user posts (requires auth)",
        "GET /api/posts/:id":
          "Get post by ID (public if published, auth required for drafts)",
        "GET /api/posts/slug/:slug": "Get post by slug (public if published)",
        "POST /api/posts": "Create new post (requires auth)",
        "PUT /api/posts/:id": "Update post (requires auth + ownership/admin)",
        "DELETE /api/posts/:id":
          "Delete post (requires auth + ownership/admin)",
        "POST /api/posts/:id/publish":
          "Publish post (requires auth + ownership/admin)",
        "POST /api/posts/:id/unpublish":
          "Unpublish post (requires auth + ownership/admin)",
      },
    },
    endpoints: {
      health: "GET /api/health",
      root: "GET /api/",
    },
  });
});

module.exports = router;
