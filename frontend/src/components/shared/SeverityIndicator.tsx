'use client';

const severityColors = ['#16A34A', '#D97706', '#EA580C', '#DC2626', '#DC2626'];

export default function SeverityIndicator({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-[2px]"
          style={{
            backgroundColor: i < level ? severityColors[Math.min(level - 1, 4)] : '#2A2A2A',
          }}
        />
      ))}
    </span>
  );
}
