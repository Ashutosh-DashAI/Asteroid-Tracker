import { describe, it, expect } from 'vitest';
import { transformNASAObject } from '../nasa.service';

describe('NASA Service - transformNASAObject', () => {
  it('transforms raw NASA object correctly', () => {
    const rawObject = {
      id: '12345',
      neo_reference_id: '12345',
      name: 'Test Asteroid',
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 1.5,
          estimated_diameter_max: 2.5,
        },
      },
      is_potentially_hazardous_asteroid: true,
      absolute_magnitude_h: 22.5,
      close_approach_data: [
        {
          close_approach_date_full: '2025-01-15 12:00',
          relative_velocity: {
            kilometers_per_second: '25.5',
          },
          miss_distance: {
            kilometers: '500000',
          },
          orbiting_body: 'Earth',
        },
      ],
    };

    const result = transformNASAObject(rawObject);

    expect(result.asteroid.nasaId).toBe('12345');
    expect(result.asteroid.name).toBe('Test Asteroid');
    expect(result.asteroid.estimatedDiameterMinKm).toBe(1.5);
    expect(result.asteroid.estimatedDiameterMaxKm).toBe(2.5);
    expect(result.asteroid.isPotentiallyHazardous).toBe(true);
    expect(result.asteroid.absoluteMagnitude).toBe(22.5);
    expect(result.closeApproaches).toHaveLength(1);
    expect(result.closeApproaches[0].relativeVelocityKmS).toBe(25.5);
    expect(result.closeApproaches[0].missDistanceKm).toBe(500000);
    expect(result.closeApproaches[0].orbitingBody).toBe('Earth');
  });

  it('handles missing close approach data', () => {
    const rawObject = {
      id: '12345',
      name: 'Test Asteroid',
      estimated_diameter: { kilometers: {} },
      is_potentially_hazardous_asteroid: false,
    };

    const result = transformNASAObject(rawObject);

    expect(result.closeApproaches).toHaveLength(0);
    expect(result.asteroid.isPotentiallyHazardous).toBe(false);
  });

  it('uses default values for missing fields', () => {
    const rawObject = {
      id: '12345',
      name: 'Test Asteroid',
    };

    const result = transformNASAObject(rawObject);

    expect(result.asteroid.estimatedDiameterMinKm).toBe(0);
    expect(result.asteroid.estimatedDiameterMaxKm).toBe(0);
    expect(result.asteroid.isPotentiallyHazardous).toBe(false);
    expect(result.asteroid.absoluteMagnitude).toBe(0);
  });
});
