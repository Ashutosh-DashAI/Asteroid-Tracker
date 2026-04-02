type CloseApproachInput = {
  missDistanceKm: number;
  relativeVelocityKmS: number;
};

type AsteroidInput = {
  estimatedDiameterMaxKm: number;
  isPotentiallyHazardous: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const computeRiskScore = (
  closeApproach: CloseApproachInput,
  asteroid: AsteroidInput
): { score: number; label: "SAFE" | "WATCH" | "WARNING" | "CRITICAL" } => {
  const distance = closeApproach.missDistanceKm;
  const velocity = closeApproach.relativeVelocityKmS;
  const diameter = asteroid.estimatedDiameterMaxKm;

  const distanceNormalized =
    distance <= 1_000_000
      ? 1
      : distance >= 10_000_000
        ? 0
        : 1 - (distance - 1_000_000) / 9_000_000;
  const velocityNormalized = clamp(velocity / 30, 0, 1);
  const diameterNormalized = clamp(diameter / 1, 0, 1);
  const hazardousPoints = asteroid.isPotentiallyHazardous ? 15 : 0;

  const score = clamp(
    distanceNormalized * 40 + velocityNormalized * 20 + diameterNormalized * 25 + hazardousPoints,
    0,
    100
  );

  const rounded = Number(score.toFixed(2));
  let label: "SAFE" | "WATCH" | "WARNING" | "CRITICAL" = "SAFE";
  if (rounded >= 76) label = "CRITICAL";
  else if (rounded >= 51) label = "WARNING";
  else if (rounded >= 26) label = "WATCH";

  return { score: rounded, label };
};
