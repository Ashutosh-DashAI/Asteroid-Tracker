import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface HazardPieChartProps {
  hazardousCount: number;
  nonHazardousCount: number;
  title?: string;
}

export const HazardPieChart: React.FC<HazardPieChartProps> = ({
  hazardousCount,
  nonHazardousCount,
  title = 'Hazardous vs Non-Hazardous',
}) => {
  const data = [
    { name: 'Hazardous', value: hazardousCount, color: '#ef4444' },
    { name: 'Non-Hazardous', value: nonHazardousCount, color: '#10b981' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, value, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HazardPieChart;
