import { useQuery } from '@tanstack/react-query';
import { getWatchlist } from '@/api/watchlist.api';
import OrbitScene from '@/components/3d/OrbitScene';
import { useState } from 'react';

export default function OrbitViewer() {
  const { data } = useQuery({ queryKey: ['watchlist-orbit'], queryFn: getWatchlist });
  const items = data?.items || data || [];
  const [id, setId] = useState('');
  const selected = items.find((n: any) => String(n.nasaId || n.id) === id) || items[0];
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-3">
        <div className="mb-2 flex items-center gap-2">
          <select value={id} onChange={(e) => setId(e.target.value)} className="rounded bg-white/10 p-2">
            {items.map((i: any) => <option key={i.nasaId || i.id} value={i.nasaId || i.id}>{i.name}</option>)}
          </select>
          <button onClick={() => setId('')} className="rounded border px-3 py-2">Reset view</button>
        </div>
        <OrbitScene asteroid={selected} />
      </div>
    </div>
  );
}
