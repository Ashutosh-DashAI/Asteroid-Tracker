import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Calendar, Zap, Route } from 'lucide-react';
import { useCloseApproaches } from '@/hooks/useCloseApproaches';
import { formatDistance, formatVelocity } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { ErrorState } from '@/components/ui/EmptyState';

export default function CloseApproaches() {
  const navigate = useNavigate();
  const { events, isLoading, error } = useCloseApproaches(7);

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-slide-up">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold glow-text-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Close Approaches
          </h1>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} count={1} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-slide-up">
        <h1 className="text-4xl md:text-5xl font-bold glow-text-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Close Approaches
        </h1>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Group events by date
  const eventsByDate = events.reduce<Record<string, typeof events>>((acc, event) => {
    const date = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-slide-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Crosshair size={32} style={{ color: 'var(--cyan)' }} />
          <h1 className="text-4xl md:text-5xl font-bold glow-text-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Close Approaches
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Upcoming near-Earth asteroid approaches</p>
      </motion.div>

      {events.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--bg-deep)', border: '1px solid #ffffff08' }}
        >
          <Calendar size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 16px' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No upcoming approaches</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Check back later for new close approach events</p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Vertical timeline line */}
          <div
            className="absolute left-3 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, var(--cyan-dim), transparent)' }}
          />

          {Object.entries(eventsByDate).map(([dateLabel, dateEvents], groupIndex) => (
            <div key={dateLabel} className="mb-8">
              {/* Date header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="flex items-center gap-3 mb-4"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold -ml-11"
                  style={{
                    background: 'var(--bg-deep)',
                    border: '2px solid var(--cyan)',
                    color: 'var(--cyan)',
                  }}
                >
                  {new Date(dateEvents[0].date).getDate()}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {dateLabel}
                </span>
              </motion.div>

              {/* Events for this date */}
              <div className="space-y-3 ml-2">
                {dateEvents.map((event, eventIndex) => {
                  const isHazardous = event.hazardous;
                  const isNext7Days = new Date(event.date) >= now && new Date(event.date) <= sevenDaysFromNow;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 + eventIndex * 0.05 }}
                      className="rounded-xl p-4 cursor-pointer transition-all duration-200"
                      style={{
                        background: 'var(--bg-deep)',
                        border: isHazardous ? '1px solid var(--hazard-dim)' : '1px solid #ffffff08',
                        boxShadow: isHazardous ? '0 0 20px #ff444410' : 'var(--glow-card)',
                      }}
                      onClick={() => navigate(`/asteroid/${event.nasaId}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#ffffff18';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = isHazardous ? 'var(--hazard-dim)' : '#ffffff08';
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {/* Timeline dot */}
                          <div
                            className="w-2.5 h-2.5 rounded-full -ml-6"
                            style={{
                              background: isHazardous ? 'var(--hazard)' : 'var(--safe)',
                              boxShadow: isHazardous ? '0 0 8px var(--hazard)' : '0 0 8px var(--safe)',
                              animation: isNext7Days ? 'dotPulse 2s ease-in-out infinite' : 'none',
                            }}
                          />
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {event.asteroidName}
                          </span>
                          {isHazardous && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--hazard-dim)', color: 'var(--hazard)', letterSpacing: '0.08em' }}
                            >
                              ⚠ HAZARDOUS
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Miss Distance</span>
                          <p className="font-semibold" style={{ color: 'var(--cyan)' }}>
                            {formatDistance(event.missDistanceKm)}
                          </p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Speed</span>
                          <p className="font-semibold" style={{ color: 'var(--cyan)' }}>
                            {formatVelocity(event.velocityKmS)}
                          </p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-dim)' }}>Diameter</span>
                          <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            {event.estimatedDiameterMax < 1
                              ? `${Math.round(event.estimatedDiameterMax * 1000)}m`
                              : `${event.estimatedDiameterMax.toFixed(1)}km`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}