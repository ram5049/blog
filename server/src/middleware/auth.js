const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { sendAuthError, sendAuthorizationError } = require("../utils/responses");
const { JWT_CONFIG } = require("../utils/constants");
const logger = require("../config/logger");

/**
 * Verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return sendAuthError(res, "Access token is required");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and check if still active
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return sendAuthError(res, "User not found");
    }

    if (!user.isActive) {
      return sendAuthorizationError(res, "User account is deactivated");
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    logger.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return sendAuthError(res, "Invalid token");
    }

    if (error.name === "TokenExpiredError") {
      return sendAuthError(res, "Token expired");
    }

    return sendAuthError(res, "Authentication failed");
  }
};

/**
 * Check if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return sendAuthError(res, "Authentication required");
      }

      if (!roles.includes(req.user.role)) {
        return sendAuthorizationError(
          res,
          `Access denied. Required role: ${roles.join(" or ")}`
        );
      }

      next();
    } catch (error) {
      logger.error("Role authorization error:", error);
      return sendAuthorizationError(res, "Authorization failed");
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Log error but don't fail the request
    logger.warn("Optional auth error:", error.message);
    req.user = null;
    next();
  }
};

/**
 * Check if user owns the resource or is admin
 */
const requireOwnershipOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendAuthError(res, "Authentication required");
      }

      // Admin can access everything
      if (req.user.role === "admin") {
        return next();
      }

      // Get the user ID of the resource owner
      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return sendAuthorizationError(
          res,
          "Resource not found or access denied"
        );
      }

      // Check if user owns the resource
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return sendAuthorizationError(
          res,
          "You can only access your own resources"
        );
      }

      next();
    } catch (error) {
      logger.error("Ownership authorization error:", error);
      return sendAuthorizationError(res, "Authorization failed");
    }
  };
};

/**
 * Generate JWT tokens
 */
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || JWT_CONFIG.ACCESS_TOKEN_EXPIRE,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
  });

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn:
        process.env.JWT_REFRESH_EXPIRE || JWT_CONFIG.REFRESH_TOKEN_EXPIRE,
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
  requireOwnershipOrAdmin,
  generateTokens,
  verifyRefreshToken,
};
