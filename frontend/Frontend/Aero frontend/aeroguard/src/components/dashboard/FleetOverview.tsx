'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fleetHealthData } from '@/lib/mock/dashboard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border-subtle bg-elevated px-3 py-2 shadow-md">
      <p className="text-[12px] font-medium text-text-primary">{label}</p>
      <p className="text-[12px] text-accent">{payload[0].value.toFixed(1)}% health</p>
    </div>
  );
};

export default function FleetOverview() {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-5">
      <h3 className="mb-4 text-[15px] font-medium text-text-primary">Fleet Health Overview</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={fleetHealthData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="aircraft"
            width={130}
            tick={{ fill: '#A1A1AA', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="healthScore" radius={[0, 4, 4, 0]} barSize={20}>
            {fleetHealthData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.healthScore >= 95 ? '#16A34A' : entry.healthScore >= 90 ? '#2563EB' : '#D97706'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
