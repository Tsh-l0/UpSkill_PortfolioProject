require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");
const morgan = require("morgan");

// Database & Redis Configuration
const { connectDB } = require("./config/database");
const { connectRedis } = require("./config/redis");

// Security Middleware
const { securityMiddleware } = require("./middlewares/security");

// Route Imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const skillRoutes = require("./routes/skill.routes");
const endorsementRoutes = require("./routes/endorsement.routes");
const experienceRoutes = require("./routes/experience.routes");
const projectRoutes = require("./routes/project.routes");
const connectionRoutes = require("./routes/connection.routes");
const blogRoutes = require("./routes/blog.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const notificationRoutes = require("./routes/notification.routes");

// Error Middleware
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Security & Performance Middleware
app.use(securityMiddleware);

// Compression for better performance
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:4173",
        "https://upskill-nu-ten.vercel.app",
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Session-ID",
      "X-Client-Version",
      "X-Request-ID",   
      "X-Client-Platform", 
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
      "Cache-Control",
      "Pragma"
    ],
    exposedHeaders: [
      "X-Total-Count",
      "X-Total-Pages", 
      "X-Current-Page",
      "X-Rate-Limit-Remaining",
      "X-Rate-Limit-Reset"
    ],
    optionsSuccessStatus: 200,
    maxAge: 86400,
  })
);

// Body parsing with increased limits for file uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (for local file storage)
app.use("/uploads", express.static("uploads"));

// Connect to databases
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional, won't crash if fails)
    await connectRedis().catch((err) => {
      console.warn(
        "Redis connection failed, continuing without cache:",
        err.message
      );
    });

    console.log("All services initialized successfully");
  } catch (error) {
    console.error("Service initialization failed:", error);
    process.exit(1);
  }
};

// Initialize services
initializeServices();

// ===== API ROUTES =====
// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "UpSkill API v1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      skills: "/api/skills",
      endorsements: "/api/endorsements",
      experience: "/api/experience",
      projects: "/api/projects",
      connections: "/api/connections",
      blog: "/api/blog",
      analytics: "/api/analytics",
      notifications: "/api/notifications",
    },
  });
});

app.get("/health", async (req, res) => {
  const { checkDBHealth } = require("./config/database");
  const dbHealth = await checkDBHealth();

  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbHealth,
    redis: require("./config/redis").redisClient?.isReady
      ? "connected"
      : "disconnected",
    version: "1.0.0",
  });
});

// API route mounting
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/endorsements", endorsementRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "UpSkill API Documentation",
    version: "1.0.0",
    documentation: process.env.API_DOCS_URL || "https://upskill-api-yl2i.onrender.com/api",
    endpoints: {
      authentication: {
        base: "/api/auth",
        routes: {
          "POST /signup": "User registration",
          "POST /login": "User login",
          "POST /logout": "User logout",
          "POST /refresh": "Refresh access token",
          "POST /forgot-password": "Request password reset",
          "POST /reset-password": "Reset password with token",
          "GET /me": "Get current user",
          "PUT /change-password": "Change password",
        },
      },
      users: {
        base: "/api/users",
        routes: {
          "GET /profile": "Get current user profile",
          "PUT /profile": "Update user profile",
          "GET /analytics": "Get user analytics",
          "GET /:id": "Get user by ID",
          "GET /search": "Search users",
          "GET /trending": "Get trending users",
          "POST /upload-avatar": "Upload profile image",
          "GET /settings": "Get user settings",
          "PUT /settings": "Update user settings",
          "GET /:userId/skills": "Get user skills",
          "POST /skills": "Add skill to user",
          "PUT /skills/:id": "Update user skill",
          "DELETE /skills/:id": "Remove user skill",
        },
      },
      skills: {
        base: "/api/skills",
        routes: {
          "GET /": "Get all skills",
          "GET /trending": "Get trending skills",
          "GET /categories": "Get skill categories",
          "GET /search": "Search skills",
          "POST /": "Create skill (admin)",
          "PUT /:id": "Update skill (admin)",
        },
      },
      endorsements: {
        base: "/api/endorsements",
        routes: {
          "POST /": "Create endorsement",
          "GET /received": "Get received endorsements",
          "GET /given": "Get given endorsements",
          "GET /stats": "Get endorsement statistics",
          "PUT /:id": "Update endorsement",
          "DELETE /:id": "Delete endorsement",
        },
      },
      experience: {
        base: "/api/experience",
        routes: {
          "GET /": "Get user experiences",
          "POST /": "Create experience",
          "PUT /:id": "Update experience",
          "DELETE /:id": "Delete experience",
        },
      },
      projects: {
        base: "/api/projects",
        routes: {
          "GET /": "Get user projects",
          "GET /:id": "Get project by ID",
          "POST /": "Create project",
          "PUT /:id": "Update project",
          "DELETE /:id": "Delete project",
          "POST /:id/like": "Like/unlike project",
        },
      },
      connections: {
        base: "/api/connections",
        routes: {
          "POST /request": "Send connection request",
          "PUT /:id/respond": "Accept/decline connection",
          "GET /": "Get user connections",
          "GET /requests": "Get pending requests",
          "GET /mutual/:userId": "Get mutual connections",
          "DELETE /:id": "Remove connection",
        },
      },
      blog: {
        base: "/api/blog",
        routes: {
          "GET /posts": "Get blog posts",
          "GET /posts/:id": "Get blog post by ID",
          "GET /categories": "Get blog categories",
          "POST /posts/:id/bookmark": "Bookmark post",
          "GET /bookmarks": "Get user bookmarks",
        },
      },
      analytics: {
        base: "/api/analytics",
        routes: {
          "POST /track": "Track user event",
          "GET /dashboard": "Get dashboard analytics",
          "GET /skills": "Get skills analytics",
          "GET /trending": "Get trending analytics",
        },
      },
      notifications: {
        base: "/api/notifications",
        routes: {
          "GET /": "Get user notifications",
          "PUT /:id/read": "Mark notification as read",
          "PUT /read-all": "Mark all as read",
          "DELETE /:id": "Archive notification",
          "GET /counts": "Get notification counts",
        },
      },
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 - Must be last route
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    availableEndpoints: "/api",
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/health-render", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: "UpSkill Backend"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: error.message
    });
  }
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Unhandled Promise Rejection
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Promise Rejection:", err.message);
  console.log("Shutting down the server due to unhandled promise rejection");

  process.exit(1);
});

// Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err.message);
  console.log("Shutting down the server due to uncaught exception");

  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
  console.log(`API Documentation: http://localhost:${PORT}/api`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
