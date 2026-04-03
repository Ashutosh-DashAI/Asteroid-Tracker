import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import logger from "./utils/logger";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✅ Database connection successful");
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Call on module load
testConnection().catch((err) => {
  logger.error("Failed to connect to database on startup:", err);
  process.exit(1);
});

export default prisma;