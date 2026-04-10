import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AsteroidCountChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  title?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--cyan)',
        boxShadow: 'var(--glow-cyan)',
      }}
    >
      <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="font-bold" style={{ color: 'var(--cyan)' }}>
        {payload[0].value} asteroids
      </p>
    </div>
  );
};

export const AsteroidCountChart: React.FC<AsteroidCountChartProps> = ({
  data,
  title = 'Asteroid Count Over Time',
}) => {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'var(--bg-deep)',
        border: '1px solid #ffffff08',
        boxShadow: 'var(--glow-card)',
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="date" stroke="#7a9bbf" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
          <YAxis stroke="#7a9bbf" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#areaGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#00d4ff', stroke: 'var(--bg-deep)', strokeWidth: 2 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AsteroidCountChart;