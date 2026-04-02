import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getById } from '@/api/neo.api';
import { addToWatchlist, removeFromWatchlist } from '@/api/watchlist.api';
import GlassCard from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import OrbitScene from '@/components/3d/OrbitScene';
import ChatPanel from '@/components/chat/ChatPanel';

export default function AsteroidDetail() {
  const { nasaId = '' } = useParams();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['neo-detail', nasaId], queryFn: () => getById(nasaId), enabled: !!nasaId });
  const add = useMutation({ mutationFn: () => addToWatchlist({ nasaId }), onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }) });
  const remove = useMutation({ mutationFn: () => removeFromWatchlist(nasaId), onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }) });
  const neo = data?.item || data || {};
  const timeline = neo.closeApproaches || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-cyan-300">{neo.name || nasaId}</h1>
        <div className="flex items-center gap-2">
          <RiskBadge label={(neo.riskLabel || 'WATCH').toUpperCase()} score={neo.riskScore} size="md" />
          <button className="rounded border border-cyan-300/30 px-3 py-1" onClick={() => add.mutate()}>Add</button>
          <button className="rounded border border-red-300/30 px-3 py-1" onClick={() => remove.mutate()}>Remove</button>
        </div>
      </div>
      {neo.isPotentiallyHazardous && <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-2 text-red-300">Potentially hazardous asteroid.</div>}
      <div className="grid gap-3 md:grid-cols-4">
        <GlassCard>Absolute Magnitude: {neo.absoluteMagnitude || '--'}</GlassCard>
        <GlassCard>Diameter: {neo.diameterMinKm || '--'} - {neo.diameterMaxKm || '--'} km</GlassCard>
        <GlassCard>NASA ID: {nasaId}</GlassCard>
        <GlassCard>First Observation: {neo.firstObservationDate || '--'}</GlassCard>
      </div>
      <GlassCard><h3 className="mb-2">Close Approaches Timeline</h3>{timeline.map((a: any, i: number) => <div key={i} className="mb-2 border-l-2 border-cyan-400/30 pl-3">{a.date} - {a.missDistanceKm} km - {a.velocityKms} km/s</div>)}</GlassCard>
      <OrbitScene asteroid={neo} />
      <ChatPanel nasaId={nasaId} />
    </div>
  );
}
