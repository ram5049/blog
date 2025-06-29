require("dotenv").config();

const app = require("./src/app");
const logger = require("./src/config/logger");
const { connectDB } = require("./src/config/database");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET", "MONGODB_URI"];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("Database connected successfully");

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`
🚀 Server is running in ${NODE_ENV} mode
📍 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
📚 API Docs: http://localhost:${PORT}/api
🔍 Health Check: http://localhost:${PORT}/api/health
      `);
    });

    // Store server instance for graceful shutdown
    app.set("server", server);

    // Handle server errors
    server.on("error", (error) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      const bind = typeof PORT === "string" ? "Pipe " + PORT : "Port " + PORT;

      switch (error.code) {
        case "EACCES":
          logger.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Log startup information
    logger.info("Server startup completed successfully");

    if (NODE_ENV === "development") {
      logger.info("Development mode - Additional logging enabled");
      logger.info(
        `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
      );
    }
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = app;
