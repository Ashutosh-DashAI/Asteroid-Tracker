import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, Target, Zap, TrendingUp } from 'lucide-react';
import asteroidsAPI from '@/api/asteroids.api';
import { useAsteroidsStore } from '@/store/useAsteroidsStore';
import StatCard from '@/components/ui/StatCard';
import AsteroidCountChart from '@/components/charts/AsteroidCountChart';
import HazardPieChart from '@/components/charts/HazardPieChart';
import DiameterDistributionChart from '@/components/charts/DiameterDistributionChart';
import AsteroidTable from '@/components/ui/AsteroidTable';
import { SkeletonLoader, TableSkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

// Default stats object to prevent crashes on undefined response
const DEFAULT_STATS = {
  totalAsteroids: 0,
  hazardousCount: 0,
  avgDiameter: 0,
  maxSpeed: 0,
  totalCount: 0,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { asteroids, fetchAsteroids, fetchFavorites } = useAsteroidsStore();

  // Fetch stats
  const {
    data: stats = DEFAULT_STATS,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['asteroidStats'],
    queryFn: () => asteroidsAPI.getStats(),
    refetchInterval: 5 * 60 * 1000,
  });

  // Fetch recent asteroids
  const {
    data: recentAsteroids,
    isLoading: recentLoading,
    error: recentError,
  } = useQuery({
    queryKey: ['recentAsteroids'],
    queryFn: () =>
      asteroidsAPI.getFeed({
        page: 1,
        limit: 10,
        sortBy: 'closest',
      }),
  });

  useEffect(() => {
    fetchAsteroids(true);
    fetchFavorites();
  }, []);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 50) + 20,
      });
    }
    return data;
  }, []);

  const diameterData = useMemo(() => [
    { range: '< 1km', count: Math.floor(Math.random() * 200) + 100 },
    { range: '1-5km', count: Math.floor(Math.random() * 150) + 50 },
    { range: '5-10km', count: Math.floor(Math.random() * 100) + 30 },
    { range: '10-50km', count: Math.floor(Math.random() * 80) + 20 },
    { range: '> 50km', count: Math.floor(Math.random() * 50) + 10 },
  ], []);

  const handleAsteroidClick = (id: string) => {
    navigate(`/asteroid/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Asteroid Dashboard
        </h1>
        <p className="text-slate-400">Real-time tracking and analysis of near-Earth asteroids</p>
      </motion.div>

      {/* Stats Cards */}
      {statsError ? (
        <ErrorState message={statsError.message} onRetry={() => refetchStats()} />
      ) : statsLoading ? (
        <SkeletonLoader count={4} />
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Asteroids"
            value={stats.totalAsteroids}
            icon={<TrendingUp size={24} />}
            delay={0}
          />
          <StatCard
            title="Hazardous"
            value={stats.hazardousCount}
            icon={<AlertCircle size={24} />}
            delay={0.1}
          />
          <StatCard
            title="Avg Diameter"
            value={(stats?.avgDiameter ?? 0).toFixed(2)}
            unit="km"
            icon={<Target size={24} />}
            delay={0.2}
          />
          <StatCard
            title="Max Speed"
            value={(stats?.maxSpeed ?? 0).toFixed(1)}
            unit="km/h"
            icon={<Zap size={24} />}
            delay={0.3}
          />
        </div>
      ) : null}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AsteroidCountChart data={chartData} />
        {stats && (
          <HazardPieChart
            hazardousCount={stats.hazardousCount}
            nonHazardousCount={Math.max(0, (stats.totalAsteroids || 0) - stats.hazardousCount)}
          />
        )}
      </div>

      <div className="w-full">
        <DiameterDistributionChart data={diameterData} />
      </div>

      {/* Recent Asteroids */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Recent Close Approaches</h2>
          <button
            onClick={() => navigate('/feed')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            View All
          </button>
        </div>

        {recentError ? (
          <ErrorState message={recentError.message} />
        ) : recentLoading ? (
          <TableSkeletonLoader rows={10} columns={6} />
        ) : recentAsteroids?.asteroids && recentAsteroids.asteroids.length > 0 ? (
          <AsteroidTable
            asteroids={recentAsteroids.asteroids}
            onRowClick={(asteroid) => handleAsteroidClick(asteroid.id)}
          />
        ) : (
          <EmptyState title="No asteroids found" description="Check back later for more data" />
        )}
      </motion.div>
    </div>
  );
}
