/**
 * Standardized API response utilities
 */

/**
 * Success response format
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Response object
 */
const sendSuccess = (
  res,
  data = null,
  message = "Operation successful",
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Error response format
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Array} details - Error details
 * @returns {Object} - Response object
 */
const sendError = (
  res,
  message = "An error occurred",
  statusCode = 500,
  code = "INTERNAL_ERROR",
  details = []
) => {
  const response = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 * @returns {Object} - Response object
 */
const sendValidationError = (res, errors = []) => {
  return sendError(res, "Validation failed", 400, "VALIDATION_ERROR", errors);
};

/**
 * Authentication error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Response object
 */
const sendAuthError = (res, message = "Authentication failed") => {
  return sendError(res, message, 401, "AUTHENTICATION_ERROR");
};

/**
 * Authorization error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Response object
 */
const sendAuthorizationError = (res, message = "Access denied") => {
  return sendError(res, message, 403, "AUTHORIZATION_ERROR");
};

/**
 * Not found error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Response object
 */
const sendNotFoundError = (res, message = "Resource not found") => {
  return sendError(res, message, 404, "NOT_FOUND_ERROR");
};

/**
 * Conflict error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Response object
 */
const sendConflictError = (res, message = "Resource already exists") => {
  return sendError(res, message, 409, "CONFLICT_ERROR");
};

/**
 * Rate limit error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} - Response object
 */
const sendRateLimitError = (res, message = "Too many requests") => {
  return sendError(res, message, 429, "RATE_LIMIT_ERROR");
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendAuthError,
  sendAuthorizationError,
  sendNotFoundError,
  sendConflictError,
  sendRateLimitError,
};
