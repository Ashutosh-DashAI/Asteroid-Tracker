import { useEffect, useMemo, useState } from 'react';

// Props: targetDate
export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { d, h, m, s, urgent } = useMemo(() => {
    const diff = Math.max(0, new Date(targetDate).getTime() - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, urgent: diff < 86400000 };
  }, [targetDate, now]);

  const unit = (n: number) => (
    <div className={`glass-card min-w-10 rounded-lg px-2 py-1 text-center font-mono text-xs ${urgent ? 'animate-pulse text-red-400' : 'text-cyan-300'}`}>
      {String(n).padStart(2, '0')}
    </div>
  );
  return <div className="flex items-center gap-1">{unit(d)}:{unit(h)}:{unit(m)}:{unit(s)}</div>;
}
