const rateLimit = require("express-rate-limit");
const { RATE_LIMITS } = require("../utils/constants");
const { sendRateLimitError } = require("../utils/responses");
const logger = require("../config/logger");

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req, res) => {
  logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  return sendRateLimitError(res, "Too many requests, please try again later");
};

/**
 * Skip successful requests for certain endpoints
 */
const skipSuccessfulRequests = (req, res) => {
  return res.statusCode < 400;
};

/**
 * Generate client identifier for rate limiting
 */
const keyGenerator = (req) => {
  // Use combination of IP and user ID if authenticated
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.user?.id || "anonymous";
  return `${ip}:${userId}`;
};

/**
 * General rate limiter for API endpoints
 */
const generalRateLimit = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: RATE_LIMITS.GENERAL.message,
  handler: rateLimitHandler,
  keyGenerator,
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health" || req.path === "/api/health";
  },
});

/**
 * Strict rate limiter for login attempts
 */
const loginRateLimit = rateLimit({
  windowMs: RATE_LIMITS.LOGIN.windowMs,
  max: RATE_LIMITS.LOGIN.max,
  message: RATE_LIMITS.LOGIN.message,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    // For login, use IP and username combination
    const ip = req.ip || req.connection.remoteAddress;
    const username = req.body?.username || "unknown";
    return `login:${ip}:${username}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all login attempts
});

/**
 * Rate limiter for post creation
 */
const postCreationRateLimit = rateLimit({
  windowMs: RATE_LIMITS.POST_CREATION.windowMs,
  max: RATE_LIMITS.POST_CREATION.max,
  message: RATE_LIMITS.POST_CREATION.message,
  handler: rateLimitHandler,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: skipSuccessfulRequests,
});

/**
 * Lenient rate limiter for public endpoints
 */
const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // More generous for public endpoints
  message: "Too many requests from this IP, please try again later",
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for certain public endpoints that might be hit frequently
    const skipPaths = ["/api/posts", "/api/health"];
    return skipPaths.some((path) => req.path.startsWith(path));
  },
});

/**
 * Aggressive rate limiter for sensitive operations
 */
const sensitiveRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Very restrictive
  message: "Too many attempts for this sensitive operation",
  handler: rateLimitHandler,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Dynamic rate limiter based on user role
 */
const dynamicRateLimit = (options = {}) => {
  return (req, res, next) => {
    const user = req.user;
    let limits = RATE_LIMITS.GENERAL;

    // Adjust limits based on user role
    if (user) {
      if (user.role === "admin") {
        limits = {
          windowMs: RATE_LIMITS.GENERAL.windowMs,
          max: RATE_LIMITS.GENERAL.max * 2, // Double the limit for admins
          message: "Rate limit exceeded",
        };
      } else if (user.role === "editor") {
        limits = {
          windowMs: RATE_LIMITS.GENERAL.windowMs,
          max: Math.floor(RATE_LIMITS.GENERAL.max * 1.5), // 50% more for editors
          message: "Rate limit exceeded",
        };
      }
    }

    // Apply custom options
    const finalLimits = { ...limits, ...options };

    const limiter = rateLimit({
      windowMs: finalLimits.windowMs,
      max: finalLimits.max,
      message: finalLimits.message,
      handler: rateLimitHandler,
      keyGenerator,
      standardHeaders: true,
      legacyHeaders: false,
    });

    limiter(req, res, next);
  };
};

/**
 * Rate limiter for file uploads
 */
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: "Too many file uploads, please try again later",
  handler: rateLimitHandler,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: skipSuccessfulRequests,
});

module.exports = {
  generalRateLimit,
  loginRateLimit,
  postCreationRateLimit,
  publicRateLimit,
  sensitiveRateLimit,
  dynamicRateLimit,
  uploadRateLimit,
};
