import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import env from "./config/env";
import { setupSocket } from "./config/socket";

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import notificationRoutes from "./routes/notification.routes";
import bookmarkRoutes from "./routes/bookmark.routes";
import adminRoutes from "./routes/admin.routes";
import asteroidRoutes from "./routes/asteroid.routes";
import neoRoutes from "./routes/neo.routes";
import watchlistRoutes from "./routes/watchlist.routes";
import alertsRoutes from "./routes/alerts.routes";
import { scheduleSync, syncNEOFeedToDB } from "./services/syncService";

// Import middleware
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { generalLimiter } from "./middleware/rateLimit.middleware";

const app: Express = express();
const port = env.PORT;

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Setup Socket.IO
setupSocket(httpServer);

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General rate limiter
app.use(generalLimiter);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "ASTRA server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/asteroids", asteroidRoutes);
app.use("/api/neo", neoRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/alerts", alertsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
httpServer.listen(port, () => {
  console.log(`🚀 ASTRA server running on http://localhost:${port}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  scheduleSync();
  syncNEOFeedToDB(7).catch((err) => {
    console.error("Initial NEO sync failed", err);
  });
});

export default app;
