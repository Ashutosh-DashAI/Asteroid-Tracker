export const formatDistance = (km: number) => {
  if (!Number.isFinite(km)) return '--';
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M km`;
  return `${Math.round(km).toLocaleString()} km`;
};

export const formatVelocity = (kms: number) => `${Number(kms || 0).toFixed(1)} km/s`;

export const formatDiameter = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export const formatRelativeTime = (isoString: string) => {
  const now = new Date().getTime();
  const target = new Date(isoString).getTime();
  const diff = target - now;
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);
  if (days > 0) return diff > 0 ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`;
  return diff > 0 ? `in ${hours} hour${hours !== 1 ? 's' : ''}` : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
};

export const formatRiskColor = (label: string) =>
  ({
    SAFE: '#22c55e',
    WATCH: '#eab308',
    WARNING: '#f97316',
    CRITICAL: '#ef4444',
  }[String(label).toUpperCase()] || '#64748b');
