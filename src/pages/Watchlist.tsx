import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWatchlist, removeFromWatchlist, updateThreshold } from '@/api/watchlist.api';
import GlassCard from '@/components/ui/GlassCard';
import CountdownTimer from '@/components/ui/CountdownTimer';
import RiskBadge from '@/components/ui/RiskBadge';
import { useToast } from '@/context/ToastContext';

export default function Watchlist() {
  const qc = useQueryClient();
  const { show } = useToast();
  const { data } = useQuery({ queryKey: ['watchlist'], queryFn: getWatchlist });
  const remove = useMutation({ mutationFn: (id: string) => removeFromWatchlist(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }) });
  const update = useMutation({ mutationFn: ({ id, km }: { id: string; km: number }) => updateThreshold(id, km), onSuccess: () => { show('Threshold saved', 'success'); qc.invalidateQueries({ queryKey: ['watchlist'] }); } });
  const items = data?.items || data || [];
  if (!items.length) return <div className="flex min-h-[45vh] items-center justify-center text-center text-slate-300">No asteroids watched yet. Start tracking objects from the NEO Feed.</div>;
  return (
    <div className="space-y-3">
      {items.map((neo: any) => (
        <GlassCard key={neo.nasaId || neo.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xl text-cyan-300">{neo.name}</div>
              <div className="text-sm text-slate-300">Next approach: <CountdownTimer targetDate={neo.closeApproachDate || new Date().toISOString()} /></div>
            </div>
            <RiskBadge label={(neo.riskLabel || 'WATCH').toUpperCase()} />
            <input defaultValue={neo.alertThresholdKm || 1000000} type="number" className="w-36 rounded bg-white/5 p-2" onBlur={(e) => update.mutate({ id: String(neo.nasaId || neo.id), km: Number(e.target.value) })} />
            <button className="rounded border border-red-400/30 px-3 py-2 text-red-300" onClick={() => remove.mutate(String(neo.nasaId || neo.id))}>Remove</button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
