import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAsteroidMessages, getGlobalMessages, sendMessage } from '@/api/chat.api';
import { useAuthStore } from '@/store/authStore';

export default function ChatPanel({ nasaId }: { nasaId?: string }) {
  const [text, setText] = useState('');
  const [local, setLocal] = useState<any[]>([]);
  const { user } = useAuthStore();
  const room = nasaId || 'global';
  const { data, refetch } = useQuery({ queryKey: ['chat', room], queryFn: () => (nasaId ? getAsteroidMessages(nasaId) : getGlobalMessages()) });
  useEffect(() => { setLocal(data?.items || data || []); }, [data]);
  return (
    <div className="glass-card rounded-2xl p-3">
      <h3 className="mb-2 text-cyan-300">Community Thread</h3>
      <div className="max-h-72 space-y-2 overflow-auto rounded-lg border border-white/10 p-2">
        {local.map((m: any) => (
          <div key={m.id} className={`max-w-[80%] rounded-xl p-2 text-sm ${m.username === user?.name ? 'ml-auto bg-blue-700/60' : 'bg-white/10'}`}>
            <div className="mb-1 text-xs text-slate-400">{m.username || 'User'}</div>{m.content}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg bg-white/5 p-2" />
        <button className="rounded bg-cyan-500/20 px-3" onClick={async () => { if (!text.trim()) return; await sendMessage(room, text); setText(''); refetch(); }}>Send</button>
      </div>
    </div>
  );
}
