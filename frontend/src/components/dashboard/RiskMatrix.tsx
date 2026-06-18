'use client';

import { riskMatrixData } from '@/lib/mock/dashboard';

const severityColors: Record<string, string> = {
  minor: '#16A34A',
  moderate: '#D97706',
  major: '#EA580C',
  critical: '#DC2626',
};

export default function RiskMatrix() {
  const maxVal = 15;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-5">
      <h3 className="mb-4 text-[15px] font-medium text-text-primary">Risk Analysis Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-3 py-2 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Component</th>
              {['Minor', 'Moderate', 'Major', 'Critical'].map((s) => (
                <th key={s} className="px-3 py-2 text-center text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {riskMatrixData.map((row) => (
              <tr key={row.component} className="border-t border-border-subtle">
                <td className="px-3 py-2 text-[13px] text-text-secondary">{row.component}</td>
                {(['minor', 'moderate', 'major', 'critical'] as const).map((sev) => {
                  const val = row[sev];
                  return (
                    <td key={sev} className="px-3 py-2 text-center">
                      <div
                        className="mx-auto flex h-8 w-12 items-center justify-center rounded text-[12px] font-medium"
                        style={{
                          backgroundColor: `${severityColors[sev]}${Math.round((val / maxVal) * 255).toString(16).padStart(2, '0')}`,
                          color: val > 3 ? '#FAFAFA' : severityColors[sev],
                        }}
                      >
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-3">
        {Object.entries(severityColors).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
