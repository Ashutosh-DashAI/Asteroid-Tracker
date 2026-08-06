import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, AlertCircle, Zap, Target, MapPin } from 'lucide-react';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import StatCard from '@/components/ui/StatCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ErrorState } from '@/components/ui/EmptyState';

export default function AsteroidDetail() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const {
    selectedAsteroid,
    selectedLoading,
    error,
    fetchAsteroidDetail,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearSelected,
  } = useAsteroidsStore();

  useEffect(() => {
    if (id) {
      fetchAsteroidDetail(id);
    }

    return () => {
      clearSelected();
    };
  }, [id]);

  if (selectedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <SkeletonLoader count={5} />
      </div>
    );
  }

  if (error || !selectedAsteroid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <ErrorState
          message={error || 'Asteroid not found'}
          onRetry={() => fetchAsteroidDetail(id)}
        />
      </div>
    );
  }

  const asteroid = selectedAsteroid;
  const nextApproach = asteroid.nextCloseApproach;
  const favorite = isFavorite(asteroid.id);

  const handleFavoriteToggle = () => {
    if (favorite) {
      removeFavorite(asteroid.id);
    } else {
      addFavorite(asteroid.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Feed
      </button>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-8"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />

        <div className="relative z-10 flex justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {asteroid.name}
              </h1>
              <button
                onClick={handleFavoriteToggle}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Star
                  size={32}
                  className={favorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}
                />
              </button>
            </div>

            <p className="text-slate-400 text-lg mb-4">
              ID: <span className="text-cyan-400 font-mono">{asteroid.id}</span>
            </p>

            {asteroid.is_potentially_hazardous_asteroid && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                <AlertCircle size={20} className="text-red-400" />
                <span className="text-red-400 font-semibold">Potentially Hazardous</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Diameter"
          value={asteroid.diameterKm?.toFixed(2) || 'N/A'}
          unit="km"
          icon={<Target size={24} />}
          delay={0}
        />
        <StatCard
          title="Speed"
          value={asteroid.speed?.toFixed(1) || 'N/A'}
          unit="km/h"
          icon={<Zap size={24} />}
          delay={0.1}
        />
        <StatCard
          title="Miss Distance"
          value={asteroid.missDistance?.toFixed(0) || 'N/A'}
          unit="km"
          icon={<MapPin size={24} />}
          delay={0.2}
        />
        <StatCard
          title="Magnitude"
          value={asteroid.absolute_magnitude_h?.toFixed(2) || 'N/A'}
          unit="H"
          delay={0.3}
        />
      </div>

      {/* Close Approach Information */}
      {nextApproach && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Next Close Approach</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Date</p>
              <p className="text-xl font-semibold text-blue-400">
                {new Date(nextApproach.close_approach_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Miss Distance</p>
              <p className="text-xl font-semibold text-cyan-400">
                {nextApproach.miss_distance?.kilometers
                  ? parseFloat(nextApproach.miss_distance.kilometers).toFixed(0)
                  : 'N/A'}{' '}
                km
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Relative Velocity</p>
              <p className="text-xl font-semibold text-purple-400">
                {nextApproach.relative_velocity?.kilometers_per_hour
                  ? parseFloat(nextApproach.relative_velocity.kilometers_per_hour).toFixed(1)
                  : 'N/A'}{' '}
                km/h
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Orbiting Body</p>
              <p className="text-xl font-semibold text-slate-300">{nextApproach.orbiting_body}</p>
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">In Lunar Distance</p>
              <p className="text-xl font-semibold text-slate-300">
                {nextApproach.miss_distance?.lunar
                  ? parseFloat(nextApproach.miss_distance.lunar).toFixed(2)
                  : 'N/A'}{' '}
                LD
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">In AU</p>
              <p className="text-xl font-semibold text-slate-300">
                {nextApproach.miss_distance?.astronomical
                  ? parseFloat(nextApproach.miss_distance.astronomical).toFixed(6)
                  : 'N/A'}{' '}
                AU
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* All Close Approaches */}
      {asteroid.close_approach_data && asteroid.close_approach_data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Historical Close Approaches</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-4 py-3 text-left text-slate-300">Date</th>
                  <th className="px-4 py-3 text-right text-slate-300">Miss Distance (km)</th>
                  <th className="px-4 py-3 text-right text-slate-300">Velocity (km/h)</th>
                  <th className="px-4 py-3 text-left text-slate-300">Body</th>
                </tr>
              </thead>
              <tbody>
                {asteroid.close_approach_data.slice(0, 10).map((approach, index) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(approach.close_approach_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-cyan-400">
                      {parseFloat(approach.miss_distance?.kilometers || '0').toFixed(0)} km
                    </td>
                    <td className="px-4 py-3 text-right text-purple-400">
                      {parseFloat(approach.relative_velocity?.kilometers_per_hour || '0').toFixed(1)} km/h
                    </td>
                    <td className="px-4 py-3 text-slate-300">{approach.orbiting_body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Orbital Data */}
      {asteroid.orbital_data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Orbital Data</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Orbital Period (days)</p>
              <p className="text-lg font-semibold text-cyan-400">{asteroid.orbital_data.orbital_period}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Semi-Major Axis (AU)</p>
              <p className="text-lg font-semibold text-cyan-400">{asteroid.orbital_data.semi_major_axis}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Eccentricity</p>
              <p className="text-lg font-semibold text-cyan-400">{asteroid.orbital_data.eccentricity}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Inclination (deg)</p>
              <p className="text-lg font-semibold text-cyan-400">{asteroid.orbital_data.inclination}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Orbit Class</p>
              <p className="text-lg font-semibold text-cyan-400">
                {asteroid.orbital_data.orbit_class?.orbit_class_type}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Mean Motion (deg/day)</p>
              <p className="text-lg font-semibold text-cyan-400">{asteroid.orbital_data.mean_motion}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
