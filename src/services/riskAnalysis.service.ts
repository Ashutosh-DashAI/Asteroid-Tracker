export interface RiskAnalysis {
  neoId: string;
  asteroidName: string;
  riskScore: number; // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: {
    diameterScore: number;
    velocityScore: number;
    missDistanceScore: number;
    hazardousScore: number;
  };
  recommendation: string;
  details: {
    diameter: { min: number; max: number; unit: string };
    velocity: { value: number; unit: string };
    missDistance: { value: number; unit: string };
    closeApproachDate?: string;
    isPotentiallyHazardous: boolean;
  };
}

export const riskAnalysisService = {
  calculateRiskScore(asteroid: {
    estimated_diameter?: { kilometers?: { estimated_diameter_min?: number; estimated_diameter_max?: number } };
    close_approach_data: Array<any>;
    is_potentially_hazardous_asteroid: boolean;
  }): RiskAnalysis | null {
    if (!asteroid.close_approach_data || asteroid.close_approach_data.length === 0) {
      return null;
    }

    const latestApproach = asteroid.close_approach_data[0];

    // Extract asteroid properties
    const diameterMin = asteroid.estimated_diameter?.kilometers?.estimated_diameter_min || 0;
    const diameterMax = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
    const diameterAvg = (diameterMin + diameterMax) / 2;
    const velocity = parseFloat(latestApproach.relative_velocity?.kilometers_per_hour || "0");
    const missDistance = parseFloat(latestApproach.miss_distance?.kilometers || "0");
    const isHazardous = asteroid.is_potentially_hazardous_asteroid;

    // Calculate individual factor scores (0-25 each)

    // Diameter Score (0-25): Larger asteroids = higher score
    // Scale: 0-1km=0, 1km=5, 5km=15, 10km=25
    let diameterScore = 0;
    if (diameterAvg > 0) {
      diameterScore = Math.min(25, (diameterAvg / 10) * 25);
    }

    // Velocity Score (0-25): Higher velocity = higher score
    // Scale: 0-10 km/h=0, 50 km/h=15, 100 km/h=25
    let velocityScore = 0;
    if (velocity > 0) {
      velocityScore = Math.min(25, (velocity / 100) * 25);
    }

    // Miss Distance Score (0-25): Shorter distance = higher score
    // Scale: >10M km=0, 10M km=5, 1M km=15, <100k km=25, <50k km (lunar distance)=25
    let missDistanceScore = 25; // Start high (close is dangerous)
    const lunarDistance = 384400; // km
    if (missDistance > lunarDistance * 10) {
      missDistanceScore = 0;
    } else if (missDistance > lunarDistance) {
      missDistanceScore = 5;
    } else if (missDistance > 1000000) {
      missDistanceScore = 10;
    } else if (missDistance > 100000) {
      missDistanceScore = 15;
    } else if (missDistance > 50000) {
      missDistanceScore = 20;
    }

    // Hazardous Status Score (0-25): Flagged as hazardous = 25, otherwise 0
    let hazardousScore = isHazardous ? 25 : 0;

    // Total risk score (weighted sum)
    const weights = {
      diameter: 0.25,
      velocity: 0.25,
      missDistance: 0.35,
      hazardous: 0.15,
    };

    const riskScore =
      diameterScore * weights.diameter +
      velocityScore * weights.velocity +
      missDistanceScore * weights.missDistance +
      hazardousScore * weights.hazardous;

    // Determine risk level
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    let recommendation = "";

    if (riskScore >= 75) {
      riskLevel = "CRITICAL";
      recommendation = "⚠️ CRITICAL: This asteroid requires immediate attention. Monitor closely for updates.";
    } else if (riskScore >= 50) {
      riskLevel = "HIGH";
      recommendation = "🔴 HIGH: This asteroid poses a significant risk. Continuous monitoring recommended.";
    } else if (riskScore >= 25) {
      riskLevel = "MEDIUM";
      recommendation = "🟡 MEDIUM: Observable risk level. Regular monitoring suggested.";
    } else {
      riskLevel = "LOW";
      recommendation = "🟢 LOW: Minimal risk detected. Standard monitoring applies.";
    }

    return {
      neoId: "",
      asteroidName: "",
      riskScore: Math.round(riskScore * 100) / 100,
      riskLevel,
      factors: {
        diameterScore: Math.round(diameterScore * 100) / 100,
        velocityScore: Math.round(velocityScore * 100) / 100,
        missDistanceScore: Math.round(missDistanceScore * 100) / 100,
        hazardousScore: Math.round(hazardousScore * 100) / 100,
      },
      recommendation,
      details: {
        diameter: {
          min: Math.round(diameterMin * 1000) / 1000,
          max: Math.round(diameterMax * 1000) / 1000,
          unit: "km",
        },
        velocity: {
          value: Math.round(velocity * 100) / 100,
          unit: "km/h",
        },
        missDistance: {
          value: Math.round(missDistance),
          unit: "km",
        },
        closeApproachDate: latestApproach.close_approach_date,
        isPotentiallyHazardous: isHazardous,
      },
    };
  },

  categorizeAsteroids(asteroids: any[]): {
    critical: any[];
    high: any[];
    medium: any[];
    low: any[];
  } {
    const categories = { critical: [] as any[], high: [] as any[], medium: [] as any[], low: [] as any[] };

    asteroids.forEach((asteroid) => {
      const analysis = this.calculateRiskScore(asteroid);
      if (analysis) {
        if (analysis.riskLevel === "CRITICAL") {
          categories.critical.push({ asteroid, analysis });
        } else if (analysis.riskLevel === "HIGH") {
          categories.high.push({ asteroid, analysis });
        } else if (analysis.riskLevel === "MEDIUM") {
          categories.medium.push({ asteroid, analysis });
        } else {
          categories.low.push({ asteroid, analysis });
        }
      }
    });

    return categories;
  },
};
