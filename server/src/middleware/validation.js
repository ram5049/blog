const { sendValidationError } = require("../utils/responses");
const logger = require("../config/logger");

/**
 * Validate request data using Joi schema
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false, // Validate all fields
        stripUnknown: true, // Remove unknown fields
        convert: true, // Convert types when possible
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
        }));

        logger.warn(`Validation error for ${property}:`, errors);
        return sendValidationError(res, errors);
      }

      // Replace the request property with validated value
      req[property] = value;
      next();
    } catch (err) {
      logger.error("Validation middleware error:", err);
      return sendValidationError(res, [
        {
          field: "general",
          message: "Validation failed",
        },
      ]);
    }
  };
};

/**
 * Validate request body
 */
const validateBody = (schema) => validate(schema, "body");

/**
 * Validate request query parameters
 */
const validateQuery = (schema) => validate(schema, "query");

/**
 * Validate request params
 */
const validateParams = (schema) => validate(schema, "params");

/**
 * Validate multiple request parts
 */
const validateRequest = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each part of the request
    for (const [property, schema] of Object.entries(schemas)) {
      if (schema && req[property]) {
        const { error, value } = schema.validate(req[property], {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });

        if (error) {
          const propertyErrors = error.details.map((detail) => ({
            field: `${property}.${detail.path.join(".")}`,
            message: detail.message,
            value: detail.context?.value,
          }));
          errors.push(...propertyErrors);
        } else {
          req[property] = value;
        }
      }
    }

    if (errors.length > 0) {
      logger.warn("Request validation errors:", errors);
      return sendValidationError(res, errors);
    }

    next();
  };
};

/**
 * Custom validation for file uploads
 */
const validateFile = (options = {}) => {
  const {
    required = false,
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    fieldName = "file",
  } = options;

  return (req, res, next) => {
    try {
      const file = req.file || req.files?.[fieldName];

      if (!file && required) {
        return sendValidationError(res, [
          {
            field: fieldName,
            message: "File is required",
          },
        ]);
      }

      if (file) {
        // Check file size
        if (file.size > maxSize) {
          return sendValidationError(res, [
            {
              field: fieldName,
              message: `File size cannot exceed ${maxSize / (1024 * 1024)}MB`,
            },
          ]);
        }

        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          return sendValidationError(res, [
            {
              field: fieldName,
              message: `File type must be one of: ${allowedTypes.join(", ")}`,
            },
          ]);
        }
      }

      next();
    } catch (error) {
      logger.error("File validation error:", error);
      return sendValidationError(res, [
        {
          field: fieldName,
          message: "File validation failed",
        },
      ]);
    }
  };
};

/**
 * Sanitize request data to prevent injection attacks
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Recursively sanitize object
    const sanitize = (obj) => {
      if (typeof obj === "string") {
        // Remove potential script tags and dangerous characters
        return obj
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      if (obj && typeof obj === "object") {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }

      return obj;
    };

    // Sanitize body, query, and params
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
  } catch (error) {
    logger.error("Input sanitization error:", error);
    next(); // Continue even if sanitization fails
  }
};

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateRequest,
  validateFile,
  sanitizeInput,
};
