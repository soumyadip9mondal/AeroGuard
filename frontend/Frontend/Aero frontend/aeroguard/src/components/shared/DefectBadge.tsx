'use client';

import { DefectSeverity } from '@/types/defect';

const config: Record<DefectSeverity, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: '#DC2626', bg: 'rgba(220,38,38,0.10)', border: 'rgba(220,38,38,0.3)' },
  major:    { label: 'Major',    color: '#D97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.3)' },
  moderate: { label: 'Moderate', color: '#EA580C', bg: 'rgba(234,88,12,0.10)', border: 'rgba(234,88,12,0.3)' },
  minor:    { label: 'Minor',    color: '#16A34A', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.3)' },
};

export default function DefectBadge({ severity, size = 'sm' }: { severity: DefectSeverity; size?: 'sm' | 'md' }) {
  const c = config[severity];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        fontSize: size === 'sm' ? '11px' : '12px',
        letterSpacing: '0.02em',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  );
}
