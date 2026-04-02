import React from 'react';
import { Calendar, AlertCircle, Gauge } from 'lucide-react';
import { AsteroidFeedFilter } from '@/types';

interface FiltersProps {
  filters: AsteroidFeedFilter;
  onFiltersChange: (filters: Partial<AsteroidFeedFilter>) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const AsteroidFilters: React.FC<FiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Filters</h3>
        <button
          onClick={onReset}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded transition-colors disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
          <Calendar size={16} className="text-blue-400" />
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFiltersChange({ startDate: e.target.value || undefined })}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFiltersChange({ endDate: e.target.value || undefined })}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Hazard Filter */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <AlertCircle size={16} className="text-red-400" />
          Hazard Status
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.hazardousOnly || false}
            onChange={(e) => onFiltersChange({ hazardousOnly: e.target.checked })}
            disabled={isLoading}
            className="w-4 h-4 accent-red-500 cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            Hazardous Only
          </span>
        </label>
      </div>

      {/* Diameter Range */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
          <Gauge size={16} className="text-purple-400" />
          Diameter Range (km)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.diameterMin || ''}
            onChange={(e) => onFiltersChange({ diameterMin: e.target.value ? parseFloat(e.target.value) : undefined })}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.diameterMax || ''}
            onChange={(e) => onFiltersChange({ diameterMax: e.target.value ? parseFloat(e.target.value) : undefined })}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Miss Distance Range */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-300 block">Miss Distance Range (km)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.missDistanceMin || ''}
            onChange={(e) =>
              onFiltersChange({ missDistanceMin: e.target.value ? parseFloat(e.target.value) : undefined })
            }
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.missDistanceMax || ''}
            onChange={(e) =>
              onFiltersChange({ missDistanceMax: e.target.value ? parseFloat(e.target.value) : undefined })
            }
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default AsteroidFilters;
