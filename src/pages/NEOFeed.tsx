import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter as FilterIcon } from 'lucide-react';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import AsteroidCard from '@/components/ui/AsteroidCard';
import AsteroidFilters from '@/components/filters/AsteroidFilters';
import Pagination from '@/components/ui/Pagination';
import { SkeletonLoader, TableSkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

export default function NEOFeed() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'closest' | 'largest' | 'fastest' | 'most-dangerous'>('closest');

  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    asteroids,
    loading,
    error,
    page,
    pageSize,
    total,
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

  // Fetch initial data
  useEffect(() => {
    fetchAsteroids(true);
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedSearch) {
      search(debouncedSearch);
    } else {
      clearSearch();
    }
  }, [debouncedSearch]);

  // Display results
  const displayAsteroids = (searchQuery ? searchResults : asteroids) || [];
  const totalPages = Math.ceil(total / pageSize);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const handleSortChange = (newSort: 'closest' | 'largest' | 'fastest' | 'most-dangerous') => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Asteroid Feed
        </h1>
        <p className="text-slate-400">Browse and explore near-Earth asteroids with advanced filtering</p>
      </motion.div>

      {/* Search and Controls */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <input
              type="text"
              placeholder="Search asteroid by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl text-blue-400 hover:bg-blue-600/30 transition-all"
          >
            <FilterIcon size={20} />
            <span className="hidden sm:inline text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-slate-400 flex items-center">Sort by:</span>
          {(['closest', 'largest', 'fastest', 'most-dangerous'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => handleSortChange(sort)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                sortBy === sort
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </button>
          ))}
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
          ) : loading || searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonLoader count={6} className="md:col-span-2 lg:col-span-3" />
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
              <div className="text-sm text-slate-400">
                Showing <span className="text-cyan-400 font-semibold">{displayAsteroids.length}</span> asteroids
                {searchQuery && ` matching "${searchQuery}"`}
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {displayAsteroids.map((asteroid) => (
                  <motion.div key={asteroid.id} variants={itemVariants}>
                    <AsteroidCard
                      name={asteroid.name}
                      diameterKm={asteroid.diameterKm || 0}
                      speedKmH={asteroid.speed || 0}
                      missDistanceKm={asteroid.missDistance || 0}
                      hazardous={asteroid.is_potentially_hazardous_asteroid}
                      nextApproachDate={asteroid.nextCloseApproach?.close_approach_date}
                      isFavorite={isFavorite(asteroid.id)}
                      onFavoriteClick={() => handleFavoriteClick(asteroid.id)}
                      onClick={() => handleAsteroidClick(asteroid.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {/* Pagination */}
          {!searchQuery && displayAsteroids.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                // setPage(newPage);
              }}
              isLoading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
