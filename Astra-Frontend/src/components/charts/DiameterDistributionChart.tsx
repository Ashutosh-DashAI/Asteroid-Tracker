import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DiameterDistributionChartProps {
  data: Array<{
    range: string;
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
        border: '1px solid var(--purple)',
        boxShadow: '0 0 20px rgba(124,58,237,0.3)',
      }}
    >
      <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="font-bold" style={{ color: 'var(--purple)' }}>
        {payload[0].value} asteroids
      </p>
    </div>
  );
};

export const DiameterDistributionChart: React.FC<DiameterDistributionChartProps> = ({
  data,
  title = 'Diameter Distribution',
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
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="range" stroke="#7a9bbf" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
          <YAxis stroke="#7a9bbf" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} name="Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiameterDistributionChart;