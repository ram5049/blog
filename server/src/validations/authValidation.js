const Joi = require("joi");
const { VALIDATION, REGEX } = require("../utils/constants");

/**
 * Authentication validation schemas
 */

// Login validation
const loginSchema = Joi.object({
  username: Joi.string()
    .min(VALIDATION.USERNAME.MIN_LENGTH)
    .max(VALIDATION.USERNAME.MAX_LENGTH)
    .pattern(REGEX.USERNAME)
    .required()
    .messages({
      "string.min": "Username must be at least {#limit} characters",
      "string.max": "Username cannot exceed {#limit} characters",
      "string.pattern.base":
        "Username can only contain letters, numbers, underscores, and hyphens",
      "any.required": "Username is required",
    }),
  password: Joi.string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH)
    .max(VALIDATION.PASSWORD.MAX_LENGTH)
    .required()
    .messages({
      "string.min": "Password must be at least {#limit} characters",
      "string.max": "Password cannot exceed {#limit} characters",
      "any.required": "Password is required",
    }),
});

// User creation validation
const createUserSchema = Joi.object({
  username: Joi.string()
    .min(VALIDATION.USERNAME.MIN_LENGTH)
    .max(VALIDATION.USERNAME.MAX_LENGTH)
    .pattern(REGEX.USERNAME)
    .required()
    .messages({
      "string.min": "Username must be at least {#limit} characters",
      "string.max": "Username cannot exceed {#limit} characters",
      "string.pattern.base":
        "Username can only contain letters, numbers, underscores, and hyphens",
      "any.required": "Username is required",
    }),
  email: Joi.string().email().pattern(REGEX.EMAIL).required().messages({
    "string.email": "Please enter a valid email address",
    "string.pattern.base": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least {#limit} characters",
    "string.max": "Name cannot exceed {#limit} characters",
    "any.required": "Name is required",
  }),
  password: Joi.string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH)
    .max(VALIDATION.PASSWORD.MAX_LENGTH)
    .required()
    .messages({
      "string.min": "Password must be at least {#limit} characters",
      "string.max": "Password cannot exceed {#limit} characters",
      "any.required": "Password is required",
    }),
  role: Joi.string().valid("admin", "editor").default("admin").messages({
    "any.only": "Role must be either admin or editor",
  }),
});

// Password change validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH)
    .max(VALIDATION.PASSWORD.MAX_LENGTH)
    .required()
    .messages({
      "string.min": "New password must be at least {#limit} characters",
      "string.max": "New password cannot exceed {#limit} characters",
      "any.required": "New password is required",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Password confirmation does not match new password",
      "any.required": "Password confirmation is required",
    }),
});

// Refresh token validation
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

module.exports = {
  loginSchema,
  createUserSchema,
  changePasswordSchema,
  refreshTokenSchema,
};
