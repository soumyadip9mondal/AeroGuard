'use client';

import { useEffect, useRef, useState } from 'react';
import { type LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  format: 'number' | 'percentage' | 'currency';
  delta: number;
  icon: LucideIcon;
}

function formatValue(value: number, format: string): string {
  if (format === 'percentage') return `${value.toFixed(1)}%`;
  if (format === 'currency') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function KPICard({ label, value, format, delta, icon: Icon }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(eased * value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  const isPositive = delta >= 0;
  const deltaIsGood = label.includes('Cost') || label.includes('Work Orders') || label.includes('Critical')
    ? !isPositive
    : isPositive;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-5 transition-colors hover:border-border-default">
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-text-tertiary"
          style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          {label}
        </span>
        <Icon className="h-4 w-4 text-text-tertiary" />
      </div>

      <div className="mb-2 text-[28px] font-medium leading-none tracking-tight text-text-primary">
        {formatValue(displayValue, format)}
      </div>

      <div className="flex items-center gap-1 text-[13px]" style={{ color: deltaIsGood ? '#16A34A' : '#DC2626' }}>
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        <span>{Math.abs(delta).toFixed(1)}% vs last week</span>
      </div>
    </div>
  );
}
