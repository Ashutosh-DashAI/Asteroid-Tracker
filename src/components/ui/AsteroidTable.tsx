import React from 'react';
import { Asteroid } from '@/types';

interface AsteroidTableProps {
  asteroids: Asteroid[];
  onRowClick?: (asteroid: Asteroid) => void;
  isLoading?: boolean;
}

export const AsteroidTable: React.FC<AsteroidTableProps> = ({
  asteroids,
  onRowClick,
  isLoading = false,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800/50 border-b border-slate-700/50">
            <th className="px-4 py-3 text-left font-semibold text-slate-300">Name</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-300">Diameter (km)</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-300">Speed (km/h)</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-300">Miss Distance (km)</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-300">Hazard</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-300">Next Approach</th>
          </tr>
        </thead>
        <tbody>
          {asteroids.map((asteroid, index) => (
            <tr
              key={asteroid.id || index}
              onClick={() => onRowClick?.(asteroid)}
              className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 font-medium text-blue-400 max-w-xs truncate hover:text-blue-300">
                {asteroid.name}
              </td>
              <td className="px-4 py-3 text-right text-slate-300">
                {asteroid.diameterKm?.toFixed(2) || 'N/A'} km
              </td>
              <td className="px-4 py-3 text-right text-purple-400 font-medium">
                {asteroid.speed?.toFixed(1) || 'N/A'} km/h
              </td>
              <td className="px-4 py-3 text-right text-cyan-400">
                {asteroid.missDistance?.toFixed(0) || 'N/A'} km
              </td>
              <td className="px-4 py-3 text-center">
                {asteroid.is_potentially_hazardous_asteroid ? (
                  <span className="inline-block px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-semibold rounded">
                    Yes
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-semibold rounded">
                    No
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs">
                {asteroid.nextCloseApproach?.close_approach_date
                  ? new Date(asteroid.nextCloseApproach.close_approach_date).toLocaleDateString()
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AsteroidTable;
