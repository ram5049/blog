const authService = require("../services/authService");
const { sendSuccess, sendError } = require("../utils/responses");
const { asyncHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS } = require("../utils/constants");
const logger = require("../config/logger");

/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 */
class AuthController {
  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    logger.info(`Login attempt for username: ${username}`);

    const result = await authService.login(username, password);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login successful",
      HTTP_STATUS.OK
    );
  });

  /**
   * Register new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const { username, email, password, name } = req.body;

    logger.info(
      `Registration attempt for username: ${username}, email: ${email}`
    );

    const result = await authService.register({
      username,
      email,
      password,
      name,
    });

    return sendSuccess(
      res,
      {
        user: result.user,
        message: "User registered successfully",
      },
      "Registration successful",
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    const username = req.user?.username || "unknown";

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    logger.info(`User logged out: ${username}`);

    return sendSuccess(res, null, "Logout successful", HTTP_STATUS.OK);
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return sendError(
        res,
        "Refresh token is required",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const result = await authService.refreshToken(refreshToken);

    return sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Token refreshed successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Verify token and get user data
   * GET /api/auth/verify
   */
  verifyToken = asyncHandler(async (req, res) => {
    const user = await authService.verifyUser(req.user.id);

    return sendSuccess(res, { user }, "Token is valid", HTTP_STATUS.OK);
  });

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);

    return sendSuccess(
      res,
      { user },
      "Profile retrieved successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return sendSuccess(res, null, result.message, HTTP_STATUS.OK);
  });

  /**
   * Create new user (admin only)
   * POST /api/auth/users
   */
  createUser = asyncHandler(async (req, res) => {
    const userData = req.body;

    const user = await authService.createUser(userData);

    logger.info(`New user created by admin: ${user.username}`);

    return sendSuccess(
      res,
      { user },
      "User created successfully",
      HTTP_STATUS.CREATED
    );
  });

  /**
   * Get all users (admin only)
   * GET /api/auth/users
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      role: req.query.role,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
      search: req.query.search,
    };

    const result = await authService.getAllUsers(options);

    return sendSuccess(
      res,
      result,
      "Users retrieved successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Deactivate user (admin only)
   * PUT /api/auth/users/:id/deactivate
   */
  deactivateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (id === req.user.id) {
      return sendError(
        res,
        "Cannot deactivate your own account",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const result = await authService.deactivateUser(id);

    logger.info(`User deactivated by admin: ${id}`);

    return sendSuccess(res, null, result.message, HTTP_STATUS.OK);
  });

  /**
   * Create default admin user
   * POST /api/auth/setup
   */
  setupDefaultAdmin = asyncHandler(async (req, res) => {
    const result = await authService.createDefaultAdmin();

    return sendSuccess(
      res,
      result,
      "Setup completed successfully",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get authentication status
   * GET /api/auth/status
   */
  getAuthStatus = asyncHandler(async (req, res) => {
    const isAuthenticated = !!req.user;

    const data = {
      isAuthenticated,
      user: isAuthenticated
        ? {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
          }
        : null,
    };

    return sendSuccess(
      res,
      data,
      "Authentication status retrieved",
      HTTP_STATUS.OK
    );
  });

  /**
   * Get user statistics (admin only)
   * GET /api/auth/stats
   */
  getUserStats = asyncHandler(async (req, res) => {
    const stats = await authService.getAllUsers({ limit: 1000 }); // Get all for stats

    const userStats = {
      totalUsers: stats.pagination.totalUsers,
      activeUsers: stats.users.filter((user) => user.isActive).length,
      inactiveUsers: stats.users.filter((user) => !user.isActive).length,
      adminUsers: stats.users.filter((user) => user.role === "admin").length,
      editorUsers: stats.users.filter((user) => user.role === "editor").length,
      recentUsers: stats.users.slice(0, 5), // Last 5 users
    };

    return sendSuccess(
      res,
      userStats,
      "User statistics retrieved",
      HTTP_STATUS.OK
    );
  });
}

module.exports = new AuthController();
