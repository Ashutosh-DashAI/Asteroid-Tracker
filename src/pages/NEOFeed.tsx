import { useQuery } from '@tanstack/react-query';
import { getBrowse } from '@/api/neo.api';
import SearchBar from '@/components/ui/SearchBar';
import GlassCard from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import CountdownTimer from '@/components/ui/CountdownTimer';
import OrbitalSpinner from '@/components/ui/OrbitalSpinner';

export default function NEOFeed() {
  const { data, isLoading } = useQuery({ queryKey: ['neo-browse'], queryFn: () => getBrowse({ limit: 18 }) });
  const items = data?.items || data || [];
  if (isLoading) return <OrbitalSpinner fullScreen />;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input type="date" className="rounded-xl border border-cyan-300/20 bg-[#0d0d1a]/70 p-2" />
        <input type="date" className="rounded-xl border border-cyan-300/20 bg-[#0d0d1a]/70 p-2" />
        <select className="rounded-xl border border-cyan-300/20 bg-[#0d0d1a]/70 p-2"><option>Miss Distance</option><option>Velocity</option><option>Risk Score</option><option>Date</option></select>
        <SearchBar />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((neo: any, i: number) => (
          <GlassCard key={neo.nasaId || neo.id || i} className="transition hover:-translate-y-1">
            <div className="mb-2 flex items-center justify-between"><RiskBadge label={(neo.riskLabel || 'WATCH').toUpperCase()} /><span>{neo.isPotentiallyHazardous ? '☢' : ''}</span></div>
            <h3 className="truncate text-lg text-cyan-200" title={neo.name}>{neo.name}</h3>
            <p className="mt-2 text-sm">🎯 {neo.missDistanceKm} km</p><p className="text-sm">⚡ {neo.velocityKms} km/s</p><p className="text-sm">📏 {neo.diameterKm} km</p>
            <div className="mt-3"><CountdownTimer targetDate={neo.closeApproachDate || new Date().toISOString()} /></div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
