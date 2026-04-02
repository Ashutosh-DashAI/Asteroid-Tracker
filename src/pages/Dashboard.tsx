import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Star } from 'lucide-react';
import { getFeed, getStats } from '@/api/neo.api';
import { addToWatchlist } from '@/api/watchlist.api';
import GlassCard from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import OrbitalSpinner from '@/components/ui/OrbitalSpinner';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { formatDistance, formatVelocity } from '@/utils/formatters';

export default function Dashboard() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['neo-stats'], queryFn: getStats });
  const { data: feed, isLoading, error } = useQuery({ queryKey: ['neo-feed', page], queryFn: () => getFeed({ page, limit: 10 }) });
  const watchMutation = useMutation({ mutationFn: (nasaId: string) => addToWatchlist({ nasaId }), onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }) });
  const items = feed?.items || feed || [];
  const chart = useMemo(() => [
    { label: 'SAFE', count: stats?.riskDistribution?.SAFE || 0, fill: '#22c55e' },
    { label: 'WATCH', count: stats?.riskDistribution?.WATCH || 0, fill: '#eab308' },
    { label: 'WARNING', count: stats?.riskDistribution?.WARNING || 0, fill: '#f97316' },
    { label: 'CRITICAL', count: stats?.riskDistribution?.CRITICAL || 0, fill: '#ef4444' },
  ], [stats]);

  if (statsLoading || isLoading) return <OrbitalSpinner fullScreen />;
  if (error) return <button className="rounded border border-red-400 px-4 py-2 text-red-300" onClick={() => qc.invalidateQueries({ queryKey: ['neo-feed'] })}>Retry loading dashboard</button>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-cyan-300">NEAR-EARTH OBJECT MONITOR</h1>
        <p className="text-sm text-slate-300">TRACKING {stats?.totalToday || items.length} OBJECTS TODAY</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard><div className="text-xs text-slate-400">Total NEOs Tracked</div><div className="text-2xl">{stats?.totalTracked || 0}</div></GlassCard>
        <GlassCard className="border-red-400/30"><div className="text-xs text-slate-400">Potentially Hazardous</div><div className="text-2xl text-red-400">{stats?.hazardous || 0}</div></GlassCard>
        <GlassCard><div className="text-xs text-slate-400">Closest Approach</div><div className="text-2xl">{formatDistance(Number(stats?.closestDistanceKm || 0))}</div></GlassCard>
        <GlassCard><div className="text-xs text-slate-400">Fastest Object</div><div className="text-2xl">{formatVelocity(Number(stats?.fastestVelocityKms || 0))}</div></GlassCard>
      </div>

      <GlassCard>
        <h3 className="mb-3 text-lg text-cyan-300">Risk Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} layout="vertical">
              <CartesianGrid stroke="rgba(0,212,255,0.15)" />
              <XAxis type="number" stroke="#8ca3bf" />
              <YAxis type="category" dataKey="label" stroke="#8ca3bf" />
              <Bar dataKey="count" isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <GlassCard className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400"><th>Name</th><th>Diameter</th><th>Miss Distance</th><th>Velocity</th><th>Risk</th><th>Action</th></tr></thead>
            <tbody>
              {items.map((neo: any, idx: number) => (
                <tr key={neo.nasaId || neo.id || idx} className={`border-t border-cyan-400/10 ${idx % 2 ? 'bg-white/[0.02]' : ''}`}>
                  <td>{neo.name}</td><td>{neo.diameterKm?.toFixed?.(2) || '--'} km</td><td>{formatDistance(Number(neo.missDistanceKm || 0))}</td><td>{formatVelocity(Number(neo.velocityKms || 0))}</td>
                  <td><RiskBadge label={(neo.riskLabel || 'WATCH').toUpperCase()} score={neo.riskScore} /></td>
                  <td><button onClick={() => watchMutation.mutate(String(neo.nasaId || neo.id))} className="rounded px-2 py-1 hover:bg-cyan-400/10"><Star size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-2 py-1" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <button className="rounded border px-2 py-1" onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="mb-2 text-cyan-300">Upcoming Alerts</h3>
          {items.slice(0, 5).map((neo: any) => (
            <div key={neo.nasaId || neo.id} className="mb-2 rounded-lg border border-cyan-400/10 p-2">
              <div className="mb-1 flex items-center justify-between"><span>{neo.name}</span><RiskBadge label={(neo.riskLabel || 'WATCH').toUpperCase()} /></div>
              <CountdownTimer targetDate={neo.closeApproachDate || new Date().toISOString()} />
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}
