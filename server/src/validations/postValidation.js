const Joi = require("joi");
const { VALIDATION, POST_STATUS, REGEX } = require("../utils/constants");

/**
 * Post validation schemas
 */

// Create post validation
const createPostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(VALIDATION.TITLE.MAX_LENGTH)
    .required()
    .messages({
      "string.min": "Title cannot be empty",
      "string.max": "Title cannot exceed {#limit} characters",
      "any.required": "Title is required",
    }),
  content: Joi.string().trim().min(1).required().messages({
    "string.min": "Content cannot be empty",
    "any.required": "Content is required",
  }),
  excerpt: Joi.string()
    .trim()
    .max(VALIDATION.EXCERPT.MAX_LENGTH)
    .allow("")
    .optional()
    .messages({
      "string.max": "Excerpt cannot exceed {#limit} characters",
    }),
  status: Joi.string()
    .valid(...Object.values(POST_STATUS))
    .default(POST_STATUS.PUBLISHED)
    .messages({
      "any.only": "Status must be either draft or published",
    }),
  featuredImage: Joi.string().uri().allow(null, "").optional().messages({
    "string.uri": "Featured image must be a valid URL",
  }),
  tags: Joi.array()
    .items(
      Joi.string().trim().max(VALIDATION.TAG.MAX_LENGTH).messages({
        "string.max": "Each tag cannot exceed {#limit} characters",
      })
    )
    .max(10)
    .default([])
    .messages({
      "array.max": "Cannot have more than 10 tags",
    }),
  metaDescription: Joi.string()
    .trim()
    .max(VALIDATION.META_DESCRIPTION.MAX_LENGTH)
    .allow("")
    .optional()
    .messages({
      "string.max": "Meta description cannot exceed {#limit} characters",
    }),
  slug: Joi.string()
    .trim()
    .lowercase()
    .max(VALIDATION.SLUG.MAX_LENGTH)
    .pattern(REGEX.SLUG)
    .optional()
    .messages({
      "string.max": "Slug cannot exceed {#limit} characters",
      "string.pattern.base":
        "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
});

// Update post validation
const updatePostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(VALIDATION.TITLE.MAX_LENGTH)
    .optional()
    .messages({
      "string.min": "Title cannot be empty",
      "string.max": "Title cannot exceed {#limit} characters",
    }),
  content: Joi.string().trim().min(1).optional().messages({
    "string.min": "Content cannot be empty",
  }),
  excerpt: Joi.string()
    .trim()
    .max(VALIDATION.EXCERPT.MAX_LENGTH)
    .allow("")
    .optional()
    .messages({
      "string.max": "Excerpt cannot exceed {#limit} characters",
    }),
  status: Joi.string()
    .valid(...Object.values(POST_STATUS))
    .optional()
    .messages({
      "any.only": "Status must be either draft or published",
    }),
  featuredImage: Joi.string().uri().allow(null, "").optional().messages({
    "string.uri": "Featured image must be a valid URL",
  }),
  tags: Joi.array()
    .items(
      Joi.string().trim().max(VALIDATION.TAG.MAX_LENGTH).messages({
        "string.max": "Each tag cannot exceed {#limit} characters",
      })
    )
    .max(10)
    .optional()
    .messages({
      "array.max": "Cannot have more than 10 tags",
    }),
  metaDescription: Joi.string()
    .trim()
    .max(VALIDATION.META_DESCRIPTION.MAX_LENGTH)
    .allow("")
    .optional()
    .messages({
      "string.max": "Meta description cannot exceed {#limit} characters",
    }),
  slug: Joi.string()
    .trim()
    .lowercase()
    .max(VALIDATION.SLUG.MAX_LENGTH)
    .pattern(REGEX.SLUG)
    .optional()
    .messages({
      "string.max": "Slug cannot exceed {#limit} characters",
      "string.pattern.base":
        "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
});

// Query parameters validation for getting posts
const getPostsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 50",
  }),
  status: Joi.string()
    .valid(...Object.values(POST_STATUS))
    .optional()
    .messages({
      "any.only": "Status must be either draft or published",
    }),
  search: Joi.string().trim().max(100).optional().messages({
    "string.max": "Search query cannot exceed 100 characters",
  }),
  tags: Joi.string().trim().optional().messages({
    "string.base": "Tags must be a string",
  }),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "title", "views")
    .default("createdAt")
    .messages({
      "any.only": "Sort by must be one of: createdAt, updatedAt, title, views",
    }),
  sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
    "any.only": "Sort order must be either asc or desc",
  }),
});

// Slug parameter validation
const slugParamSchema = Joi.object({
  slug: Joi.string().trim().pattern(REGEX.SLUG).required().messages({
    "string.pattern.base": "Invalid slug format",
    "any.required": "Slug is required",
  }),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  slugParamSchema,
};
