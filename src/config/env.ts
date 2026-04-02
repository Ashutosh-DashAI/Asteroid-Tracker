import "dotenv/config";

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-change-in-production",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "15m",
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "7d",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // App
  APP_NAME: "ASTRA",
  APP_URL: process.env.APP_URL || "http://localhost:3000",

  // Email (optional for forgot password)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || "noreply@astra.com",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),

  // NASA API
  NASA_API_KEY: process.env.NASA_API_KEY || "DEMO_KEY",
  NASA_NEOWS_API_URL: "https://api.nasa.gov/neo/rest/v1",
  NASA_API_CACHE_DURATION: parseInt(process.env.NASA_API_CACHE_DURATION || "3600000", 10), // 1 hour in ms
  SYNC_INTERVAL_HOURS: parseInt(process.env.SYNC_INTERVAL_HOURS || "6", 10),
};

export default env;
