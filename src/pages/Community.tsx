import { useQuery } from '@tanstack/react-query';
import { getWatchlist } from '@/api/watchlist.api';
import { useState } from 'react';
import ChatPanel from '@/components/chat/ChatPanel';

export default function Community() {
  const { data } = useQuery({ queryKey: ['watchlist-threads'], queryFn: getWatchlist });
  const items = data?.items || data || [];
  const [room, setRoom] = useState('global');
  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <div className="glass-card rounded-2xl p-3">
        <button onClick={() => setRoom('global')} className={`mb-2 w-full rounded p-2 text-left ${room === 'global' ? 'bg-cyan-400/10' : 'hover:bg-white/5'}`}>Global Thread</button>
        {items.map((i: any) => (
          <button key={i.nasaId || i.id} onClick={() => setRoom(String(i.nasaId || i.id))} className={`mb-2 w-full rounded p-2 text-left ${room === String(i.nasaId || i.id) ? 'bg-cyan-400/10' : 'hover:bg-white/5'}`}>
            {i.name}
          </button>
        ))}
      </div>
      <ChatPanel nasaId={room === 'global' ? undefined : room} />
    </div>
  );
}
