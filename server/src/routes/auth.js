const express = require("express");
const authController = require("../controllers/authController");
const {
  authenticateToken,
  requireRole,
  optionalAuth,
} = require("../middleware/auth");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../middleware/validation");
const {
  loginSchema,
  createUserSchema,
  changePasswordSchema,
  refreshTokenSchema,
} = require("../validations/authValidation");

const router = express.Router();

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// Public routes
router.post("/login", validateBody(loginSchema), authController.login);

router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  "/register",
  validateBody(createUserSchema),
  authController.register
);

router.get("/status", optionalAuth, authController.getAuthStatus);

// Setup route for initial admin creation (only works if no admin exists)
router.post("/setup", authController.setupDefaultAdmin);

// Protected routes - require authentication
router.use(authenticateToken);

router.post("/logout", authController.logout);

router.get("/verify", authController.verifyToken);

router.get("/profile", authController.getProfile);

router.put(
  "/change-password",
  validateBody(changePasswordSchema),
  authController.changePassword
);

// Admin only routes
router.use(requireRole("admin"));

router.post(
  "/users",
  validateBody(createUserSchema),
  authController.createUser
);

router.get(
  "/users",
  validateQuery(
    require("joi").object({
      page: require("joi").number().integer().min(1).default(1),
      limit: require("joi").number().integer().min(1).max(50).default(10),
      role: require("joi").string().valid("admin", "editor"),
      isActive: require("joi").boolean(),
      search: require("joi").string().max(100),
    })
  ),
  authController.getAllUsers
);

router.put(
  "/users/:id/deactivate",
  validateParams(
    require("joi").object({
      id: require("joi")
        .string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
    })
  ),
  authController.deactivateUser
);

router.get("/stats", authController.getUserStats);

module.exports = router;
