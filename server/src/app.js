const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const fs = require("fs");

const logger = require("./config/logger");
const { connectDB } = require("./config/database");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// Create Express app
const app = express();

// Trust proxy (important for rate limiting and getting real IPs in production)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:3001"];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({
          success: false,
          message: "Invalid JSON",
        });
        throw new Error("Invalid JSON");
      }
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Security middleware for data sanitization
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Clean user input from malicious HTML
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// API routes
app.use("/api", routes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Try multiple possible paths for the React build
  const possiblePaths = [
    path.join(__dirname, "../build"), // server/build (copied during build)
    path.join(__dirname, "../../client/build"), // client/build (development)
    path.join(__dirname, "../frontend"), // server/frontend (alternative)
  ];

  let clientBuildPath = null;
  for (const possiblePath of possiblePaths) {
    try {
      if (require("fs").existsSync(possiblePath)) {
        clientBuildPath = possiblePath;
        break;
      }
    } catch (err) {
      // Continue to next path
    }
  }

  if (clientBuildPath) {
    console.log(`Serving static files from: ${clientBuildPath}`);
    app.use(express.static(clientBuildPath));

    // Catch all handler for SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  } else {
    console.log("Static build files not found. Running in API-only mode.");
    // API-only mode - return a simple message for root route
    app.get("*", (req, res) => {
      res.json({
        message: "Blog API Server",
        version: "1.0.0",
        endpoints: {
          api: "/api",
          health: "/api/health",
          posts: "/api/posts",
          auth: "/api/auth",
        },
      });
    });
  }
}

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  const server = app.get("server");
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed.");

      // Close database connection
      const mongoose = require("mongoose");
      mongoose.connection.close(() => {
        logger.info("Database connection closed.");
        process.exit(0);
      });
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 30000);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", err);
  process.exit(1);
});

module.exports = app;
