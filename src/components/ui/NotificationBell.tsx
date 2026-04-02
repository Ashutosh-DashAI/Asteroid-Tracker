import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getAlertCount, getAlerts } from '@/api/alerts.api';

// Props: none
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: count } = useQuery({ queryKey: ['alert-count'], queryFn: getAlertCount, refetchInterval: 60000 });
  const { data: alerts } = useQuery({ queryKey: ['alerts-last5'], queryFn: getAlerts, enabled: open });
  const unread = Number(count?.count || count?.unread || 0);
  const listSource = Array.isArray(alerts?.items) ? alerts.items : Array.isArray(alerts) ? alerts : [];
  const list = listSource.slice(0, 5);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative rounded-lg p-2 hover:bg-cyan-300/10">
        <Bell className="text-cyan-300" size={20} />
        {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px]">{unread}</span>}
      </button>
      {open && (
        <div className="glass-card absolute right-0 z-40 mt-2 w-80 rounded-xl p-2">
          {list.map((a: any) => <div className="border-b border-white/10 p-2 text-sm last:border-b-0" key={a.id}>{a.message || a.title}</div>)}
        </div>
      )}
    </div>
  );
}
