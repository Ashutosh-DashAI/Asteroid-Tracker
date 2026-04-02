import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import AsteroidCard from '@/components/ui/AsteroidCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function Watchlist() {
  const navigate = useNavigate();
  const { favorites, favoritesLoading, fetchFavorites, removeFavorite } = useAsteroidsStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Star size={32} className="text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Watchlist
          </h1>
        </div>
        <p className="text-slate-400">Asteroids you're tracking</p>
      </motion.div>

      {/* Results */}
      {favoritesLoading ? (
        <SkeletonLoader count={6} />
      ) : favorites.length === 0 ? (
        <EmptyState
          title="No asteroids saved"
          description="Start saving asteroids to track them here"
          icon={<Star size={48} />}
          action={{
            label: 'Browse Asteroids',
            onClick: () => navigate('/feed'),
          }}
        />
      ) : (
        <>
          <div className="text-sm text-slate-400">
            Tracking <span className="text-cyan-400 font-semibold">{favorites.length}</span> asteroids
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {favorites.map((savedAsteroid) => {
              const asteroid = savedAsteroid.asteroid;
              return (
                <motion.div key={asteroid.id} variants={itemVariants}>
                  <AsteroidCard
                    name={asteroid.name}
                    diameterKm={asteroid.diameterKm || 0}
                    speedKmH={asteroid.speed || 0}
                    missDistanceKm={asteroid.missDistance || 0}
                    hazardous={asteroid.is_potentially_hazardous_asteroid}
                    nextApproachDate={asteroid.nextCloseApproach?.close_approach_date}
                    isFavorite={true}
                    onFavoriteClick={() => removeFavorite(asteroid.id)}
                    onClick={() => navigate(`/asteroid/${asteroid.id}`)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}
