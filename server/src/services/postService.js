const { Post } = require("../models");
const { generateUniqueSlug } = require("../utils/generateSlug");
const { sanitizeHtml, extractPlainText } = require("../utils/sanitizeHtml");
const { AppError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  ERROR_CODES,
  POST_STATUS,
  DEFAULTS,
} = require("../utils/constants");
const logger = require("../config/logger");
const mongoose = require("mongoose");

/**
 * Post Service
 * Handles all post-related business logic
 */
class PostService {
  /**
   * Create a new blog post
   * @param {Object} postData - Post data
   * @param {string} authorId - Author's user ID
   * @returns {Object} - Created post
   */
  async createPost(postData, authorId) {
    try {
      const {
        title,
        content,
        excerpt,
        status = POST_STATUS.PUBLISHED,
        featuredImage,
        tags = [],
        metaDescription,
        slug: customSlug,
      } = postData;

      // Sanitize HTML content
      const sanitizedContent = sanitizeHtml(content);

      if (!sanitizedContent.trim()) {
        throw new AppError(
          "Content cannot be empty after sanitization",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      // Generate unique slug
      const slug = customSlug || (await generateUniqueSlug(title, Post));

      // Auto-generate excerpt if not provided
      let finalExcerpt = excerpt;
      if (!finalExcerpt) {
        const plainText = extractPlainText(sanitizedContent);
        finalExcerpt =
          plainText.length > 150
            ? plainText.substring(0, 150) + "..."
            : plainText;
      }

      // Create post
      const post = new Post({
        title: title.trim(),
        content: sanitizedContent,
        slug,
        excerpt: finalExcerpt,
        status,
        featuredImage: featuredImage || null,
        tags: tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        metaDescription: metaDescription || finalExcerpt.substring(0, 160),
        author: authorId,
      });

      await post.save();

      // Populate author data
      await post.populate("author", "username email");

      logger.info(`Post created: ${title} (${slug}) by user ${authorId}`);

      return post;
    } catch (error) {
      logger.error("Post creation failed:", error);
      throw error;
    }
  }

  /**
   * Get all published posts for public view
   * @param {Object} options - Query options
   * @returns {Object} - Posts with pagination
   */
  async getPublishedPosts(options = {}) {
    try {
      const {
        page = 1,
        limit = DEFAULTS.PAGINATION_LIMIT,
        search,
        tags,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const query = { status: POST_STATUS.PUBLISHED };

      // Add search functionality
      if (search) {
        query.$text = { $search: search };
      }

      // Filter by tags
      if (tags) {
        const tagArray = tags.split(",").map((tag) => tag.trim());
        query.tags = { $in: tagArray };
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [posts, total] = await Promise.all([
        Post.find(query)
          .populate("author", "username")
          .select("-content") // Exclude content for listing
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Post.countDocuments(query),
      ]);

      return {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Get published posts failed:", error);
      throw error;
    }
  }

  /**
   * Get all posts for admin (including drafts)
   * @param {Object} options - Query options
   * @returns {Object} - Posts with pagination
   */
  async getAllPosts(options = {}) {
    try {
      const {
        page = 1,
        limit = DEFAULTS.PAGINATION_LIMIT,
        status,
        search,
        tags,
        sortBy = "createdAt",
        sortOrder = "desc",
        authorId,
      } = options;

      const query = {};

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by author
      if (authorId) {
        query.author = authorId;
      }

      // Add search functionality
      if (search) {
        query.$text = { $search: search };
      }

      // Filter by tags
      if (tags) {
        const tagArray = tags.split(",").map((tag) => tag.trim());
        query.tags = { $in: tagArray };
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [posts, total] = await Promise.all([
        Post.find(query)
          .populate("author", "username email")
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Post.countDocuments(query),
      ]);

      return {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Get all posts failed:", error);
      throw error;
    }
  }

  /**
   * Get a single post by slug
   * @param {string} slug - Post slug
   * @param {boolean} isPublicView - Whether this is a public view (increments views)
   * @returns {Object} - Post data
   */
  async getPostBySlug(slug, isPublicView = false) {
    try {
      const query = { slug };

      // For public view, only show published posts
      if (isPublicView) {
        query.status = POST_STATUS.PUBLISHED;
      }

      const post = await Post.findOne(query).populate(
        "author",
        "username email"
      );

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Increment views for public view
      if (isPublicView) {
        await post.incrementViews();
      }

      logger.info(`Post retrieved: ${slug} (public: ${isPublicView})`);

      return post;
    } catch (error) {
      logger.error(`Get post by slug failed: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Update a post
   * @param {string} slug - Post slug
   * @param {Object} updateData - Data to update
   * @param {string} authorId - Author's user ID (for ownership check)
   * @returns {Object} - Updated post
   */
  async updatePost(slug, updateData, authorId) {
    try {
      const post = await Post.findOne({ slug });

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Check ownership (unless user is admin)
      // This will be handled by middleware, but adding as backup
      if (post.author.toString() !== authorId) {
        // Note: This check should be handled by requireOwnershipOrAdmin middleware
        logger.warn(
          `Unauthorized update attempt on post ${slug} by user ${authorId}`
        );
      }

      const {
        title,
        content,
        excerpt,
        status,
        featuredImage,
        tags,
        metaDescription,
        slug: newSlug,
      } = updateData;

      // Update fields if provided
      if (title !== undefined) {
        post.title = title.trim();

        // Generate new slug if title changed and no custom slug provided
        if (!newSlug && title !== post.title) {
          post.slug = await generateUniqueSlug(title, Post, post._id);
        }
      }

      if (newSlug !== undefined && newSlug !== post.slug) {
        // Ensure new slug is unique
        post.slug = await generateUniqueSlug(newSlug, Post, post._id);
      }

      if (content !== undefined) {
        const sanitizedContent = sanitizeHtml(content);
        if (!sanitizedContent.trim()) {
          throw new AppError(
            "Content cannot be empty after sanitization",
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR
          );
        }
        post.content = sanitizedContent;
      }

      if (excerpt !== undefined) {
        post.excerpt = excerpt;
      } else if (content !== undefined && !excerpt) {
        // Auto-generate excerpt if content changed but excerpt not provided
        const plainText = extractPlainText(post.content);
        post.excerpt =
          plainText.length > 150
            ? plainText.substring(0, 150) + "..."
            : plainText;
      }

      if (status !== undefined) {
        post.status = status;
      }

      if (featuredImage !== undefined) {
        post.featuredImage = featuredImage;
      }

      if (tags !== undefined) {
        post.tags = tags
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }

      if (metaDescription !== undefined) {
        post.metaDescription = metaDescription;
      } else if (!post.metaDescription && post.excerpt) {
        post.metaDescription = post.excerpt.substring(0, 160);
      }

      await post.save();
      await post.populate("author", "username email");

      logger.info(`Post updated: ${post.slug} by user ${authorId}`);

      return post;
    } catch (error) {
      logger.error(`Post update failed: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Update a post by ID
   * @param {string} postId - Post's ID
   * @param {Object} updateData - Update data
   * @param {string} authorId - Author's user ID (for ownership check)
   * @returns {Object} - Updated post
   */
  async updatePostById(postId, updateData, authorId) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new AppError(
          "Invalid post ID",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const post = await Post.findById(postId);

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Check ownership (unless user is admin)
      if (post.author.toString() !== authorId) {
        logger.warn(
          `Unauthorized update attempt on post ${postId} by user ${authorId}`
        );
      }

      const {
        title,
        content,
        excerpt,
        status,
        featuredImage,
        tags,
        metaDescription,
      } = updateData;

      // Sanitize HTML content if provided
      let sanitizedContent = content;
      if (content !== undefined) {
        sanitizedContent = sanitizeHtml(content);
        if (!sanitizedContent.trim()) {
          throw new AppError(
            "Content cannot be empty after sanitization",
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR
          );
        }
      }

      // Prepare update data
      const updateFields = {};
      if (title !== undefined) updateFields.title = title.trim();
      if (content !== undefined) updateFields.content = sanitizedContent;
      if (excerpt !== undefined) updateFields.excerpt = excerpt;
      if (status !== undefined) updateFields.status = status;
      if (featuredImage !== undefined)
        updateFields.featuredImage = featuredImage;
      if (tags !== undefined) {
        updateFields.tags = tags
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      }
      if (metaDescription !== undefined)
        updateFields.metaDescription = metaDescription;

      updateFields.updatedAt = new Date();

      // Update the post
      const updatedPost = await Post.findByIdAndUpdate(postId, updateFields, {
        new: true,
        runValidators: true,
      }).populate("author", "username email");

      logger.info(
        `Post updated: ${updatedPost.title} (ID: ${postId}) by user ${authorId}`
      );

      return updatedPost;
    } catch (error) {
      logger.error(`Post update failed: ${postId}`, error);
      throw error;
    }
  }

  /**
   * Delete a post
   * @param {string} slug - Post slug
   * @param {string} authorId - Author's user ID (for ownership check)
   * @returns {Object} - Success message
   */
  async deletePost(slug, authorId) {
    try {
      const post = await Post.findOne({ slug });

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Check ownership (unless user is admin)
      // This will be handled by middleware, but adding as backup
      if (post.author.toString() !== authorId) {
        logger.warn(
          `Unauthorized delete attempt on post ${slug} by user ${authorId}`
        );
      }

      await Post.findOneAndDelete({ slug });

      logger.info(`Post deleted: ${slug} by user ${authorId}`);

      return { message: "Post deleted successfully" };
    } catch (error) {
      logger.error(`Post deletion failed: ${slug}`, error);
      throw error;
    }
  }

  /**
   * Delete a post by ID
   * @param {string} postId - Post's ID
   * @param {string} authorId - Author's user ID (for ownership check)
   * @returns {Object} - Success message
   */
  async deletePostById(postId, authorId) {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new AppError(
          "Invalid post ID",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const post = await Post.findById(postId);

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Check ownership (unless user is admin)
      // This will be handled by middleware, but adding as backup
      if (post.author.toString() !== authorId) {
        logger.warn(
          `Unauthorized delete attempt on post ${postId} by user ${authorId}`
        );
      }

      await Post.findByIdAndDelete(postId);

      logger.info(
        `Post deleted: ${post.title} (ID: ${postId}) by user ${authorId}`
      );

      return { message: "Post deleted successfully" };
    } catch (error) {
      logger.error(`Post deletion failed: ${postId}`, error);
      throw error;
    }
  }

  /**
   * Get post statistics
   * @param {string|null} userId - User ID to filter stats (null for admin to see all)
   * @returns {Object} - Post statistics
   */
  async getPostStats(userId = null) {
    try {
      // Get current date boundaries for this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Build filter object - if userId is provided, filter by author
      const authorFilter = userId
        ? { author: new mongoose.Types.ObjectId(userId) }
        : {};

      const [
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        thisMonthPosts,
        lastMonthPosts,
        recentPosts,
        popularPosts,
      ] = await Promise.all([
        Post.countDocuments(authorFilter),
        Post.countDocuments({ ...authorFilter, status: POST_STATUS.PUBLISHED }),
        Post.countDocuments({ ...authorFilter, status: POST_STATUS.DRAFT }),
        Post.aggregate([
          ...(userId
            ? [
                {
                  $match: {
                    author: new mongoose.Types.ObjectId(userId),
                  },
                },
              ]
            : []),
          { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]),
        Post.countDocuments({
          ...authorFilter,
          createdAt: { $gte: firstDayOfMonth },
          status: POST_STATUS.PUBLISHED,
        }),
        Post.countDocuments({
          ...authorFilter,
          createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth },
          status: POST_STATUS.PUBLISHED,
        }),
        Post.find(authorFilter)
          .sort({ createdAt: -1 })
          .limit(5)
          .select("title slug status createdAt updatedAt")
          .populate("author", "username"),
        Post.find({ ...authorFilter, status: POST_STATUS.PUBLISHED })
          .sort({ views: -1 })
          .limit(5)
          .select("title slug views")
          .populate("author", "username"),
      ]);

      // Calculate monthly growth percentage
      const monthlyGrowth =
        lastMonthPosts > 0
          ? Math.round(
              ((thisMonthPosts - lastMonthPosts) / lastMonthPosts) * 100
            )
          : thisMonthPosts > 0
          ? 100
          : 0;

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        thisMonth: thisMonthPosts,
        monthlyGrowth,
        totalViews: totalViews[0]?.totalViews || 0,
        recentPosts,
        popularPosts,
      };
    } catch (error) {
      logger.error("Get post stats failed:", error);
      throw error;
    }
  }

  /**
   * Search posts by text
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Object} - Search results
   */
  async searchPosts(searchTerm, options = {}) {
    try {
      const {
        page = 1,
        limit = DEFAULTS.PAGINATION_LIMIT,
        status = POST_STATUS.PUBLISHED,
      } = options;

      const query = {
        $text: { $search: searchTerm },
        status,
      };

      const skip = (page - 1) * limit;

      const [posts, total] = await Promise.all([
        Post.find(query, { score: { $meta: "textScore" } })
          .populate("author", "username")
          .select("-content")
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(limit),
        Post.countDocuments(query),
      ]);

      return {
        posts,
        searchTerm,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error(`Post search failed for term: ${searchTerm}`, error);
      throw error;
    }
  }

  /**
   * Get all unique tags
   * @returns {Array} - Array of unique tags
   */
  async getAllTags() {
    try {
      const tags = await Post.distinct("tags", {
        status: POST_STATUS.PUBLISHED,
      });

      return tags.sort();
    } catch (error) {
      logger.error("Get all tags failed:", error);
      throw error;
    }
  }

  /**
   * Get recent posts
   * @param {number} limit - Number of posts to return
   * @returns {Array} - Array of recent posts
   */
  async getRecentPosts(limit = 5) {
    try {
      const posts = await Post.find({ status: POST_STATUS.PUBLISHED })
        .populate("author", "username")
        .select("title slug excerpt createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);

      return posts;
    } catch (error) {
      logger.error("Get recent posts failed:", error);
      throw error;
    }
  }

  /**
   * Publish a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID requesting the publish
   * @returns {Object} - Updated post
   */
  async publishPost(postId, userId) {
    try {
      const post = await Post.findById(postId);

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Check if already published
      if (post.status === POST_STATUS.PUBLISHED) {
        throw new AppError(
          "Post is already published",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      // Update post status
      post.status = POST_STATUS.PUBLISHED;
      post.publishedAt = new Date();

      await post.save();
      await post.populate("author", "username name");

      logger.info(`Post published: ${post.title} (${post.slug})`);

      return post;
    } catch (error) {
      logger.error("Publish post failed:", error);
      throw error;
    }
  }

  /**
   * Unpublish a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID requesting the unpublish
   * @returns {Object} - Updated post
   */
  async unpublishPost(postId, userId) {
    try {
      const post = await Post.findById(postId);

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Check if already unpublished
      if (post.status === POST_STATUS.DRAFT) {
        throw new AppError(
          "Post is already unpublished",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      // Update post status
      post.status = POST_STATUS.DRAFT;
      post.publishedAt = null;

      await post.save();
      await post.populate("author", "username name");

      logger.info(`Post unpublished: ${post.title} (${post.slug})`);

      return post;
    } catch (error) {
      logger.error("Unpublish post failed:", error);
      throw error;
    }
  }

  /**
   * Get post by ID
   * @param {string} postId - Post ID
   * @param {boolean} isPublicView - Whether this is a public view (only published posts)
   * @returns {Object} - Post object
   */
  async getPostById(postId, isPublicView = false) {
    try {
      const query = { _id: postId };

      // If public view, only show published posts
      if (isPublicView) {
        query.status = POST_STATUS.PUBLISHED;
      }

      const post = await Post.findOne(query)
        .populate("author", "username name email")
        .lean();

      if (!post) {
        throw new AppError(
          "Post not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      return post;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Get post by ID failed:", error);
      throw new AppError(
        "Failed to retrieve post",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new PostService();
