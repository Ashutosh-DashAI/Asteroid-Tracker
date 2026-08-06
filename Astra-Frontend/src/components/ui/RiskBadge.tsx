import { motion } from 'framer-motion';
import { formatRiskColor } from '@/utils/formatters';

// Props: label, score, size
export default function RiskBadge({ label, score, size = 'sm' }: { label: 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL'; score?: number; size?: 'sm' | 'md'; }) {
  const color = formatRiskColor(label);
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold uppercase tracking-wider ${size === 'md' ? 'text-sm' : 'text-xs'}`}
      style={{ color, borderColor: color, boxShadow: `0 0 12px ${color}50`, textShadow: `0 0 8px ${color}` }}
    >
      {label}{typeof score === 'number' ? ` ${score}` : ''}
    </motion.span>
  );
}
