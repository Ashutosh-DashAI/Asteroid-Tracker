import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAlert, getAlerts, markAllRead, markRead } from '@/api/alerts.api';
import GlassCard from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatRelativeTime } from '@/utils/formatters';
import { useAlertStore } from '@/store/useAlertStore';
import { useToast } from '@/context/ToastContext';

export default function Alerts() {
  const qc = useQueryClient();
  const { show } = useToast();
  const { connectSocket, disconnectSocket, addAlert } = useAlertStore();
  const { data } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });
  const read = useMutation({ mutationFn: (id: string) => markRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) });
  const readAll = useMutation({ mutationFn: markAllRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) });
  const del = useMutation({ mutationFn: (id: string) => deleteAlert(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) });
  useEffect(() => { connectSocket(); return () => disconnectSocket(); }, [connectSocket, disconnectSocket]);
  useEffect(() => {
    const socket = useAlertStore.getState().socket;
    socket?.on('new_alert', (a: any) => { addAlert(a); show(`New alert: ${a?.asteroidName || 'NEO'}`, 'warning', 'View'); });
    return () => { socket?.off('new_alert'); };
  }, [addAlert, show]);
  const alerts = data?.items || data || [];
  const unread = alerts.filter((a: any) => !a.read).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-cyan-300">Alerts <span className="rounded-full bg-cyan-400/15 px-2 text-sm">{unread}</span></h1>
        <button onClick={() => readAll.mutate()} className="rounded border px-3 py-1">Mark All Read</button>
      </div>
      {alerts.map((alert: any) => (
        <GlassCard key={alert.id} className={!alert.read ? 'border-l-4 border-l-cyan-300' : ''}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="mb-1 flex items-center gap-2"><strong>{alert.asteroidName || alert.title}</strong><RiskBadge label={(alert.riskLabel || 'WATCH').toUpperCase()} /></div>
              <p className="text-sm text-slate-300">{alert.message}</p>
              <p className="text-xs text-slate-400">{formatRelativeTime(alert.createdAt || new Date().toISOString())}</p>
            </div>
            <div className="flex gap-2">
              {!alert.read && <button onClick={() => read.mutate(alert.id)} className="text-cyan-300">Read</button>}
              <button onClick={() => del.mutate(alert.id)} className="text-red-300">Delete</button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
