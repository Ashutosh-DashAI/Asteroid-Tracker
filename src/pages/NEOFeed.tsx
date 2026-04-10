import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter as FilterIcon } from 'lucide-react';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import AsteroidCard from '@/components/ui/AsteroidCard';
import AsteroidFilters from '@/components/filters/AsteroidFilters';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useAsteroidFeed } from '@/hooks/useAsteroidFeed';

type SortOption = 'closest' | 'largest' | 'fastest' | 'most-dangerous';

export default function NEOFeed() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortOption>('closest');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    asteroids: storeAsteroids,
    loading,
    error,
    filters,
    isFavorite,
    fetchAsteroids,
    setFilters,
    resetFilters,
    setSortBy: storeSetSortBy,
    search,
    clearSearch,
    addFavorite,
    removeFavorite,
    searchQuery,
    searchResults,
    searchLoading,
  } = useAsteroidsStore();

  // Infinite scroll feed
  const { data: feedData, isLoading: feedLoading, isLoadingMore, hasMore, sentinelRef } = useAsteroidFeed(filters);

  useEffect(() => {
    fetchAsteroids(true);
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      search(debouncedSearch);
    } else {
      clearSearch();
    }
  }, [debouncedSearch]);

  // Display results — use feed data or store data
  const displayAsteroids = useMemo(() => {
    const source = searchQuery ? searchResults : (feedData.length > 0 ? feedData : storeAsteroids);
    if (!source || source.length === 0) return [];

    return [...source].sort((a, b) => {
      switch (sortBy) {
        case 'closest': {
          const aDist = a.closeApproaches?.[0]?.missDistanceKm ?? Infinity;
          const bDist = b.closeApproaches?.[0]?.missDistanceKm ?? Infinity;
          return aDist - bDist;
        }
        case 'largest':
          return (b.estimatedDiameterMax || 0) - (a.estimatedDiameterMax || 0);
        case 'fastest':
          return (b.closeApproaches?.[0]?.velocityKmS || 0) - (a.closeApproaches?.[0]?.velocityKmS || 0);
        case 'most-dangerous':
          if ((a.isPotentiallyHazardous || false) !== (b.isPotentiallyHazardous || false)) {
            return a.isPotentiallyHazardous ? -1 : 1;
          }
          return (a.closeApproaches?.[0]?.missDistanceKm ?? Infinity) - (b.closeApproaches?.[0]?.missDistanceKm ?? Infinity);
        default:
          return 0;
      }
    });
  }, [searchQuery, searchResults, feedData, storeAsteroids, sortBy]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    storeSetSortBy(newSort);
  };

  const handleFavoriteClick = (asteroidId: string) => {
    if (isFavorite(asteroidId)) {
      removeFavorite(asteroidId);
    } else {
      addFavorite(asteroidId);
    }
  };

  const handleAsteroidClick = (id: string) => {
    navigate(`/asteroid/${id}`);
  };

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'closest', label: 'Closest' },
    { key: 'largest', label: 'Largest' },
    { key: 'fastest', label: 'Fastest' },
    { key: 'most-dangerous', label: 'Dangerous' },
  ];

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold glow-text-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Asteroid Feed
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Browse and explore near-Earth asteroids with advanced filtering</p>
      </motion.div>

      {/* Search and Controls */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={20} style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search asteroid by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid #ffffff08',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--cyan-dim)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ffffff08';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: showFilters ? 'var(--cyan-dim)' : 'var(--bg-surface)',
              border: `1px solid ${showFilters ? 'var(--cyan)' : '#ffffff08'}`,
              color: showFilters ? 'var(--cyan)' : 'var(--text-secondary)',
            }}
          >
            <FilterIcon size={18} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm" style={{ color: 'var(--text-dim)' }}>Sort by:</span>
          <div
            className="flex gap-1 p-1 rounded-full"
            style={{ background: 'var(--bg-surface)' }}
          >
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSortChange(option.key)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  background: sortBy === option.key
                    ? 'linear-gradient(135deg, var(--purple), var(--cyan))'
                    : 'transparent',
                  color: sortBy === option.key ? 'white' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (sortBy !== option.key) e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  if (sortBy !== option.key) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-1"
          >
            <AsteroidFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
              isLoading={loading || searchLoading}
            />
          </motion.div>
        )}

        {/* Main Content */}
        <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
          {/* Results */}
          {error ? (
            <ErrorState message={error} onRetry={() => fetchAsteroids(true)} />
          ) : feedLoading || searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard count={6} />
            </div>
          ) : displayAsteroids.length === 0 ? (
            <EmptyState
              title="No asteroids found"
              description={searchQuery ? 'Try adjusting your search or reset filters' : 'Try adjusting your filters'}
              action={{
                label: 'Reset Filters',
                onClick: () => {
                  resetFilters();
                  setSearchTerm('');
                },
              }}
            />
          ) : (
            <>
              <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
                Showing <span className="font-semibold" style={{ color: 'var(--cyan)' }}>{displayAsteroids.length}</span> asteroids
                {searchQuery && ` matching "${searchQuery}"`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayAsteroids.map((asteroid, index) => (
                  <motion.div
                    key={asteroid.nasaId || asteroid.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AsteroidCard
                      name={asteroid.name}
                      diameterKm={asteroid.estimatedDiameterMax || asteroid.estimatedDiameterMin || undefined}
                      speedKmH={asteroid.closeApproaches?.[0]?.velocityKmS ? asteroid.closeApproaches[0].velocityKmS * 3600 : undefined}
                      missDistanceKm={asteroid.closeApproaches?.[0]?.missDistanceKm || undefined}
                      hazardous={asteroid.isPotentiallyHazardous || asteroid.is_potentially_hazardous_asteroid || false}
                      nextApproachDate={asteroid.closeApproaches?.[0]?.date}
                      isFavorite={isFavorite(asteroid.nasaId || asteroid.id)}
                      onFavoriteClick={() => handleFavoriteClick(asteroid.nasaId || asteroid.id)}
                      onClick={() => handleAsteroidClick(asteroid.nasaId || asteroid.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              {!searchQuery && (
                <>
                  {isLoadingMore && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <SkeletonCard count={3} />
                    </div>
                  )}
                  <div ref={sentinelRef} className="h-4" />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}