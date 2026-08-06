import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface HazardPieChartProps {
  hazardousCount: number;
  nonHazardousCount: number;
  title?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${data?.name === 'Hazardous' ? 'var(--hazard)' : 'var(--safe)'}`,
        boxShadow: data?.name === 'Hazardous' ? 'var(--glow-hazard)' : 'none',
      }}
    >
      <p className="font-bold" style={{ color: data?.name === 'Hazardous' ? 'var(--hazard)' : 'var(--safe)' }}>
        {data?.name}: {data?.value}
      </p>
    </div>
  );
};

export const HazardPieChart: React.FC<HazardPieChartProps> = ({
  hazardousCount,
  nonHazardousCount,
  title = 'Hazardous vs Non-Hazardous',
}) => {
  const total = hazardousCount + nonHazardousCount;
  const hazardousPercent = total > 0 ? ((hazardousCount / total) * 100).toFixed(1) : '0';

  const data = [
    { name: 'Hazardous', value: hazardousCount, color: '#ff4444' },
    { name: 'Non-Hazardous', value: nonHazardousCount, color: '#00ff88' },
  ];

  return (
    <div
      className="rounded-2xl p-6 relative"
      style={{
        background: 'var(--bg-deep)',
        border: '1px solid #ffffff08',
        boxShadow: 'var(--glow-card)',
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={2}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter: entry.name === 'Hazardous' ? 'drop-shadow(0 0 8px rgba(255,68,68,0.5))' : 'none',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '8px' }}>
          <span className="text-3xl font-bold" style={{ color: 'var(--hazard)', textShadow: 'var(--glow-hazard)' }}>
            {hazardousPercent}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Hazardous</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}40` }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HazardPieChart;