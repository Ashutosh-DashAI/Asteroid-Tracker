import { useMemo } from 'react';
import { formatDistance, formatVelocity } from '@/utils/formatters';

// Props: items
export default function DataTicker({ items = [] }: { items?: any[] }) {
  const safeItems = Array.isArray(items) ? items : [];
  const list = useMemo(() => [...safeItems, ...safeItems], [safeItems]);
  if (!list.length) return <div className="rounded-xl border border-cyan-400/20 bg-[#0d0d1a]/90 px-4 py-2 text-sm text-cyan-300/70">No live NEO data yet</div>;
  return (
    <div className="overflow-hidden rounded-xl border border-cyan-400/20 bg-[#0d0d1a]/90 py-2 text-cyan-300">
      <div className="flex w-max gap-8 px-4" style={{ animation: 'tickerScroll 28s linear infinite' }}>
        {list.map((neo, i) => (
          <div key={`${neo?.nasaId || neo?.name || i}-${i}`} className="whitespace-nowrap text-sm">
            {neo?.name || 'Unknown'} - {formatDistance(Number(neo?.missDistanceKm || 0))} - {formatVelocity(Number(neo?.velocityKms || 0))}
          </div>
        ))}
      </div>
    </div>
  );
}
