import { useEffect } from 'react';

// Props: type, message, onClose, actionLabel, onAction
export default function Toast({
  type,
  message,
  onClose,
  actionLabel,
  onAction,
}: {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  const color = { success: 'var(--safe-green)', warning: 'var(--watch-yellow)', error: 'var(--hazard-red)', info: 'var(--neon-cyan)' }[type];
  return (
    <div className="glass-card overflow-hidden rounded-xl border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span style={{ color }}>{message}</span>
        {actionLabel && <button onClick={onAction} className="text-cyan-300 underline">{actionLabel}</button>}
      </div>
      <div className="mt-2 h-1 w-full bg-white/10">
        <div className="h-full" style={{ width: '100%', background: color, animation: 'tickerScroll 5s linear reverse' }} />
      </div>
    </div>
  );
}
