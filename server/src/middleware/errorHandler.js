const { sendError } = require("../utils/responses");
const { HTTP_STATUS, ERROR_CODES } = require("../utils/constants");
const logger = require("../config/logger");

/**
 * Global error handling middleware
 * This should be the last middleware in the stack
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error("Error caught by global handler:", {
    error: error.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.username || "anonymous",
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Invalid resource ID format";
    return sendError(
      res,
      message,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } '${value}' already exists`;
    return sendError(
      res,
      message,
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT_ERROR
    );
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return sendError(
      res,
      "Validation failed",
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      errors
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(
      res,
      "Invalid token",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  if (err.name === "TokenExpiredError") {
    return sendError(
      res,
      "Token expired",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  // MongoDB connection errors
  if (
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError"
  ) {
    return sendError(
      res,
      "Database connection error",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.DATABASE_ERROR
    );
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return sendError(
      res,
      "File too large",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return sendError(
      res,
      "Unexpected file field",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    return sendError(
      res,
      err.message || "Too many requests",
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_ERROR
    );
  }

  // Syntax errors in JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(
      res,
      "Invalid JSON format",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Permission/Authorization errors
  if (err.name === "UnauthorizedError" || err.statusCode === 401) {
    return sendError(
      res,
      err.message || "Unauthorized access",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  if (err.statusCode === 403) {
    return sendError(
      res,
      err.message || "Access forbidden",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  // Not found errors
  if (err.statusCode === 404) {
    return sendError(
      res,
      err.message || "Resource not found",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND_ERROR
    );
  }

  // Default server error
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message || "Internal server error";

  return sendError(res, message, statusCode, ERROR_CODES.INTERNAL_ERROR);
};

/**
 * Handle 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(
    `404 - Route not found: ${req.method} ${req.originalUrl} from IP: ${req.ip}`
  );
  return sendError(
    res,
    message,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND_ERROR
  );
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code = ERROR_CODES.INTERNAL_ERROR
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = () => {
  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", err);
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  handleUncaughtException,
  handleUnhandledRejection,
};
