import cron from "node-cron";
import prisma from "../db";
import { nasaService } from "./nasa.service";
import { computeRiskScore } from "./riskEngine";
import { emitNewAlert } from "../config/socket";
import env from "../config/env";

const toDateOnly = (date: Date) => date.toISOString().split("T")[0]!;

export const syncNEOFeedToDB = async (days = 7) => {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + days);

  const items = await nasaService.fetchNearEarthObjectsFeed(toDateOnly(start), toDateOnly(end));

  for (const item of items) {
    await prisma.$transaction(async (tx) => {
      const asteroid = await tx.asteroid.upsert({
        where: { nasaId: item.asteroid.nasaId },
        update: {
          name: item.asteroid.name,
          estimatedDiameterMinKm: item.asteroid.estimatedDiameterMinKm,
          estimatedDiameterMaxKm: item.asteroid.estimatedDiameterMaxKm,
          isPotentiallyHazardous: item.asteroid.isPotentiallyHazardous,
          absoluteMagnitude: item.asteroid.absoluteMagnitude,
        },
        create: item.asteroid,
      });

      for (const ca of item.closeApproaches) {
        const risk = computeRiskScore(ca, asteroid);
        const closeApproach = await tx.closeApproach.upsert({
          where: {
            asteroidId_closeApproachDate: {
              asteroidId: asteroid.id,
              closeApproachDate: ca.closeApproachDate,
            },
          } as any,
          update: {
            relativeVelocityKmS: ca.relativeVelocityKmS,
            missDistanceKm: ca.missDistanceKm,
            orbitingBody: ca.orbitingBody,
            riskScore: risk.score,
          },
          create: {
            asteroidId: asteroid.id,
            closeApproachDate: ca.closeApproachDate,
            relativeVelocityKmS: ca.relativeVelocityKmS,
            missDistanceKm: ca.missDistanceKm,
            orbitingBody: ca.orbitingBody,
            riskScore: risk.score,
          },
        });

        const watched = await tx.watchedAsteroid.findMany({
          where: {
            asteroidId: asteroid.id,
            alertThresholdKm: { gt: ca.missDistanceKm },
          },
        });

        for (const watch of watched) {
          const existing = await tx.alert.findFirst({
            where: {
              userId: watch.userId,
              asteroidId: asteroid.id,
              closeApproachId: closeApproach.id,
            },
          });

          if (!existing) {
            const alert = await tx.alert.create({
              data: {
                userId: watch.userId,
                asteroidId: asteroid.id,
                closeApproachId: closeApproach.id,
                message: `${asteroid.name} is approaching within ${Math.round(
                  ca.missDistanceKm
                ).toLocaleString()} km`,
              },
            });
            emitNewAlert(watch.userId, alert);
          }
        }
      }
    });
  }
};

export const scheduleSync = () => {
  const intervalHours = Number(process.env.SYNC_INTERVAL_HOURS ?? env.SYNC_INTERVAL_HOURS ?? 6);
  const cronExp = `0 */${Math.max(1, Math.min(intervalHours, 12))} * * *`;
  cron.schedule(cronExp, async () => {
    try {
      await syncNEOFeedToDB(7);
    } catch (error) {
      console.error("Scheduled NEO sync failed", error);
    }
  });
};
