import React from 'react';
import { Star, Zap, AlertCircle } from 'lucide-react';

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
  diameterKm = 0,
  speedKmH = 0,
  missDistanceKm = 0,
  hazardous,
  nextApproachDate,
  isFavorite = false,
  onFavoriteClick,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      {/* Header with name and favorite button */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="text-sm md:text-base font-semibold text-white flex-1 truncate group-hover:text-blue-300 transition-colors">
          {name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
          className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors"
        >
          <Star
            size={16}
            className={`transition-all ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}
          />
        </button>
      </div>

      {/* Hazard Badge */}
      {hazardous && (
        <div className="inline-flex items-center gap-1 mb-3 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-400 font-semibold">
          <AlertCircle size={12} />
          Hazardous
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-slate-500 text-xs mb-1">Diameter</p>
          <p className="text-blue-400 font-semibold">{diameterKm.toFixed(2)} km</p>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-slate-500 text-xs mb-1">Speed</p>
          <p className="font-semibold text-purple-400 flex items-center gap-1">
            <Zap size={12} />
            {speedKmH.toFixed(1)} km/h
          </p>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-slate-500 text-xs mb-1">Miss Distance</p>
          <p className="text-cyan-400 font-semibold">{missDistanceKm.toFixed(0)} km</p>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-slate-500 text-xs mb-1">Approach</p>
          <p className="text-slate-300 font-semibold text-xs">
            {nextApproachDate ? new Date(nextApproachDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default AsteroidCard;
