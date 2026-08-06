import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: number;
  delay?: number;
  variant?: 'default' | 'hazardous';
  sparklineData?: number[];
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  delay = 0,
  variant = 'default',
  sparklineData,
  className = '',
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const animatedValue = useCountUp(Math.round(numericValue), 800, typeof value === 'number');

  const isHazardous = variant === 'hazardous';

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay },
    },
  };

  // Generate tiny sparkline data if not provided
  const sparkData = sparklineData || Array.from({ length: 7 }, () => Math.random() * numericValue * 0.3 + numericValue * 0.7);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={`group ${className}`}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-6 transition-all duration-200"
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid #ffffff08',
          boxShadow: 'var(--glow-card)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#ffffff15';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#ffffff08';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p
                className="text-sm font-medium uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }}
              >
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3
                  className="text-5xl font-bold"
                  style={{
                    color: isHazardous ? 'var(--hazard)' : 'var(--cyan)',
                    textShadow: isHazardous ? 'var(--glow-hazard)' : 'var(--glow-cyan)',
                  }}
                >
                  {typeof value === 'number' ? animatedValue : value}
                </h3>
                {unit && (
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {unit}
                  </span>
                )}
              </div>
            </div>
            {icon && (
              <div
                className="opacity-40 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: isHazardous ? 'var(--hazard)' : 'var(--cyan)' }}
              >
                {icon}
              </div>
            )}
          </div>

          {trend !== undefined && (
            <div
              className="text-xs font-semibold"
              style={{ color: trend > 0 ? 'var(--safe)' : 'var(--hazard)' }}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </div>
          )}
        </div>

        {/* Sparkline at bottom */}
        {numericValue > 0 && (
          <div className="mt-2 h-[40px] opacity-30 group-hover:opacity-60 transition-opacity duration-200">
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={sparkData.map((v, i) => ({ v }))}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={isHazardous ? 'var(--hazard)' : 'var(--cyan)'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;