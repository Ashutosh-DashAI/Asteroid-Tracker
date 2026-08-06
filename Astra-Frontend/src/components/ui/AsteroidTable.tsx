import React from 'react';
import { Asteroid } from '@/types';

interface AsteroidTableProps {
  asteroids: Asteroid[];
  onRowClick?: (asteroid: Asteroid) => void;
  isLoading?: boolean;
}

const fmt = (val: number | undefined | null, decimals = 2, unit = '', fallback = '—') => {
  if (val == null || val === 0) return fallback;
  return `${val.toFixed(decimals)}${unit ? ' ' + unit : ''}`;
};

export const AsteroidTable: React.FC<AsteroidTableProps> = ({
  asteroids,
  onRowClick,
  isLoading = false,
}) => {
  return (
    <div
      className="overflow-x-auto rounded-2xl"
      style={{
        background: 'var(--bg-deep)',
        border: '1px solid #ffffff08',
        boxShadow: 'var(--glow-card)',
      }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #ffffff08' }}>
            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
            <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>Diameter</th>
            <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>Speed</th>
            <th className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--text-secondary)' }}>Miss Distance</th>
            <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--text-secondary)' }}>Hazard</th>
            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Next Approach</th>
          </tr>
        </thead>
        <tbody>
          {asteroids.map((asteroid, index) => {
            const diameterKm = asteroid.estimatedDiameterMax || asteroid.estimatedDiameterMin;
            const speedKmH = asteroid.closeApproaches?.[0]?.velocityKmS
              ? asteroid.closeApproaches[0].velocityKmS * 3600
              : undefined;
            const missDistKm = asteroid.closeApproaches?.[0]?.missDistanceKm;
            const isHazardous = asteroid.isPotentiallyHazardous || asteroid.is_potentially_hazardous_asteroid || false;
            const approachDate = asteroid.closeApproaches?.[0]?.date || asteroid.nextCloseApproach?.close_approach_date;

            return (
              <tr
                key={asteroid.nasaId || asteroid.id || index}
                onClick={() => onRowClick?.(asteroid)}
                className="cursor-pointer transition-colors duration-150"
                style={{ borderBottom: '1px solid #ffffff05' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-4 py-3 font-medium max-w-xs truncate" style={{ color: 'var(--cyan)' }}>
                  {asteroid.name}
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--cyan)' }}>
                  {fmt(diameterKm, diameterKm && diameterKm < 1 ? 0 : 1, 'km')}
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--cyan)' }}>
                  {fmt(speedKmH, 0, 'km/h')}
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--cyan)' }}>
                  {fmt(missDistKm, 0, 'km')}
                </td>
                <td className="px-4 py-3 text-center">
                  {isHazardous ? (
                    <span
                      className="inline-block px-2 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: 'var(--hazard-dim)', color: 'var(--hazard)', letterSpacing: '0.08em' }}
                    >
                      ⚠ HAZARDOUS
                    </span>
                  ) : (
                    <span
                      className="inline-block px-2 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: 'var(--safe-dim)', color: 'var(--safe)' }}
                    >
                      SAFE
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {approachDate ? new Date(approachDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AsteroidTable;