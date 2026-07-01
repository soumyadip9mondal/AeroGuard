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
  iconColor?: string;
  shadowColor?: string;
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

export default function KPICard({ label, value, format, delta, icon: Icon, iconColor, shadowColor }: KPICardProps) {
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
    /* Responsive padding: p-4 on mobile, p-5 on sm+ */
    <div className={`stat-card transition-all duration-300 hover:-translate-y-1 ${shadowColor || 'hover:shadow-lg'}`}>
      <div className="mb-2 sm:mb-3 flex flex-nowrap items-center justify-between gap-2">
        <span
          className="stat-label truncate"
          title={label}
        >
          {label}
        </span>
        <Icon className={`h-4 w-4 shrink-0 ${iconColor || 'text-text-tertiary'}`} />
      </div>

      {/* Responsive value font */}
      <div className="stat-value mb-1.5 sm:mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatValue(displayValue, format)}
      </div>

      <div className="stat-delta flex items-center gap-1 whitespace-nowrap overflow-hidden" style={{ color: deltaIsGood ? 'var(--color-success)' : 'var(--color-danger)' }}>
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        <span>{Math.abs(delta).toFixed(1)}% vs last week</span>
      </div>
    </div>
  );
}
