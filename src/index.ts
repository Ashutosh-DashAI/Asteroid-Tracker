import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import env from "./config/env";
import logger from "./utils/logger";

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import asteroidRoutes from "./routes/asteroid.routes";
import neoRoutes from "./routes/neo.routes";
import savedAsteroidsRoutes from "./routes/saved-asteroids.routes";
import savedSearchesRoutes from "./routes/saved-searches.routes";
import alertsRoutes from "./routes/alerts.routes";
import watchlistRoutes from "./routes/watchlist.routes";

// Import middleware
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { generalLimiter } from "./middleware/rateLimit.middleware";

const app: Express = express();
const port = env.PORT;

// Log startup information
logger.info("🚀 Starting NASA Asteroid Tracker backend");
logger.info(`Environment: ${env.NODE_ENV}`);
logger.info(`Port: ${port}`);

// Create HTTP server
const httpServer = createServer(app);

// CORS Configuration
const allowedOrigins = [
  env.CLIENT_URL,
  env.CORS_ORIGIN,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

logger.info(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      logger.warn(`CORS denied for origin: ${origin}`);
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

// Middleware - CORS MUST be before other middleware and routes
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General rate limiter
app.use(generalLimiter);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "NASA Asteroid Tracker running", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/neo", neoRoutes);
app.use("/api/asteroids", asteroidRoutes);
app.use("/api/saved-asteroids", savedAsteroidsRoutes);
app.use("/api/asteroids/favorites", savedAsteroidsRoutes); // Alias for saved-asteroids
app.use("/api/saved-searches", savedSearchesRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/watchlist", watchlistRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = () => {
  try {
    httpServer.listen(port, () => {
      logger.info(`✅ NASA Asteroid Tracker running on http://localhost:${port}`);
      logger.info(`📍 API Base URL: http://localhost:${port}/api`);
      logger.info(`🔍 Health Check: http://localhost:${port}/health`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
