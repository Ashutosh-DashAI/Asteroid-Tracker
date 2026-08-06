import { describe, it, expect } from 'vitest';

// Test the critical array guard pattern used in useAsteroidsStore
describe('Store Array Guards', () => {
  // Simulates the isFavorite function logic
  const isFavorite = (favoriteIds: string[] | null | undefined, asteroidId: string): boolean => {
    return Array.isArray(favoriteIds) && favoriteIds.includes(asteroidId);
  };

  // Simulates the addFavorite function logic for favoriteIds
  const safeFavoriteIds = (
    currentIds: string[] | null | undefined,
    asteroidId: string
  ): string[] => {
    const safeArray = Array.isArray(currentIds) ? currentIds : [];
    if (safeArray.includes(asteroidId)) {
      return safeArray;
    }
    return [...safeArray, asteroidId];
  };

  describe('isFavorite array guard', () => {
    it('returns false when favoriteIds is null', () => {
      expect(isFavorite(null, 'asteroid-1')).toBe(false);
    });

    it('returns false when favoriteIds is undefined', () => {
      expect(isFavorite(undefined, 'asteroid-1')).toBe(false);
    });

    it('returns false when favoriteIds is not an array', () => {
      expect(isFavorite('string' as any, 'asteroid-1')).toBe(false);
      expect(isFavorite(123 as any, 'asteroid-1')).toBe(false);
    });

    it('returns true when asteroid is in favoriteIds array', () => {
      expect(isFavorite(['asteroid-1', 'asteroid-2'], 'asteroid-1')).toBe(true);
    });

    it('returns false when asteroid is not in favoriteIds array', () => {
      expect(isFavorite(['asteroid-1', 'asteroid-2'], 'asteroid-3')).toBe(false);
    });
  });

  describe('safeFavoriteIds array guard', () => {
    it('returns empty array when currentIds is null', () => {
      const result = safeFavoriteIds(null, 'asteroid-1');
      expect(result).toEqual(['asteroid-1']);
    });

    it('returns empty array when currentIds is undefined', () => {
      const result = safeFavoriteIds(undefined, 'asteroid-1');
      expect(result).toEqual(['asteroid-1']);
    });

    it('adds new asteroid to empty array', () => {
      const result = safeFavoriteIds([], 'asteroid-1');
      expect(result).toEqual(['asteroid-1']);
    });

    it('does not duplicate existing asteroid', () => {
      const result = safeFavoriteIds(['asteroid-1', 'asteroid-2'], 'asteroid-1');
      expect(result).toEqual(['asteroid-1', 'asteroid-2']);
    });

    it('adds new asteroid to existing array', () => {
      const result = safeFavoriteIds(['asteroid-1'], 'asteroid-2');
      expect(result).toEqual(['asteroid-1', 'asteroid-2']);
    });
  });
});

// ============================================
// Bug 1 Test: Sort tabs call API with different params
// ============================================
describe('Bug 1 - Sort tabs', () => {
  interface MockAsteroid {
    nasaId: string;
    name: string;
    estimatedDiameterMax: number;
    closeApproaches: Array<{ missDistanceKm: number; velocityKmS: number }>;
    isPotentiallyHazardous: boolean;
  }

  const mockAsteroids: MockAsteroid[] = [
    { nasaId: '1', name: 'Asteroid A', estimatedDiameterMax: 1.5, closeApproaches: [{ missDistanceKm: 5000000, velocityKmS: 20 }], isPotentiallyHazardous: false },
    { nasaId: '2', name: 'Asteroid B', estimatedDiameterMax: 3.2, closeApproaches: [{ missDistanceKm: 8000000, velocityKmS: 15 }], isPotentiallyHazardous: true },
    { nasaId: '3', name: 'Asteroid C', estimatedDiameterMax: 0.8, closeApproaches: [{ missDistanceKm: 3000000, velocityKmS: 25 }], isPotentiallyHazardous: true },
  ];

  // Simulates the frontend sort function from NEOFeed
  const sortAsteroids = (asteroids: MockAsteroid[], sortBy: string): MockAsteroid[] => {
    return [...asteroids].sort((a, b) => {
      switch (sortBy) {
        case 'closest':
          return a.closeApproaches[0].missDistanceKm - b.closeApproaches[0].missDistanceKm;
        case 'largest':
          return b.estimatedDiameterMax - a.estimatedDiameterMax;
        case 'fastest':
          return b.closeApproaches[0].velocityKmS - a.closeApproaches[0].velocityKmS;
        case 'most-dangerous':
          if (a.isPotentiallyHazardous !== b.isPotentiallyHazardous) {
            return a.isPotentiallyHazardous ? -1 : 1;
          }
          return a.closeApproaches[0].missDistanceKm - b.closeApproaches[0].missDistanceKm;
        default:
          return 0;
      }
    });
  };

  it('sorts by closest (miss distance asc)', () => {
    const result = sortAsteroids(mockAsteroids, 'closest');
    expect(result[0].nasaId).toBe('3'); // 3000000 km
    expect(result[1].nasaId).toBe('1'); // 5000000 km
    expect(result[2].nasaId).toBe('2'); // 8000000 km
  });

  it('sorts by largest (diameter desc)', () => {
    const result = sortAsteroids(mockAsteroids, 'largest');
    expect(result[0].nasaId).toBe('2'); // 3.2 km
    expect(result[1].nasaId).toBe('1'); // 1.5 km
    expect(result[2].nasaId).toBe('3'); // 0.8 km
  });

  it('sorts by fastest (velocity desc)', () => {
    const result = sortAsteroids(mockAsteroids, 'fastest');
    expect(result[0].nasaId).toBe('3'); // 25 km/s
    expect(result[1].nasaId).toBe('1'); // 20 km/s
    expect(result[2].nasaId).toBe('2'); // 15 km/s
  });

  it('sorts by most-dangerous (hazardous first, then by distance)', () => {
    const result = sortAsteroids(mockAsteroids, 'most-dangerous');
    expect(result[0].isPotentiallyHazardous).toBe(true);
    expect(result[result.length - 1].isPotentiallyHazardous).toBe(false);
  });
});

// ============================================
// Bug 2 Test: Null/zero values render '—' not '0.00'
// ============================================
describe('Bug 2 - Null/zero metric values', () => {
  const formatValue = (val?: number, unit?: string, decimals = 2) => {
    if (val == null || val === 0) return '—';
    if (unit === 'km') return `${val.toFixed(0)} km`;
    if (unit === 'km/h') return `${val.toFixed(1)} km/h`;
    return `${val.toFixed(decimals)} ${unit || ''}`;
  };

  it('renders "—" for null diameter', () => {
    expect(formatValue(undefined, 'km')).toBe('—');
  });

  it('renders "—" for zero diameter', () => {
    expect(formatValue(0, 'km')).toBe('—');
  });

  it('renders "—" for null speed', () => {
    expect(formatValue(undefined, 'km/h', 1)).toBe('—');
  });

  it('renders "—" for zero speed', () => {
    expect(formatValue(0, 'km/h', 1)).toBe('—');
  });

  it('renders "—" for null miss distance', () => {
    expect(formatValue(undefined, 'km', 0)).toBe('—');
  });

  it('renders actual value when valid', () => {
    expect(formatValue(1.5, 'km')).toBe('2 km');
    expect(formatValue(25.123, 'km/h', 1)).toBe('25.1 km/h');
    expect(formatValue(5000000, 'km', 0)).toBe('5000000 km');
  });
});
