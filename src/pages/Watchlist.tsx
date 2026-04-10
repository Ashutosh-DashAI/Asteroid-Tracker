import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import AsteroidCard from '@/components/ui/AsteroidCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { useNavigate } from 'react-router-dom';

/** Animated starfield dots for empty state background */
function StarfieldDots() {
  const dots = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full bg-white"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            animation: `twinkle ${dot.duration} ease-in-out infinite`,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function Watchlist() {
  const navigate = useNavigate();
  const { favorites, favoritesLoading, fetchFavorites, removeFavorite } = useAsteroidsStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Star size={32} style={{ color: 'var(--cyan)', filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' }} />
          <h1 className="text-4xl md:text-5xl font-bold glow-text-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            My Watchlist
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Asteroids you're tracking</p>
      </motion.div>

      {/* Results */}
      {favoritesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard count={6} />
        </div>
      ) : favorites.length === 0 ? (
        /* ── Animated empty state ── */
        <div
          className="relative flex flex-col items-center justify-center py-24 px-4 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid #ffffff08',
          }}
        >
          <StarfieldDots />

          {/* Animated SVG star with pulse glow */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              filter: [
                'drop-shadow(0 0 4px rgba(0,212,255,0.3))',
                'drop-shadow(0 0 16px rgba(0,212,255,0.6))',
                'drop-shadow(0 0 4px rgba(0,212,255,0.3))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 mb-8"
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </motion.div>

          <h3 className="text-2xl font-bold mb-2 relative z-10" style={{ color: 'var(--text-primary)' }}>
            No asteroids tracked yet
          </h3>
          <p className="text-center mb-8 max-w-md relative z-10" style={{ color: 'var(--text-secondary)' }}>
            Save asteroids from the feed to track their approach dates
          </p>

          <button
            onClick={() => navigate('/feed')}
            className="relative z-10 px-6 py-3 rounded-xl font-medium text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
              boxShadow: '0 0 20px rgba(0,212,255,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,255,0.5)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Browse Asteroids
          </button>
        </div>
      ) : (
        <>
          <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Tracking <span className="font-semibold" style={{ color: 'var(--cyan)' }}>{favorites.length}</span> asteroids
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((savedAsteroid, index) => {
              const asteroid = savedAsteroid.asteroid;
              return (
                <motion.div
                  key={asteroid.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AsteroidCard
                    name={asteroid.name}
                    diameterKm={asteroid.estimatedDiameterMax || asteroid.estimatedDiameterMin || asteroid.diameterKm || undefined}
                    speedKmH={asteroid.closeApproaches?.[0]?.velocityKmS
                      ? asteroid.closeApproaches[0].velocityKmS * 3600
                      : asteroid.speed || undefined}
                    missDistanceKm={asteroid.closeApproaches?.[0]?.missDistanceKm || asteroid.missDistance || undefined}
                    hazardous={asteroid.isPotentiallyHazardous || asteroid.is_potentially_hazardous_asteroid || false}
                    nextApproachDate={asteroid.closeApproaches?.[0]?.date || asteroid.nextCloseApproach?.close_approach_date}
                    isFavorite={true}
                    onFavoriteClick={() => removeFavorite(asteroid.id)}
                    onClick={() => navigate(`/asteroid/${asteroid.nasaId || asteroid.id}`)}
                  />
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}