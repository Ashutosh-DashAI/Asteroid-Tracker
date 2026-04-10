import React from 'react';
import { Star, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AsteroidCardProps {
  name: string;
  diameterKm?: number;
  speedKmH?: number;
  missDistanceKm?: number;
  hazardous: boolean;
  nextApproachDate?: string;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  onClick?: () => void;
}

export const AsteroidCard: React.FC<AsteroidCardProps> = ({
  name,
  diameterKm,
  speedKmH,
  missDistanceKm,
  hazardous,
  nextApproachDate,
  isFavorite = false,
  onFavoriteClick,
  onClick,
}) => {
  const formatValue = (val?: number, unit?: string, decimals = 2) => {
    if (val == null || val === 0) return '—';
    if (unit === 'km') return `${val.toFixed(0)} km`;
    if (unit === 'km/h') return `${val.toFixed(1)} km/h`;
    return `${val.toFixed(decimals)} ${unit || ''}`;
  };

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl p-5 cursor-pointer overflow-hidden transition-all duration-250"
      style={{
        background: 'var(--bg-deep)',
        border: hazardous ? '1px solid var(--hazard-dim)' : '1px solid #ffffff08',
        boxShadow: hazardous ? '0 0 30px #ff444410' : 'var(--glow-card)',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
        e.currentTarget.style.borderColor = '#ffffff18';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = hazardous ? 'var(--hazard-dim)' : '#ffffff08';
      }}
    >
      {/* Hazard badge — top right */}
      {hazardous && (
        <div
          className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background: 'var(--hazard-dim)',
            color: 'var(--hazard)',
            border: '1px solid var(--hazard-dim)',
            letterSpacing: '0.08em',
          }}
        >
          ⚠ HAZARDOUS
        </div>
      )}

      {/* Header with name and favorite button */}
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3
          className="text-sm md:text-base font-semibold flex-1 truncate transition-colors duration-150"
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        >
          {name}
        </h3>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
          className="flex-shrink-0 p-1.5 rounded-md transition-colors duration-150"
          style={{ color: isFavorite ? '#facc15' : 'var(--text-dim)' }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Star
            size={16}
            className={`transition-all duration-200 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
          />
        </motion.button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-1" style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Diameter</p>
          <p className="font-semibold" style={{ color: 'var(--cyan)' }}>
            {formatValue(diameterKm, 'km')}
          </p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-1" style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Speed</p>
          <p className="font-semibold flex items-center gap-1" style={{ color: 'var(--cyan)' }}>
            <Zap size={10} />
            {formatValue(speedKmH, 'km/h', 1)}
          </p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-1" style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Miss Distance</p>
          <p className="font-semibold" style={{ color: 'var(--cyan)' }}>
            {formatValue(missDistanceKm, 'km', 0)}
          </p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
          <p className="mb-1" style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Approach</p>
          <p className="font-semibold" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
            {nextApproachDate ? new Date(nextApproachDate).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: hazardous
            ? 'linear-gradient(90deg, transparent, var(--hazard), transparent)'
            : 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
        }}
      />
    </div>
  );
};

export default AsteroidCard;