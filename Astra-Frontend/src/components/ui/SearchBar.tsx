import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { getBrowse } from '@/api/neo.api';
import RiskBadge from './RiskBadge';
import { formatDistance } from '@/utils/formatters';

// Props: onSelect
export default function SearchBar({ onSelect }: { onSelect?: (neo: any) => void }) {
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 400);
  const { data } = useQuery({
    queryKey: ['neo-search', debounced],
    queryFn: () => getBrowse({ search: debounced }),
    enabled: debounced.length > 1,
  });
  const items = data?.items || data || [];
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-3 text-cyan-300/70" size={18} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search NEOs..." className="w-full rounded-xl border border-cyan-300/20 bg-[#0d0d1a]/80 py-2 pl-10 pr-3 text-sm focus:border-cyan-300/60 focus:outline-none" />
      {debounced && (
        <div className="glass-card absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl p-2">
          {items.map((neo: any) => (
            <button key={neo.nasaId || neo.id} onClick={() => onSelect?.(neo)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-cyan-300/10">
              <span className="truncate">{neo.name}</span>
              <div className="flex items-center gap-2">
                <RiskBadge label={(neo.riskLabel || 'WATCH').toUpperCase()} />
                <span className="text-xs text-slate-300">{formatDistance(Number(neo.missDistanceKm || 0))}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
