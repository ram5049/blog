/**
 * Application constants
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Codes
const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFLICT_ERROR: "CONFLICT_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
};

// User Roles
const USER_ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
};

// Post Status
const POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

// JWT Configuration
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRE: "24h",
  REFRESH_TOKEN_EXPIRE: "7d",
  ISSUER: "blog-api",
  AUDIENCE: "blog-users",
};

// Rate Limiting
const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: "Too many login attempts, please try again later",
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Too many requests, please try again later",
  },
  POST_CREATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 posts per hour
    message: "Too many posts created, please try again later",
  },
};

// Validation Constants
const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
  TITLE: {
    MAX_LENGTH: 200,
  },
  EXCERPT: {
    MAX_LENGTH: 300,
  },
  META_DESCRIPTION: {
    MAX_LENGTH: 160,
  },
  TAG: {
    MAX_LENGTH: 50,
  },
  SLUG: {
    MAX_LENGTH: 100,
  },
};

// Default Values
const DEFAULTS = {
  ADMIN_USERNAME: "monika",
  ADMIN_EMAIL: "monika@blog.com",
  ADMIN_PASSWORD: "admin123",
  PAGINATION_LIMIT: 10,
  READ_TIME_WPM: 200, // Words per minute for read time calculation
};

// Regular Expressions
const REGEX = {
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  SLUG: /^[a-z0-9-]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
};

// CORS Configuration
const CORS_CONFIG = {
  development: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  },
  production: {
    origin: process.env.CORS_ORIGIN || [],
    credentials: true,
  },
};

module.exports = {
  HTTP_STATUS,
  ERROR_CODES,
  USER_ROLES,
  POST_STATUS,
  JWT_CONFIG,
  RATE_LIMITS,
  VALIDATION,
  DEFAULTS,
  REGEX,
  CORS_CONFIG,
};
