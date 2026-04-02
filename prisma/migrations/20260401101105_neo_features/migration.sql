-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "asteroidId" TEXT;

-- CreateTable
CREATE TABLE "Asteroid" (
    "id" TEXT NOT NULL,
    "nasaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimatedDiameterMinKm" DOUBLE PRECISION NOT NULL,
    "estimatedDiameterMaxKm" DOUBLE PRECISION NOT NULL,
    "isPotentiallyHazardous" BOOLEAN NOT NULL,
    "absoluteMagnitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asteroid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloseApproach" (
    "id" TEXT NOT NULL,
    "asteroidId" TEXT NOT NULL,
    "closeApproachDate" TIMESTAMP(3) NOT NULL,
    "relativeVelocityKmS" DOUBLE PRECISION NOT NULL,
    "missDistanceKm" DOUBLE PRECISION NOT NULL,
    "orbitingBody" TEXT NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloseApproach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchedAsteroid" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asteroidId" TEXT NOT NULL,
    "alertThresholdKm" DOUBLE PRECISION NOT NULL DEFAULT 1000000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchedAsteroid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asteroidId" TEXT NOT NULL,
    "closeApproachId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asteroid_nasaId_key" ON "Asteroid"("nasaId");

-- CreateIndex
CREATE INDEX "Asteroid_nasaId_idx" ON "Asteroid"("nasaId");

-- CreateIndex
CREATE INDEX "Asteroid_isPotentiallyHazardous_idx" ON "Asteroid"("isPotentiallyHazardous");

-- CreateIndex
CREATE INDEX "CloseApproach_asteroidId_idx" ON "CloseApproach"("asteroidId");

-- CreateIndex
CREATE INDEX "CloseApproach_closeApproachDate_idx" ON "CloseApproach"("closeApproachDate");

-- CreateIndex
CREATE INDEX "CloseApproach_riskScore_idx" ON "CloseApproach"("riskScore");

-- CreateIndex
CREATE UNIQUE INDEX "CloseApproach_asteroidId_closeApproachDate_key" ON "CloseApproach"("asteroidId", "closeApproachDate");

-- CreateIndex
CREATE INDEX "WatchedAsteroid_userId_idx" ON "WatchedAsteroid"("userId");

-- CreateIndex
CREATE INDEX "WatchedAsteroid_asteroidId_idx" ON "WatchedAsteroid"("asteroidId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchedAsteroid_userId_asteroidId_key" ON "WatchedAsteroid"("userId", "asteroidId");

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

-- CreateIndex
CREATE INDEX "Alert_asteroidId_idx" ON "Alert"("asteroidId");

-- CreateIndex
CREATE INDEX "Alert_closeApproachId_idx" ON "Alert"("closeApproachId");

-- CreateIndex
CREATE INDEX "Alert_isRead_idx" ON "Alert"("isRead");

-- CreateIndex
CREATE INDEX "ChatMessage_asteroidId_idx" ON "ChatMessage"("asteroidId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_asteroidId_fkey" FOREIGN KEY ("asteroidId") REFERENCES "Asteroid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CloseApproach" ADD CONSTRAINT "CloseApproach_asteroidId_fkey" FOREIGN KEY ("asteroidId") REFERENCES "Asteroid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchedAsteroid" ADD CONSTRAINT "WatchedAsteroid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchedAsteroid" ADD CONSTRAINT "WatchedAsteroid_asteroidId_fkey" FOREIGN KEY ("asteroidId") REFERENCES "Asteroid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_asteroidId_fkey" FOREIGN KEY ("asteroidId") REFERENCES "Asteroid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_closeApproachId_fkey" FOREIGN KEY ("closeApproachId") REFERENCES "CloseApproach"("id") ON DELETE CASCADE ON UPDATE CASCADE;
