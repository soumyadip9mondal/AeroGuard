'use client';

import { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DBJob } from '@/lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border-subtle bg-elevated px-3 py-2 shadow-md">
      <p className="text-[12px] font-medium text-text-primary">{label}</p>
      <p className="text-[12px] text-accent">{payload[0].value.toFixed(1)}% completion</p>
    </div>
  );
};

function computeFleetData(jobs: DBJob[]) {
  const byFile: Record<string, { total: number; completed: number }> = {};

  for (const job of jobs) {
    const name = job.originalFilename || 'Unknown';
    if (!byFile[name]) byFile[name] = { total: 0, completed: 0 };
    byFile[name].total++;
    if (job.status === 'completed') byFile[name].completed++;
  }

  return Object.entries(byFile)
    .map(([name, data]) => ({
      aircraft: name.length > 20 ? name.slice(0, 18) + '...' : name,
      healthScore: data.total > 0 ? Math.round((data.completed / data.total) * 1000) / 10 : 0,
      inspections: data.total,
    }))
    .sort((a, b) => b.inspections - a.inspections)
    .slice(0, 8);
}

export default function FleetOverview({ jobs }: { jobs: DBJob[] }) {
  const data = computeFleetData(jobs);

  /* ResizeObserver — dynamically compute YAxis width based on container width */
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Clamp YAxis width: 30% of container, min 70px, max 130px */
  const yAxisWidth = Math.min(130, Math.max(70, containerWidth * 0.3));
  /* Scale font size with container */
  const tickFontSize = Math.min(12, Math.max(9, containerWidth * 0.03));

  return (
    <div className="card-elevated p-4 sm:p-5 h-full flex flex-col">
      <h3 className="mb-4 text-[15px] font-medium text-text-primary">File Health Overview</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[240px] sm:h-[280px] text-[13px] text-text-tertiary">
          No data available
        </div>
      ) : (
        <div ref={containerRef}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="aircraft"
                width={yAxisWidth}
                tick={{ fill: '#A1A1AA', fontSize: tickFontSize }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="healthScore" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.healthScore >= 95 ? '#16A34A' : entry.healthScore >= 90 ? '#2563EB' : '#D97706'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
