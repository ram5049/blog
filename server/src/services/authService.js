const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { generateTokens, verifyRefreshToken } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");
const { HTTP_STATUS, ERROR_CODES, DEFAULTS } = require("../utils/constants");
const logger = require("../config/logger");

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
class AuthService {
  /**
   * Authenticate user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Object} - Authentication result with tokens and user data
   */
  async login(username, password) {
    try {
      // Find user by username and include password for comparison
      const user = await User.findOne({ username }).select("+password");

      if (!user) {
        throw new AppError(
          "Invalid username or password",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }

      // Check if user account is active
      if (!user.isActive) {
        throw new AppError(
          "Account is deactivated. Please contact administrator.",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHORIZATION_ERROR
        );
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError(
          "Invalid username or password",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }

      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Remove password from user object
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      logger.info(`User logged in successfully: ${username}`);

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Login failed for username: ${username}`, error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Object} - Created user data
   */
  async register(userData) {
    try {
      const { username, email, password, name } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new AppError(
            "Username already exists",
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR
          );
        }
        if (existingUser.email === email) {
          throw new AppError(
            "Email already exists",
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR
          );
        }
      }

      // Create new user
      const user = new User({
        username,
        email,
        password, // Will be hashed by pre-save middleware
        name,
        role: "editor", // Default role
        isActive: true,
      });

      await user.save();

      // Remove password from response
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      logger.info(`User registered successfully: ${username}`);

      return {
        user: userWithoutPassword,
      };
    } catch (error) {
      logger.error(
        `Registration failed for username: ${userData.username}`,
        error
      );
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Object} - New access token and user data
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError(
          "Invalid refresh token",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }

      // Generate new access token
      const { accessToken } = generateTokens(user);

      logger.info(`Token refreshed for user: ${user.username}`);

      return {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error("Token refresh failed:", error);
      throw new AppError(
        "Invalid refresh token",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }
  }

  /**
   * Verify user token and return user data
   * @param {string} userId - User ID from token
   * @returns {Object} - User data
   */
  async verifyUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.isActive) {
        throw new AppError(
          "User not found or inactive",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      };
    } catch (error) {
      logger.error(`User verification failed for ID: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Create new user (admin only)
   * @param {Object} userData - User data
   * @returns {Object} - Created user data
   */
  async createUser(userData) {
    try {
      const { username, email, password, role = "admin" } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        const field = existingUser.username === username ? "username" : "email";
        throw new AppError(
          `User with this ${field} already exists`,
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.CONFLICT_ERROR
        );
      }

      // Create new user
      const user = new User({
        username,
        email,
        password, // Will be hashed by pre-save middleware
        role,
      });

      await user.save();

      // Remove password from response
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      logger.info(`New user created: ${username} (${role})`);

      return userWithoutPassword;
    } catch (error) {
      logger.error("User creation failed:", error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select("+password");

      if (!user) {
        throw new AppError(
          "User not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw new AppError(
          "Current password is incorrect",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }

      // Update password
      user.password = newPassword; // Will be hashed by pre-save middleware
      await user.save();

      logger.info(`Password changed for user: ${user.username}`);

      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error(`Password change failed for user ID: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Object} - User profile data
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError(
          "User not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error(`Get user profile failed for ID: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Create default admin user if none exists
   * @returns {Object} - Default admin user or existing admin
   */
  async createDefaultAdmin() {
    try {
      const existingAdmin = await User.findOne({ role: "admin" });

      if (existingAdmin) {
        logger.info("Admin user already exists");
        return { message: "Admin user already exists" };
      }

      const defaultAdmin = await User.createDefaultAdmin();

      logger.info("Default admin user created successfully");

      return {
        message: "Default admin user created",
        username: defaultAdmin.username,
        email: defaultAdmin.email,
      };
    } catch (error) {
      logger.error("Failed to create default admin:", error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID to deactivate
   * @returns {Object} - Success message
   */
  async deactivateUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError(
          "User not found",
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND_ERROR
        );
      }

      user.isActive = false;
      await user.save();

      logger.info(`User deactivated: ${user.username}`);

      return { message: "User account deactivated successfully" };
    } catch (error) {
      logger.error(`User deactivation failed for ID: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @param {Object} options - Query options
   * @returns {Object} - List of users with pagination
   */
  async getAllUsers(options = {}) {
    try {
      const { page = 1, limit = 10, role, isActive, search } = options;

      const query = {};

      if (role) query.role = role;
      if (typeof isActive === "boolean") query.isActive = isActive;
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query),
      ]);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Get all users failed:", error);
      throw error;
    }
  }
}

module.exports = new AuthService();
