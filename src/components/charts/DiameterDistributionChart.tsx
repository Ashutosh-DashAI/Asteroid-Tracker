import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DiameterDistributionChartProps {
  data: Array<{
    range: string;
    count: number;
  }>;
  title?: string;
}

export const DiameterDistributionChart: React.FC<DiameterDistributionChartProps> = ({
  data,
  title = 'Diameter Distribution',
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="range" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
          />
          <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} name="Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiameterDistributionChart;
