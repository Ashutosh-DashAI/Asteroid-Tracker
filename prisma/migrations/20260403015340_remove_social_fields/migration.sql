-- AlterTable - Remove social fields from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "username",
DROP COLUMN IF EXISTS "avatar",
DROP COLUMN IF EXISTS "bio";

-- AlterTable - Update Asteroid columns
ALTER TABLE "Asteroid" 
DROP COLUMN IF EXISTS "estimatedDiameterMaxKm",
DROP COLUMN IF EXISTS "estimatedDiameterMinKm", 
DROP COLUMN IF EXISTS "isPotentiallyHazardous";

ALTER TABLE "Asteroid"
ADD COLUMN "estimatedDiameterMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "estimatedDiameterMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "hazardous" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable - Remove riskScore from CloseApproach
ALTER TABLE "CloseApproach" DROP COLUMN IF EXISTS "riskScore";

-- Rename columns if they exist with old names
ALTER TABLE "Asteroid" 
RENAME COLUMN "estimatedDiameterMin" TO "estimatedDiameterMin";

ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
